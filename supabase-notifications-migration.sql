-- Notifications Migration
-- Adds notification system for tier upgrades and proof card shares

-- Step 1: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- User who receives the notification
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification type
  type TEXT NOT NULL CHECK (type IN ('tier_upgrade', 'share', 'vote', 'badge_earned', 'other')),

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT, -- Emoji or icon name

  -- Additional data (JSON)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Optional action URL (e.g., link to prediction)
  action_url TEXT,

  -- Read status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Delivery status
  in_app_sent BOOLEAN DEFAULT true,
  email_sent BOOLEAN DEFAULT false
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Step 3: Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (no user restriction)
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Step 4: Create helper function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_icon TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    icon,
    metadata,
    action_url
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_icon,
    p_metadata,
    p_action_url
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND read = false;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
