-- API-Integration-System für flexible Lead-Push-Funktionalität
-- Ermöglicht Admins, Leads an externe Systeme zu pushen mit individueller Daten-Transformation

-- Tabelle für API-Integration-Konfigurationen
CREATE TABLE IF NOT EXISTS api_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Basis-Konfiguration
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  
  -- API-Endpunkt-Konfiguration
  endpoint_url TEXT NOT NULL,
  http_method VARCHAR(10) DEFAULT 'POST' CHECK (http_method IN ('POST', 'PUT', 'PATCH')),
  
  -- Authentifizierung
  auth_type VARCHAR(50) DEFAULT 'none' CHECK (auth_type IN ('none', 'bearer', 'api_key', 'basic', 'custom')),
  auth_config JSONB DEFAULT '{}',
  
  -- Header-Konfiguration
  headers JSONB DEFAULT '{}',
  
  -- Daten-Mapping-Konfiguration (flexibles JSON-Mapping)
  data_mapping JSONB NOT NULL DEFAULT '{}',
  
  -- Trigger-Konfiguration
  trigger_on VARCHAR(50)[] DEFAULT ARRAY['lead.completed'],
  filter_conditions JSONB DEFAULT '{}',
  
  -- Lead-Magnet-spezifische Konfiguration (optional)
  lead_magnet_ids UUID[] DEFAULT NULL, -- NULL = alle Lead-Magnets
  
  -- Retry-Konfiguration
  retry_enabled BOOLEAN DEFAULT true,
  retry_max_attempts INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  
  -- Timeout-Konfiguration
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Logging & Monitoring
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error_at TIMESTAMP WITH TIME ZONE,
  last_error_message TEXT,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log-Tabelle für API-Push-Versuche
CREATE TABLE IF NOT EXISTS api_integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES api_integrations(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Request-Details
  request_url TEXT NOT NULL,
  request_method VARCHAR(10) NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  
  -- Response-Details
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  
  -- Ergebnis
  success BOOLEAN NOT NULL,
  error_message TEXT,
  
  -- Retry-Info
  attempt_number INTEGER DEFAULT 1,
  retry_scheduled_for TIMESTAMP WITH TIME ZONE,
  
  -- Performance
  duration_ms INTEGER,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX idx_api_integrations_tenant ON api_integrations(tenant_id);
CREATE INDEX idx_api_integrations_active ON api_integrations(active) WHERE active = true;
CREATE INDEX idx_api_integrations_lead_magnets ON api_integrations USING GIN(lead_magnet_ids);

CREATE INDEX idx_api_integration_logs_integration ON api_integration_logs(integration_id);
CREATE INDEX idx_api_integration_logs_submission ON api_integration_logs(submission_id);
CREATE INDEX idx_api_integration_logs_created ON api_integration_logs(created_at DESC);
CREATE INDEX idx_api_integration_logs_retry ON api_integration_logs(retry_scheduled_for) WHERE retry_scheduled_for IS NOT NULL;

-- Updated-at Trigger
CREATE OR REPLACE FUNCTION update_api_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_integrations_updated_at
  BEFORE UPDATE ON api_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_api_integrations_updated_at();

-- RLS Policies
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_integration_logs ENABLE ROW LEVEL SECURITY;

-- Nur Admins können API-Integrationen verwalten
CREATE POLICY "Admins can view api_integrations" ON api_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can insert api_integrations" ON api_integrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update api_integrations" ON api_integrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete api_integrations" ON api_integrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Logs können von Admins eingesehen werden
CREATE POLICY "Admins can view api_integration_logs" ON api_integration_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Kommentare für Dokumentation
COMMENT ON TABLE api_integrations IS 'Konfigurationen für flexible API-Push-Integrationen';
COMMENT ON COLUMN api_integrations.data_mapping IS 'JSON-Objekt für flexibles Daten-Mapping. Beispiel: {"email": "{{contact_info.email}}", "first_name": "{{contact_info.firstName}}", "custom_field": "{{data.calculatorResult}}"}';
COMMENT ON COLUMN api_integrations.auth_config IS 'Authentifizierungs-Konfiguration. Beispiel für Bearer: {"token": "xxx"}, für API-Key: {"header": "X-API-Key", "value": "xxx"}, für Basic: {"username": "xxx", "password": "xxx"}';
COMMENT ON COLUMN api_integrations.filter_conditions IS 'Optionale Filter-Bedingungen. Beispiel: {"leadMagnetType": "calculator", "minimumScore": 50}';

COMMENT ON TABLE api_integration_logs IS 'Log-Tabelle für alle API-Push-Versuche mit Request/Response-Details';


