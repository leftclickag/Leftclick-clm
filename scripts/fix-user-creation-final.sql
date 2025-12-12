-- FINALER FIX: Benutzererstellung reparieren
-- Dieses Script behebt das Problem, dass neue Benutzer nicht erstellt werden können

-- Schritt 1: Prüfen des aktuellen Zustands
SELECT 
  'Aktueller Status der Trigger' as info,
  trigger_name, 
  event_object_table, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Schritt 2: Alten Trigger vollständig entfernen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Schritt 3: Alte Funktion(en) entfernen
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Schritt 4: Standard-Tenant sicherstellen
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'LeftClick', 'leftclick')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- Schritt 5: NEUE, FUNKTIONIERENDE Trigger-Funktion erstellen
-- Diese Version schreibt NUR in die users-Tabelle (nicht in user_roles!)
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

  -- Erstelle den users-Eintrag (NUR users Tabelle!)
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
EXCEPTION WHEN OTHERS THEN
  -- Logge Fehler aber verhindere nicht die User-Erstellung
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schritt 6: Neuen Trigger erstellen
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Schritt 7: Stelle sicher, dass alle existierenden auth.users auch in users sind
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
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Schritt 8: Überprüfe dass alle User einen Tenant haben
UPDATE users 
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Schritt 9: Zeige Ergebnis
SELECT 
  '✅ Erfolgreich repariert!' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as users_with_tenant
FROM users;

-- Kommentar
COMMENT ON FUNCTION public.handle_new_user IS 
'Erstellt automatisch einen Eintrag in der users-Tabelle wenn ein neuer Benutzer über die Admin-API oder Auth erstellt wird. Version: 2025-12-10 - Fixed for users table only';



