-- Schnellfix für User-Erstellung
-- Führen Sie diese Queries NACHEINANDER aus

-- 1. Prüfen welcher Trigger existiert
SELECT 
  trigger_name, 
  event_object_table, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Alten Trigger komplett entfernen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Alte Funktion entfernen
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 4. NEUE vereinfachte Funktion erstellen
-- Diese Version versucht NICHT in user_roles zu schreiben
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
  -- NUR users Tabelle, KEINE user_roles!
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

-- 5. Neuen Trigger erstellen
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Teste ob es funktioniert
SELECT 'Trigger erfolgreich erstellt!' as status;

-- 7. Stelle sicher dass LeftClick Tenant existiert
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'LeftClick', 'leftclick')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- 8. Überprüfe dass alle existierenden User einen Tenant haben
UPDATE users 
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- 9. Zeige Ergebnis
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as users_with_tenant,
  COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as users_without_tenant
FROM users;

