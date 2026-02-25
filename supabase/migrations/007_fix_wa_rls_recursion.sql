-- Fix: WA tables RLS policies use the old recursive pattern:
--   org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
-- This causes issues because it queries profiles (which has its own RLS).
-- Replace with get_my_org_id() SECURITY DEFINER function from migration 005.

-- ============================================
-- wa_sessions
-- ============================================
DROP POLICY IF EXISTS "Users can view own org sessions" ON wa_sessions;
CREATE POLICY "Users can view own org sessions" ON wa_sessions
  FOR SELECT USING (org_id = get_my_org_id());

-- ============================================
-- wa_conversations
-- ============================================
DROP POLICY IF EXISTS "Users can view own org conversations" ON wa_conversations;
CREATE POLICY "Users can view own org conversations" ON wa_conversations
  FOR SELECT USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can update own org conversations" ON wa_conversations;
CREATE POLICY "Users can update own org conversations" ON wa_conversations
  FOR UPDATE USING (org_id = get_my_org_id());

-- ============================================
-- wa_messages
-- ============================================
DROP POLICY IF EXISTS "Users can view own org messages" ON wa_messages;
CREATE POLICY "Users can view own org messages" ON wa_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM wa_conversations
      WHERE org_id = get_my_org_id()
    )
  );

-- ============================================
-- wa_quick_replies
-- ============================================
DROP POLICY IF EXISTS "Users can view own org quick replies" ON wa_quick_replies;
CREATE POLICY "Users can view own org quick replies" ON wa_quick_replies
  FOR SELECT USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can insert own org quick replies" ON wa_quick_replies;
CREATE POLICY "Users can insert own org quick replies" ON wa_quick_replies
  FOR INSERT WITH CHECK (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can update own org quick replies" ON wa_quick_replies;
CREATE POLICY "Users can update own org quick replies" ON wa_quick_replies
  FOR UPDATE USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can delete own org quick replies" ON wa_quick_replies;
CREATE POLICY "Users can delete own org quick replies" ON wa_quick_replies
  FOR DELETE USING (org_id = get_my_org_id());
