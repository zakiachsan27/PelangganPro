-- ============================================
-- 015: AI Agent Tables
-- ============================================

-- ============================================
-- 1. Agent Conversations
-- ============================================
CREATE TABLE agent_conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  intent      TEXT,
  entities    JSONB DEFAULT '{}',
  actions     JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-delete conversations older than 1 month
CREATE INDEX idx_agent_conversations_created_at ON agent_conversations(created_at);

-- ============================================
-- 2. Agent Actions (Audit Log)
-- ============================================
CREATE TABLE agent_actions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id   UUID REFERENCES agent_conversations(id) ON DELETE SET NULL,
  action_type       TEXT NOT NULL,
  target_entity     TEXT,
  target_id         UUID,
  payload           JSONB DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message     TEXT,
  confirmed         BOOLEAN NOT NULL DEFAULT false,
  executed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. Indexes
-- ============================================
CREATE INDEX idx_agent_conversations_org ON agent_conversations(org_id);
CREATE INDEX idx_agent_conversations_user ON agent_conversations(user_id);
CREATE INDEX idx_agent_conversations_session ON agent_conversations(session_id);
CREATE INDEX idx_agent_actions_org ON agent_actions(org_id);
CREATE INDEX idx_agent_actions_user ON agent_actions(user_id);
CREATE INDEX idx_agent_actions_status ON agent_actions(status);
CREATE INDEX idx_agent_actions_created ON agent_actions(created_at);

-- ============================================
-- 4. RLS Policies
-- ============================================
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view their own agent conversations"
ON agent_conversations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own conversations
CREATE POLICY "Users can create their own agent conversations"
ON agent_conversations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can view their own actions
CREATE POLICY "Users can view their own agent actions"
ON agent_actions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own actions
CREATE POLICY "Users can create their own agent actions"
ON agent_actions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own actions (for confirmation)
CREATE POLICY "Users can update their own agent actions"
ON agent_actions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 5. Cleanup Function (Auto-delete old conversations)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_agent_conversations()
RETURNS void AS $$
BEGIN
  DELETE FROM agent_conversations
  WHERE created_at < now() - interval '1 month';
  
  DELETE FROM agent_actions
  WHERE created_at < now() - interval '1 month';
END;
$$ LANGUAGE plpgsql;

-- Run cleanup daily via cron (optional, can be scheduled in Supabase)
-- SELECT cron.schedule('cleanup-agent-conversations', '0 0 * * *', 'SELECT cleanup_old_agent_conversations()');
