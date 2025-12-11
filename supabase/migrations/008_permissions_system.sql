-- Erweitere die users Tabelle um mehr Rollen
-- Ändere das role ENUM um super_admin hinzuzufügen
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'user'));

-- Erstelle Tabelle für Rollen-Berechtigungen
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'user')),
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, role)
);

-- Index für Performance
CREATE INDEX idx_role_permissions_tenant_role ON role_permissions(tenant_id, role);

-- RLS für role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Nur Super Admins und Admins können Berechtigungen sehen
CREATE POLICY "Admins can view role permissions" ON role_permissions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Nur Super Admins können Berechtigungen ändern
CREATE POLICY "Super admins can modify role permissions" ON role_permissions
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Trigger für updated_at
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funktion um zu prüfen, ob ein User eine Berechtigung hat
CREATE OR REPLACE FUNCTION user_has_permission(
  user_id UUID,
  permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_tenant UUID;
  role_perms JSONB;
BEGIN
  -- Hole Rolle und Tenant des Users
  SELECT role, tenant_id INTO user_role, user_tenant
  FROM users
  WHERE id = user_id;

  -- Super Admin hat alle Rechte
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- Hole custom Berechtigungen für diese Rolle
  SELECT permissions INTO role_perms
  FROM role_permissions
  WHERE tenant_id = user_tenant
  AND role = user_role;

  -- Wenn custom Berechtigungen existieren, prüfe diese
  IF role_perms IS NOT NULL THEN
    RETURN role_perms ? permission;
  END IF;

  -- Sonst verwende Standard-Berechtigungen (diese werden in der App definiert)
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kommentar
COMMENT ON TABLE role_permissions IS 'Speichert custom Berechtigungen für Rollen pro Tenant';
COMMENT ON FUNCTION user_has_permission IS 'Prüft, ob ein User eine bestimmte Berechtigung hat';

