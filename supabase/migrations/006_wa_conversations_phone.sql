-- Add phone_number column to wa_conversations for LID → phone resolution
ALTER TABLE wa_conversations ADD COLUMN IF NOT EXISTS phone_number TEXT;
