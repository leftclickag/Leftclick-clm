-- Fix-Script für Berechtigungen
-- Führen Sie diese Queries NACHEINANDER aus

-- 1. Prüfen: Bin ich in der users Tabelle?
SELECT * FROM users WHERE email = 'm.mussler@leftclick.ch';

-- 2. Wenn KEINE Zeile zurückkommt, dann fügen Sie sich hinzu:
-- WICHTIG: Ersetzen Sie die user_id mit Ihrer ID aus auth.users!
-- Holen Sie Ihre ID mit:
SELECT id, email FROM auth.users WHERE email = 'm.mussler@leftclick.ch';

-- 3. Wenn Sie NICHT in users sind, fügen Sie sich hinzu:
INSERT INTO users (
  id, 
  email, 
  role, 
  tenant_id
) 
VALUES (
  'IHRE-AUTH-USER-ID-HIER',  -- Ersetzen mit ID aus auth.users
  'm.mussler@leftclick.ch',
  'super_admin',
  '00000000-0000-0000-0000-000000000001'  -- Die Tenant ID aus dem Screenshot
)
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin',
    tenant_id = '00000000-0000-0000-0000-000000000001';

-- 4. Wenn Sie SCHON in users sind, updaten Sie nur:
UPDATE users 
SET 
  role = 'super_admin',
  tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'm.mussler@leftclick.ch';

-- 5. Überprüfen Sie das Ergebnis:
SELECT 
  u.id,
  u.email,
  u.role,
  u.tenant_id,
  t.name as tenant_name,
  t.slug as tenant_slug
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'm.mussler@leftclick.ch';

-- Das Ergebnis sollte zeigen:
-- role: super_admin
-- tenant_id: 00000000-0000-0000-0000-000000000001
-- tenant_name: LeftClick


