-- ============================================
-- 009: Core CRM tables
-- companies, tags, contacts, pipelines, deals,
-- notes, activities, tasks, products, tickets
-- ============================================

-- ============================================
-- 1. Companies
-- ============================================
CREATE TABLE companies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  industry   TEXT,
  size       TEXT,
  website    TEXT,
  address    TEXT,
  city       TEXT,
  phone      TEXT,
  email      TEXT,
  notes      TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. Tags
-- ============================================
CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

-- ============================================
-- 3. Contacts
-- ============================================
CREATE TABLE contacts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_id     UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name     TEXT NOT NULL,
  last_name      TEXT,
  email          TEXT,
  phone          TEXT,
  whatsapp       TEXT,
  position       TEXT,
  source         TEXT CHECK (source IS NULL OR source IN ('whatsapp','instagram','web','referral','tokopedia','shopee','import','manual')),
  status         TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead','active','inactive','customer')),
  custom_fields  JSONB DEFAULT '{}',
  avatar_url     TEXT,
  owner_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lifetime_value NUMERIC NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. Contact–Tag join table
-- ============================================
CREATE TABLE contact_tags (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

-- ============================================
-- 5. Pipelines
-- ============================================
CREATE TABLE pipelines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. Pipeline Stages
-- ============================================
CREATE TABLE pipeline_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  is_won      BOOLEAN NOT NULL DEFAULT false,
  is_lost     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 7. Deals
-- ============================================
CREATE TABLE deals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_id         UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id            UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  contact_id          UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES companies(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  value               NUMERIC NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'IDR',
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','won','lost')),
  won_lost_reason     TEXT,
  expected_close_date DATE,
  actual_close_date   DATE,
  source              TEXT CHECK (source IS NULL OR source IN ('whatsapp','instagram','web','referral','tokopedia','shopee','import','manual')),
  position            INTEGER NOT NULL DEFAULT 0,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 8. Deal–Tag join table
-- ============================================
CREATE TABLE deal_tags (
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (deal_id, tag_id)
);

-- ============================================
-- 9. Notes
-- ============================================
CREATE TABLE notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  deal_id    UUID REFERENCES deals(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 10. Activities (audit log)
-- ============================================
CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact','deal','company','task','ticket')),
  entity_id   UUID NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('created','updated','stage_changed','note_added','won','lost','converted','assigned','tagged')),
  details     JSONB DEFAULT '{}',
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 11. Tasks
-- ============================================
CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  due_date     DATE,
  priority     TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status       TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','cancelled')),
  assignee_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id      UUID REFERENCES deals(id) ON DELETE SET NULL,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 12. Products
-- ============================================
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sku         TEXT NOT NULL,
  price       NUMERIC NOT NULL DEFAULT 0,
  category    TEXT NOT NULL DEFAULT '',
  description TEXT,
  stock       INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, sku)
);

-- ============================================
-- 13. Tickets
-- ============================================
CREATE TABLE tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'pertanyaan'
              CHECK (category IN ('bug','feature_request','pertanyaan','keluhan_pelanggan','internal')),
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','in_progress','waiting','resolved','closed')),
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resolved_at TIMESTAMPTZ,
  closed_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 14. Ticket Comments
-- ============================================
CREATE TABLE ticket_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Add FK from wa_conversations.contact_id → contacts
-- ============================================
-- The column already exists (migration 002) but has no FK constraint.
ALTER TABLE wa_conversations
  ADD CONSTRAINT fk_wa_conversations_contact
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- ============================================
-- Indexes
-- ============================================
-- Companies
CREATE INDEX idx_companies_org ON companies(org_id);

-- Tags
CREATE INDEX idx_tags_org ON tags(org_id);

-- Contacts
CREATE INDEX idx_contacts_org ON contacts(org_id);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
CREATE INDEX idx_contacts_status ON contacts(org_id, status);
CREATE INDEX idx_contacts_whatsapp ON contacts(whatsapp);
CREATE INDEX idx_contacts_phone ON contacts(phone);

-- Pipelines
CREATE INDEX idx_pipelines_org ON pipelines(org_id);

-- Pipeline stages
CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id, position);

-- Deals
CREATE INDEX idx_deals_org ON deals(org_id);
CREATE INDEX idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_company ON deals(company_id);
CREATE INDEX idx_deals_status ON deals(org_id, status);

-- Notes
CREATE INDEX idx_notes_contact ON notes(contact_id);
CREATE INDEX idx_notes_deal ON notes(deal_id);
CREATE INDEX idx_notes_company ON notes(company_id);

-- Activities
CREATE INDEX idx_activities_org ON activities(org_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);

-- Tasks
CREATE INDEX idx_tasks_org ON tasks(org_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_contact ON tasks(contact_id);
CREATE INDEX idx_tasks_deal ON tasks(deal_id);
CREATE INDEX idx_tasks_status ON tasks(org_id, status);

-- Products
CREATE INDEX idx_products_org ON products(org_id);

-- Tickets
CREATE INDEX idx_tickets_org ON tickets(org_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_contact ON tickets(contact_id);
CREATE INDEX idx_tickets_status ON tickets(org_id, status);

-- Ticket comments
CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- ============================================
-- RLS — all tables use get_my_org_id()
-- ============================================

-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON companies FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON companies FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON companies FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON companies FOR DELETE USING (org_id = get_my_org_id());

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON tags FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON tags FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON tags FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON tags FOR DELETE USING (org_id = get_my_org_id());

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON contacts FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON contacts FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON contacts FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON contacts FOR DELETE USING (org_id = get_my_org_id());

-- Contact tags — inherit from contacts
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON contact_tags FOR SELECT USING (
  contact_id IN (SELECT id FROM contacts WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_insert" ON contact_tags FOR INSERT WITH CHECK (
  contact_id IN (SELECT id FROM contacts WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_delete" ON contact_tags FOR DELETE USING (
  contact_id IN (SELECT id FROM contacts WHERE org_id = get_my_org_id())
);

-- Pipelines
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON pipelines FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON pipelines FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON pipelines FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON pipelines FOR DELETE USING (org_id = get_my_org_id());

-- Pipeline stages — inherit from pipelines
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON pipeline_stages FOR SELECT USING (
  pipeline_id IN (SELECT id FROM pipelines WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_insert" ON pipeline_stages FOR INSERT WITH CHECK (
  pipeline_id IN (SELECT id FROM pipelines WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_update" ON pipeline_stages FOR UPDATE USING (
  pipeline_id IN (SELECT id FROM pipelines WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_delete" ON pipeline_stages FOR DELETE USING (
  pipeline_id IN (SELECT id FROM pipelines WHERE org_id = get_my_org_id())
);

-- Deals
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON deals FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON deals FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON deals FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON deals FOR DELETE USING (org_id = get_my_org_id());

-- Deal tags — inherit from deals
ALTER TABLE deal_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON deal_tags FOR SELECT USING (
  deal_id IN (SELECT id FROM deals WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_insert" ON deal_tags FOR INSERT WITH CHECK (
  deal_id IN (SELECT id FROM deals WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_delete" ON deal_tags FOR DELETE USING (
  deal_id IN (SELECT id FROM deals WHERE org_id = get_my_org_id())
);

-- Notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON notes FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON notes FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON notes FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON notes FOR DELETE USING (org_id = get_my_org_id());

-- Activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON activities FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON activities FOR INSERT WITH CHECK (org_id = get_my_org_id());

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON tasks FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON tasks FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON tasks FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON tasks FOR DELETE USING (org_id = get_my_org_id());

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON products FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON products FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON products FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON products FOR DELETE USING (org_id = get_my_org_id());

-- Tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON tickets FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "org_insert" ON tickets FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "org_update" ON tickets FOR UPDATE USING (org_id = get_my_org_id());
CREATE POLICY "org_delete" ON tickets FOR DELETE USING (org_id = get_my_org_id());

-- Ticket comments — inherit from tickets
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON ticket_comments FOR SELECT USING (
  ticket_id IN (SELECT id FROM tickets WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_insert" ON ticket_comments FOR INSERT WITH CHECK (
  ticket_id IN (SELECT id FROM tickets WHERE org_id = get_my_org_id())
);
CREATE POLICY "org_delete" ON ticket_comments FOR DELETE USING (
  ticket_id IN (SELECT id FROM tickets WHERE org_id = get_my_org_id())
);

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE TRIGGER tr_companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_contacts_updated BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_pipelines_updated BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_deals_updated BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_notes_updated BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_tickets_updated BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Seed data — default pipeline & tags
-- Uses a CTE so org_id is dynamically resolved
-- ============================================
DO $$
DECLARE
  _org_id UUID;
  _pipeline_id UUID;
BEGIN
  -- Get the first organization (single-tenant for now)
  SELECT id INTO _org_id FROM organizations LIMIT 1;
  IF _org_id IS NULL THEN
    RAISE NOTICE 'No organization found, skipping seed data';
    RETURN;
  END IF;

  -- Default pipeline
  INSERT INTO pipelines (id, org_id, name, is_default)
  VALUES (gen_random_uuid(), _org_id, 'Sales Pipeline', true)
  RETURNING id INTO _pipeline_id;

  -- Default stages
  INSERT INTO pipeline_stages (pipeline_id, name, position, color, is_won, is_lost) VALUES
    (_pipeline_id, 'Prospek',      0, '#6366f1', false, false),
    (_pipeline_id, 'Kualifikasi',  1, '#8b5cf6', false, false),
    (_pipeline_id, 'Proposal',     2, '#a855f7', false, false),
    (_pipeline_id, 'Negosiasi',    3, '#f59e0b', false, false),
    (_pipeline_id, 'Closed Won',   4, '#22c55e', true,  false),
    (_pipeline_id, 'Closed Lost',  5, '#ef4444', false, true);

  -- Default tags
  INSERT INTO tags (org_id, name, color) VALUES
    (_org_id, 'VIP',        '#f59e0b'),
    (_org_id, 'Hot Lead',   '#ef4444'),
    (_org_id, 'Follow Up',  '#3b82f6'),
    (_org_id, 'Prioritas',  '#8b5cf6');
END;
$$;
