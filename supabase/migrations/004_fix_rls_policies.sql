-- Migration: Korrigierte RLS-Policies ohne Rekursion
-- Problem: Die ursprünglichen Policies verursachten unendliche Rekursion

-- ===================================
-- 1. RLS wieder aktivieren
-- ===================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE identities ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 2. Alte fehlerhafte Policies löschen
-- ===================================
DROP POLICY IF EXISTS "Users can view own tenant data" ON tenants;
DROP POLICY IF EXISTS "Users can view own tenant users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage own tenant" ON lead_magnets;
DROP POLICY IF EXISTS "Public can view active lead magnets" ON lead_magnets;
DROP POLICY IF EXISTS "Public can view flow steps for active magnets" ON flow_steps;

-- ===================================
-- 3. USERS-Tabelle: Sichere Policies ohne Rekursion
-- ===================================

-- User kann nur sein eigenes Profil sehen (keine Rekursion!)
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

-- User kann sein eigenes Profil erstellen
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- User kann sein eigenes Profil aktualisieren
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- ===================================
-- 4. TENANTS-Tabelle: Zugriff über User-ID
-- ===================================

-- Hilfsfunktion: Hole tenant_id des aktuellen Users (SECURITY DEFINER umgeht RLS)
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Hilfsfunktion: Prüfe ob aktueller User Admin ist
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Tenant kann von zugehörigen Usern gelesen werden
CREATE POLICY "tenants_select" ON tenants
  FOR SELECT USING (id = get_current_user_tenant_id());

-- ===================================
-- 5. LEAD_MAGNETS-Tabelle
-- ===================================

-- Admins können Lead Magnets ihres Tenants verwalten
CREATE POLICY "lead_magnets_admin_all" ON lead_magnets
  FOR ALL USING (
    tenant_id = get_current_user_tenant_id() AND is_current_user_admin()
  );

-- Öffentlicher Lesezugriff auf aktive Lead Magnets (für Widgets)
CREATE POLICY "lead_magnets_public_read" ON lead_magnets
  FOR SELECT USING (active = true);

-- ===================================
-- 6. FLOW_STEPS-Tabelle
-- ===================================

-- Admins können Flow Steps verwalten
CREATE POLICY "flow_steps_admin_all" ON flow_steps
  FOR ALL USING (
    lead_magnet_id IN (
      SELECT id FROM lead_magnets WHERE tenant_id = get_current_user_tenant_id()
    ) AND is_current_user_admin()
  );

-- Öffentlicher Lesezugriff auf Flow Steps aktiver Lead Magnets
CREATE POLICY "flow_steps_public_read" ON flow_steps
  FOR SELECT USING (
    lead_magnet_id IN (SELECT id FROM lead_magnets WHERE active = true)
  );

-- ===================================
-- 7. SUBMISSIONS-Tabelle
-- ===================================

-- Jeder kann Submissions erstellen (öffentliche Formulare)
CREATE POLICY "submissions_insert_public" ON submissions
  FOR INSERT WITH CHECK (true);

-- Admins können Submissions ihres Tenants sehen
CREATE POLICY "submissions_select_admin" ON submissions
  FOR SELECT USING (
    tenant_id = get_current_user_tenant_id() AND is_current_user_admin()
  );

-- ===================================
-- 8. TRACKING_EVENTS-Tabelle
-- ===================================

-- Jeder kann Tracking Events erstellen
CREATE POLICY "tracking_events_insert_public" ON tracking_events
  FOR INSERT WITH CHECK (true);

-- Admins können Tracking Events sehen
CREATE POLICY "tracking_events_select_admin" ON tracking_events
  FOR SELECT USING (
    submission_id IN (
      SELECT id FROM submissions WHERE tenant_id = get_current_user_tenant_id()
    ) AND is_current_user_admin()
  );

-- ===================================
-- 9. EMAIL_QUEUE-Tabelle
-- ===================================

CREATE POLICY "email_queue_admin_all" ON email_queue
  FOR ALL USING (
    submission_id IN (
      SELECT id FROM submissions WHERE tenant_id = get_current_user_tenant_id()
    ) AND is_current_user_admin()
  );

-- ===================================
-- 10. WEBHOOKS-Tabelle
-- ===================================

CREATE POLICY "webhooks_admin_all" ON webhooks
  FOR ALL USING (
    tenant_id = get_current_user_tenant_id() AND is_current_user_admin()
  );

-- ===================================
-- 11. ASSETS-Tabelle
-- ===================================

CREATE POLICY "assets_admin_all" ON assets
  FOR ALL USING (
    tenant_id = get_current_user_tenant_id() AND is_current_user_admin()
  );

-- ===================================
-- 12. EMAIL_TEMPLATES-Tabelle
-- ===================================

CREATE POLICY "email_templates_admin_all" ON email_templates
  FOR ALL USING (
    tenant_id = get_current_user_tenant_id() AND is_current_user_admin()
  );

-- ===================================
-- 13. PDF_TEMPLATES-Tabelle
-- ===================================

CREATE POLICY "pdf_templates_admin_all" ON pdf_templates
  FOR ALL USING (
    tenant_id = get_current_user_tenant_id() AND is_current_user_admin()
  );

-- ===================================
-- 14. FEATURE_FLAGS-Tabelle
-- ===================================

CREATE POLICY "feature_flags_admin_all" ON feature_flags
  FOR ALL USING (
    tenant_id = get_current_user_tenant_id() AND is_current_user_admin()
  );

-- ===================================
-- 15. AUDIT_LOGS-Tabelle
-- ===================================

CREATE POLICY "audit_logs_admin_select" ON audit_logs
  FOR SELECT USING (
    tenant_id = get_current_user_tenant_id() AND is_current_user_admin()
  );

-- Automatisch Audit Logs erstellen ist erlaubt
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ===================================
-- 16. IDENTITIES-Tabelle
-- ===================================

CREATE POLICY "identities_select_own" ON identities
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "identities_insert_own" ON identities
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

