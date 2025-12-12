-- Script um einen Benutzer zum Super Admin zu machen
-- 
-- Ersetzen Sie 'ihre-email@example.com' mit Ihrer tatsächlichen E-Mail
-- Führen Sie dies im Supabase SQL Editor aus

-- 1. Zeige alle Benutzer
SELECT id, email, role, tenant_id 
FROM users 
ORDER BY created_at DESC;

-- 2. Setze einen Benutzer zum Super Admin
-- WICHTIG: Ersetzen Sie die E-Mail!
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'ihre-email@example.com';

-- 3. Überprüfe das Ergebnis
SELECT id, email, role, tenant_id 
FROM users 
WHERE role = 'super_admin';



