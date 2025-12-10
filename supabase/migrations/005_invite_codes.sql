-- Invite Codes Tabelle
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Invite Code Usage Tracking
CREATE TABLE IF NOT EXISTS invite_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code_id UUID REFERENCES invite_codes(id) ON DELETE CASCADE,
  used_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles und Permissions
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role VARCHAR(50) DEFAULT 'user',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für bessere Performance
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_created_by ON invite_codes(created_by);
CREATE INDEX idx_invite_codes_active ON invite_codes(is_active);
CREATE INDEX idx_invite_code_usage_code ON invite_code_usage(invite_code_id);
CREATE INDEX idx_invite_code_usage_user ON invite_code_usage(used_by);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- RLS Policies
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Nur Admins können Invite Codes sehen und erstellen
CREATE POLICY "Admins can view all invite codes" ON invite_codes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can create invite codes" ON invite_codes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update invite codes" ON invite_codes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete invite codes" ON invite_codes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Usage Tracking Policies
CREATE POLICY "Admins can view invite code usage" ON invite_code_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert their own usage" ON invite_code_usage
  FOR INSERT
  WITH CHECK (used_by = auth.uid());

-- User Roles Policies
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update roles" ON user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
    )
  );

-- Function um abgelaufene/verbrauchte Codes zu deaktivieren
CREATE OR REPLACE FUNCTION deactivate_expired_codes()
RETURNS void AS $$
BEGIN
  UPDATE invite_codes
  SET is_active = false
  WHERE is_active = true
  AND (
    (expires_at IS NOT NULL AND expires_at < NOW())
    OR (current_uses >= max_uses)
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger um current_uses zu aktualisieren
CREATE OR REPLACE FUNCTION increment_invite_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invite_codes
  SET current_uses = current_uses + 1
  WHERE id = NEW.invite_code_id;
  
  -- Deaktiviere Code wenn max_uses erreicht
  PERFORM deactivate_expired_codes();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_invite_code_usage
AFTER INSERT ON invite_code_usage
FOR EACH ROW
EXECUTE FUNCTION increment_invite_code_usage();

-- Migrate existing users from users table to user_roles
INSERT INTO user_roles (user_id, role, permissions)
SELECT 
  id,
  CASE 
    WHEN role = 'admin' THEN 'super_admin'
    ELSE 'user'
  END,
  CASE 
    WHEN role = 'admin' THEN '["all"]'::jsonb
    ELSE '[]'::jsonb
  END
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Fallback: If no users exist in users table, try auth.users directly
INSERT INTO user_roles (user_id, role, permissions)
SELECT 
  id,
  'super_admin',
  '["all"]'::jsonb
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

