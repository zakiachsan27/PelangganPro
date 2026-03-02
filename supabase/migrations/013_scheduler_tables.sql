-- ============================================
-- 013: Contact Groups and Message Scheduler Tables
-- ============================================

-- ============================================
-- 1. Contact Groups
-- ============================================
CREATE TABLE contact_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  contact_count INTEGER NOT NULL DEFAULT 0,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

-- ============================================
-- 2. Contact Group Members (Many-to-Many)
-- ============================================
CREATE TABLE contact_group_members (
  group_id    UUID NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
  contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (group_id, contact_id)
);

-- ============================================
-- 3. Message Schedulers
-- ============================================
CREATE TABLE message_schedulers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  message           TEXT NOT NULL,
  target_type       TEXT NOT NULL CHECK (target_type IN ('contacts', 'group')),
  target_contacts   JSONB DEFAULT '[]', -- Array of contact IDs when target_type = 'contacts'
  target_group_id   UUID REFERENCES contact_groups(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'paused', 'completed', 'failed')),
  interval_seconds  INTEGER NOT NULL DEFAULT 45 CHECK (interval_seconds >= 45),
  min_interval      INTEGER, -- Random min interval (e.g., 45)
  max_interval      INTEGER, -- Random max interval (e.g., 60)
  sent_count        INTEGER NOT NULL DEFAULT 0,
  total_count       INTEGER NOT NULL DEFAULT 0,
  failed_count      INTEGER NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  waha_session      TEXT, -- WAHA session name used
  created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. Scheduler Logs (History)
-- ============================================
CREATE TABLE message_scheduler_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduler_id    UUID NOT NULL REFERENCES message_schedulers(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
  phone           TEXT NOT NULL,
  message         TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'retrying')),
  error_message   TEXT,
  waha_response   JSONB,
  sent_at         TIMESTAMPTZ,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. Indexes
-- ============================================
CREATE INDEX idx_contact_groups_org ON contact_groups(org_id);
CREATE INDEX idx_contact_group_members_group ON contact_group_members(group_id);
CREATE INDEX idx_contact_group_members_contact ON contact_group_members(contact_id);
CREATE INDEX idx_message_schedulers_org ON message_schedulers(org_id);
CREATE INDEX idx_message_schedulers_status ON message_schedulers(status);
CREATE INDEX idx_scheduler_logs_scheduler ON message_scheduler_logs(scheduler_id);
CREATE INDEX idx_scheduler_logs_status ON message_scheduler_logs(status);
CREATE INDEX idx_scheduler_logs_created ON message_scheduler_logs(created_at);

-- ============================================
-- 6. Trigger to update contact_count
-- ============================================
CREATE OR REPLACE FUNCTION update_contact_group_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contact_groups 
    SET contact_count = contact_count + 1,
        updated_at = now()
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contact_groups 
    SET contact_count = contact_count - 1,
        updated_at = now()
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_group_count
AFTER INSERT OR DELETE ON contact_group_members
FOR EACH ROW
EXECUTE FUNCTION update_contact_group_count();

-- ============================================
-- 7. RLS Policies
-- ============================================
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_schedulers ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_scheduler_logs ENABLE ROW LEVEL SECURITY;

-- Contact Groups policies
CREATE POLICY "Users can view contact groups in their org"
ON contact_groups FOR SELECT
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create contact groups in their org"
ON contact_groups FOR INSERT
TO authenticated
WITH CHECK (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update contact groups in their org"
ON contact_groups FOR UPDATE
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete contact groups in their org"
ON contact_groups FOR DELETE
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

-- Contact Group Members policies
CREATE POLICY "Users can view members in their org"
ON contact_group_members FOR SELECT
TO authenticated
USING (group_id IN (
  SELECT id FROM contact_groups WHERE org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Users can manage members in their org"
ON contact_group_members FOR ALL
TO authenticated
USING (group_id IN (
  SELECT id FROM contact_groups WHERE org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  )
));

-- Message Schedulers policies
CREATE POLICY "Users can view schedulers in their org"
ON message_schedulers FOR SELECT
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create schedulers in their org"
ON message_schedulers FOR INSERT
TO authenticated
WITH CHECK (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update their schedulers"
ON message_schedulers FOR UPDATE
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete their schedulers"
ON message_schedulers FOR DELETE
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

-- Scheduler Logs policies
CREATE POLICY "Users can view logs for their schedulers"
ON message_scheduler_logs FOR SELECT
TO authenticated
USING (scheduler_id IN (
  SELECT id FROM message_schedulers WHERE org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  )
));
