-- ============================================
-- 010: Broadcast & RFM tables
-- broadcast_templates, broadcast_campaigns, contact_rfm
-- ============================================

-- ============================================
-- 1. Broadcast Templates
-- ============================================
CREATE TABLE broadcast_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  channel        TEXT NOT NULL CHECK (channel IN ('whatsapp','email')),
  subject        TEXT,
  body           TEXT NOT NULL,
  target_segment TEXT NOT NULL DEFAULT 'all'
                 CHECK (target_segment IN ('champions','loyal','potential','new_customers','at_risk','hibernating','lost','all')),
  created_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. Broadcast Campaigns
-- ============================================
CREATE TABLE broadcast_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('whatsapp','email')),
  target_segments JSONB NOT NULL DEFAULT '[]',
  target_count    INTEGER NOT NULL DEFAULT 0,
  message_body    TEXT NOT NULL,
  subject         TEXT,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','sending','sent','failed')),
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  stats           JSONB NOT NULL DEFAULT '{"sent":0,"delivered":0,"read":0,"failed":0}',
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. Contact RFM (one row per contact)
-- ============================================
CREATE TABLE contact_rfm (
  contact_id         UUID PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,
  segment            TEXT NOT NULL CHECK (segment IN ('champions','loyal','potential','new_customers','at_risk','hibernating','lost')),
  scores             JSONB NOT NULL DEFAULT '{}',
  total_purchases    INTEGER NOT NULL DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  total_spent        NUMERIC NOT NULL DEFAULT 0,
  avg_order_value    NUMERIC NOT NULL DEFAULT 0,
  calculated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_broadcast_templates_org ON broadcast_templates(org_id);
CREATE INDEX idx_broadcast_templates_channel ON broadcast_templates(org_id, channel);

CREATE INDEX idx_broadcast_campaigns_org ON broadcast_campaigns(org_id);
CREATE INDEX idx_broadcast_campaigns_status ON broadcast_campaigns(org_id, status);
CREATE INDEX idx_broadcast_campaigns_channel ON broadcast_campaigns(org_id, channel);

CREATE INDEX idx_contact_rfm_segment ON contact_rfm(segment);

-- ============================================
-- RLS
-- ============================================

-- Broadcast Templates
ALTER TABLE broadcast_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON broadcast_templates FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON broadcast_templates FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON broadcast_templates FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON broadcast_templates FOR DELETE USING (org_id = get_my_org_id());

-- Broadcast Campaigns
ALTER TABLE broadcast_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON broadcast_campaigns FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON broadcast_campaigns FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON broadcast_campaigns FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON broadcast_campaigns FOR DELETE USING (org_id = get_my_org_id());

-- Contact RFM — inherits from contacts
ALTER TABLE contact_rfm ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON contact_rfm FOR SELECT USING (
  contact_id IN (SELECT id FROM contacts WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_insert" ON contact_rfm FOR INSERT WITH CHECK (
  contact_id IN (SELECT id FROM contacts WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_update" ON contact_rfm FOR UPDATE USING (
  contact_id IN (SELECT id FROM contacts WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_delete" ON contact_rfm FOR DELETE USING (
  contact_id IN (SELECT id FROM contacts WHERE org_id = get_my_org_id())
);

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE TRIGGER tr_broadcast_templates_updated BEFORE UPDATE ON broadcast_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_broadcast_campaigns_updated BEFORE UPDATE ON broadcast_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
