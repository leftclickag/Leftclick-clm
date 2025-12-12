-- Diagnose-Script für Berechtigungsprobleme
-- Führen Sie diese Queries nacheinander im Supabase SQL Editor aus

-- 1. Prüfe ob die Tabelle role_permissions existiert
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'role_permissions'
) as table_exists;

-- 2. Zeige ALLE Benutzer mit ihren Rollen
SELECT 
  id,
  email,
  role,
  tenant_id,
  created_at
FROM users 
ORDER BY created_at DESC;

-- 3. Zeige alle Einträge in auth.users (Supabase Auth)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- 4. Prüfe ob ein Benutzer in der users Tabelle ist
-- (Ersetzen Sie die E-Mail mit Ihrer)
SELECT * FROM users WHERE email = 'ihre-email@example.com';

-- 5. Zeige alle Tenants
SELECT * FROM tenants;

-- 6. Wenn keine Tenants existieren, erstellen Sie einen:
-- INSERT INTO tenants (name, slug) VALUES ('Standard', 'standard')
-- RETURNING *;

-- 7. Wenn ein Benutzer keinen Tenant hat, weisen Sie einen zu:
-- UPDATE users 
-- SET tenant_id = (SELECT id FROM tenants LIMIT 1)
-- WHERE tenant_id IS NULL;

-- 8. Wenn ein Benutzer keine Rolle hat, setzen Sie super_admin:
-- UPDATE users 
-- SET role = 'super_admin' 
-- WHERE email = 'ihre-email@example.com';

-- 9. Überprüfen Sie das Ergebnis:
SELECT 
  u.id,
  u.email,
  u.role,
  u.tenant_id,
  t.name as tenant_name
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'ihre-email@example.com';



