-- ============================================
-- 011: Add 'waha' provider to WA tables
-- ============================================

-- wa_sessions: add 'waha' to provider check, change default
ALTER TABLE wa_sessions DROP CONSTRAINT IF EXISTS wa_sessions_provider_check;
ALTER TABLE wa_sessions ADD CONSTRAINT wa_sessions_provider_check
  CHECK (provider IN ('bailey', 'qontak', 'waha'));
ALTER TABLE wa_sessions ALTER COLUMN provider SET DEFAULT 'waha';

-- wa_conversations: add 'waha' to provider check, change default
ALTER TABLE wa_conversations DROP CONSTRAINT IF EXISTS wa_conversations_provider_check;
ALTER TABLE wa_conversations ADD CONSTRAINT wa_conversations_provider_check
  CHECK (provider IN ('bailey', 'qontak', 'waha'));
ALTER TABLE wa_conversations ALTER COLUMN provider SET DEFAULT 'waha';
