-- ============================================================
-- V6__alter_chat_messages_text.sql
-- Alter chat_messages.message_text to TEXT to support long AI replies
-- ============================================================

ALTER TABLE chat_messages MODIFY COLUMN message_text TEXT NOT NULL;
