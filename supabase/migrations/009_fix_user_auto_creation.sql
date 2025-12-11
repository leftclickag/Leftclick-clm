-- Fix: Automatische Benutzererstellung für Admin-Panel
-- Problem: Neue Benutzer wurden nicht korrekt in die users-Tabelle eingefügt

-- Schritt 1: Sicherstellen dass der Standard-Tenant existiert
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'LeftClick', 'leftclick')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- Schritt 2: Korrigierte Trigger-Funktion
-- Diese Version erstellt automatisch einen users-Eintrag mit korrekter Rolle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Hole den Standard-Tenant
  SELECT id INTO default_tenant_id 
  FROM tenants 
  WHERE slug = 'leftclick' 
  LIMIT 1;
  
  -- Fallback auf feste UUID
  IF default_tenant_id IS NULL THEN
    default_tenant_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  -- Erstelle den users-Eintrag
  -- Standard-Rolle ist 'user', kann später vom Admin geändert werden
  INSERT INTO public.users (id, email, role, tenant_id, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',  -- Standard-Rolle
    default_tenant_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schritt 3: Trigger neu erstellen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Schritt 4: Stelle sicher, dass alle existierenden auth.users auch in users sind
INSERT INTO users (id, email, role, tenant_id, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(u.role, 'user') as role,
  COALESCE(u.tenant_id, '00000000-0000-0000-0000-000000000001') as tenant_id,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL  -- Nur Benutzer die noch nicht in users sind
ON CONFLICT (id) DO NOTHING;

-- Schritt 5: Stelle sicher, dass alle Benutzer einen Tenant haben
UPDATE users 
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Kommentar
COMMENT ON FUNCTION public.handle_new_user IS 
'Erstellt automatisch einen Eintrag in der users-Tabelle wenn sich ein neuer Benutzer registriert';

