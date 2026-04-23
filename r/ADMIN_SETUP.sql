-- Add role and status columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio_updated_at TIMESTAMP WITH TIME ZONE;

-- Create reports table for flagged content
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('question', 'answer', 'user')),
  target_id UUID NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  resolution_note TEXT,
  resolved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for reports
CREATE INDEX IF NOT EXISTS reports_type_status_idx ON reports(type, status);
CREATE INDEX IF NOT EXISTS reports_target_id_idx ON reports(target_id);
CREATE INDEX IF NOT EXISTS reports_reported_by_idx ON reports(reported_by_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  data_type TEXT DEFAULT 'string' CHECK (data_type IN ('string', 'boolean', 'number', 'json')),
  description TEXT,
  updated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin_settings
CREATE INDEX IF NOT EXISTS admin_settings_key_idx ON admin_settings(setting_key);

-- Create default settings
INSERT INTO admin_settings (setting_key, setting_value, data_type, description) VALUES
  ('platform_name', 'CodeFlow', 'string', 'Name of the platform'),
  ('max_questions_per_day', '10', 'number', 'Maximum questions a user can post per day'),
  ('min_reputation_to_vote', '0', 'number', 'Minimum reputation to vote'),
  ('enable_polls', 'true', 'boolean', 'Enable/disable poll feature'),
  ('enable_user_reports', 'true', 'boolean', 'Enable/disable user reporting feature'),
  ('maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode'),
  ('announcement', '', 'string', 'Current platform announcement')
ON CONFLICT (setting_key) DO NOTHING;

-- Create activity_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity_logs
CREATE INDEX IF NOT EXISTS activity_logs_admin_idx ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON activity_logs(action);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can report content" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reported_by_id);

CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = reported_by_id);

CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for admin_settings
CREATE POLICY "Public can read settings" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings" ON admin_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for activity_logs
CREATE POLICY "Admins can view activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
