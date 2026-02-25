-- ============================================
-- WhatsApp tables
-- ============================================

-- wa_sessions: One row per WA Web connection
CREATE TABLE wa_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL DEFAULT 'bailey' CHECK (provider IN ('bailey', 'qontak')),
  label         TEXT NOT NULL,
  phone_number  TEXT,
  status        TEXT NOT NULL DEFAULT 'disconnected'
                CHECK (status IN ('disconnected', 'connecting', 'qr_pending', 'connected')),
  connected_at  TIMESTAMPTZ,
  qr_code_data  TEXT,
  api_key       TEXT,
  auth_state_key TEXT,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- wa_conversations: One per unique chat thread
CREATE TABLE wa_conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  session_id    UUID NOT NULL REFERENCES wa_sessions(id) ON DELETE CASCADE,
  contact_id    UUID,
  remote_jid    TEXT NOT NULL,
  remote_name   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'resolved', 'pending')),
  assigned_to   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_message_preview TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count  INTEGER NOT NULL DEFAULT 0,
  provider      TEXT NOT NULL DEFAULT 'bailey' CHECK (provider IN ('bailey', 'qontak')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, remote_jid)
);

-- wa_messages: Every individual message
CREATE TABLE wa_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES wa_conversations(id) ON DELETE CASCADE,
  wa_message_id     TEXT,
  direction         TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  type              TEXT NOT NULL DEFAULT 'text'
                    CHECK (type IN ('text', 'image', 'document', 'audio', 'video', 'sticker', 'location', 'contact')),
  body              TEXT DEFAULT '',
  media_url         TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sender_name       TEXT,
  sender_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  quoted_message_id UUID,
  raw_data          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- wa_auth_states: Baileys credential storage
CREATE TABLE wa_auth_states (
  session_id UUID NOT NULL REFERENCES wa_sessions(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  data       JSONB NOT NULL,
  PRIMARY KEY (session_id, key)
);

-- wa_quick_replies: Reusable message templates
CREATE TABLE wa_quick_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'General',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_wa_sessions_org ON wa_sessions(org_id);
CREATE INDEX idx_wa_conv_org ON wa_conversations(org_id);
CREATE INDEX idx_wa_conv_session ON wa_conversations(session_id);
CREATE INDEX idx_wa_conv_contact ON wa_conversations(contact_id);
CREATE INDEX idx_wa_conv_last_msg ON wa_conversations(last_message_at DESC);
CREATE INDEX idx_wa_msg_conv ON wa_messages(conversation_id, created_at);
CREATE INDEX idx_wa_msg_wa_id ON wa_messages(wa_message_id);
CREATE INDEX idx_wa_qr_org ON wa_quick_replies(org_id);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE wa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_quick_replies ENABLE ROW LEVEL SECURITY;

-- Sessions: users can view their org's sessions
CREATE POLICY "Users can view own org sessions" ON wa_sessions
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Conversations: users can view their org's conversations
CREATE POLICY "Users can view own org conversations" ON wa_conversations
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Conversations: users can update their org's conversations (assign, status change)
CREATE POLICY "Users can update own org conversations" ON wa_conversations
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Messages: users can view messages from their org's conversations
CREATE POLICY "Users can view own org messages" ON wa_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM wa_conversations
      WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Quick replies: users can CRUD their org's quick replies
CREATE POLICY "Users can view own org quick replies" ON wa_quick_replies
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own org quick replies" ON wa_quick_replies
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own org quick replies" ON wa_quick_replies
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete own org quick replies" ON wa_quick_replies
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================
-- Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE wa_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE wa_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE wa_messages;

-- ============================================
-- Triggers
-- ============================================
CREATE TRIGGER tr_wa_sessions_updated
  BEFORE UPDATE ON wa_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_wa_conversations_updated
  BEFORE UPDATE ON wa_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_wa_quick_replies_updated
  BEFORE UPDATE ON wa_quick_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RPC Functions
-- ============================================

-- Atomic unread increment
CREATE OR REPLACE FUNCTION increment_unread(conv_id UUID)
RETURNS void AS $$
  UPDATE wa_conversations
  SET unread_count = unread_count + 1, updated_at = now()
  WHERE id = conv_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Reset unread count
CREATE OR REPLACE FUNCTION reset_unread(conv_id UUID)
RETURNS void AS $$
  UPDATE wa_conversations
  SET unread_count = 0, updated_at = now()
  WHERE id = conv_id;
$$ LANGUAGE sql SECURITY DEFINER;
