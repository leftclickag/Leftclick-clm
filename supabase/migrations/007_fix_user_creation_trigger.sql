-- Fix: User creation trigger für Admin-API kompatibel machen
-- Das Problem: Der alte Trigger versucht in die users-Tabelle zu schreiben,
-- aber wir verwenden jetzt user_roles für Benutzerrollen.

-- Schritt 1: Sicherstellen dass ein Default-Tenant existiert
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default', 'default')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenants (name, slug)
VALUES ('LeftClick', 'leftclick')
ON CONFLICT (slug) DO NOTHING;

-- Schritt 2: Trigger-Funktion aktualisieren um robuster zu sein
-- Diese Version erstellt sowohl einen users-Eintrag als auch einen user_roles-Eintrag
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Hole den Standard-Tenant (leftclick oder default)
  SELECT id INTO default_tenant_id FROM tenants WHERE slug = 'leftclick' LIMIT 1;
  
  -- Fallback auf default tenant
  IF default_tenant_id IS NULL THEN
    SELECT id INTO default_tenant_id FROM tenants WHERE slug = 'default' LIMIT 1;
  END IF;
  
  -- Letzter Fallback auf feste UUID
  IF default_tenant_id IS NULL THEN
    default_tenant_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  -- Erstelle den users-Eintrag (falls users-Tabelle verwendet wird)
  BEGIN
    INSERT INTO public.users (id, email, role, tenant_id)
    VALUES (
      NEW.id,
      NEW.email,
      'user',  -- Standard-Rolle
      default_tenant_id
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ignoriere Fehler falls users-Tabelle nicht wie erwartet ist
    RAISE NOTICE 'Could not insert into users table: %', SQLERRM;
  END;

  -- Erstelle auch einen user_roles-Eintrag (für das neue Rollensystem)
  BEGIN
    INSERT INTO public.user_roles (user_id, role, permissions)
    VALUES (
      NEW.id,
      'user',  -- Standard-Rolle
      '[]'::jsonb
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ignoriere Fehler falls user_roles-Tabelle nicht wie erwartet ist
    RAISE NOTICE 'Could not insert into user_roles table: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger neu erstellen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

