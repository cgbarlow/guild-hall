-- Migration: 048_rls_notifications
-- Description: Enable RLS and create policies for notifications table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
FOR SELECT USING (user_id = auth.uid());

-- System/triggers create notifications (use service role)
-- Allow inserts for notification triggers
CREATE POLICY notifications_insert ON notifications
FOR INSERT WITH CHECK (true);  -- Controlled by application/triggers

-- Users can mark their own notifications as read
CREATE POLICY notifications_update_own ON notifications
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY notifications_delete_own ON notifications
FOR DELETE USING (user_id = auth.uid());
