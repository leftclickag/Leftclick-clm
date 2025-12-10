-- Migration: Automatische Benutzererstellung und RLS-Policies

-- Policy: Benutzer können ihren eigenen Eintrag erstellen
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Benutzer können ihr eigenes Profil aktualisieren  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Trigger-Funktion: Erstellt automatisch einen users-Eintrag wenn sich ein neuer Benutzer registriert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Hole den Standard-Tenant (leftclick)
  SELECT id INTO default_tenant_id FROM tenants WHERE slug = 'leftclick' LIMIT 1;
  
  -- Fallback auf feste UUID wenn kein Tenant gefunden
  IF default_tenant_id IS NULL THEN
    default_tenant_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  -- Erstelle den users-Eintrag
  INSERT INTO public.users (id, email, role, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    'admin',  -- Erster Benutzer ist standardmäßig Admin
    default_tenant_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Wird bei neuen auth.users ausgeführt
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

