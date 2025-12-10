-- 🔥 SPICY FEATURES MIGRATION 🔥
-- A/B Testing, Lead Scoring, UTM Tracking, Automations, Social Proof & mehr!

-- ============================================
-- 1. A/B TESTING SYSTEM
-- ============================================
CREATE TABLE lead_magnet_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL DEFAULT 'A',
  traffic_percentage INTEGER NOT NULL DEFAULT 50 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
  config JSONB DEFAULT '{}'::jsonb,
  is_control BOOLEAN DEFAULT false,
  conversions INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ab_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID REFERENCES lead_magnet_variants(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  converted BOOLEAN DEFAULT false,
  time_to_complete_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. LEAD SCORING SYSTEM
-- ============================================
CREATE TABLE lead_scoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL, -- { "field": "budget", "operator": "gt", "value": 10000 }
  score_value INTEGER NOT NULL, -- Points to add/subtract
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
  total_score INTEGER DEFAULT 0,
  score_breakdown JSONB DEFAULT '[]'::jsonb, -- Array of applied rules
  grade TEXT, -- 'hot', 'warm', 'cold'
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. UTM TRACKING & SOURCE ATTRIBUTION
-- ============================================
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS landing_page TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ip_hash TEXT; -- Hashed for privacy
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS device_type TEXT; -- 'desktop', 'mobile', 'tablet'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES lead_magnet_variants(id);

-- ============================================
-- 4. DRIP EMAIL AUTOMATIONS
-- ============================================
CREATE TABLE email_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('completed', 'abandoned', 'started', 'step_complete')),
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automation_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID REFERENCES email_automations(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_minutes INTEGER NOT NULL DEFAULT 0, -- Delay after trigger/previous step
  action_type TEXT NOT NULL CHECK (action_type IN ('send_email', 'send_webhook', 'send_slack', 'update_score', 'add_tag')),
  config JSONB NOT NULL, -- email_template_id, webhook_url, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automation_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID REFERENCES email_automations(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'failed')),
  next_execution_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- 5. NOTIFICATION CHANNELS (Slack, Teams, WhatsApp)
-- ============================================
CREATE TABLE notification_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('slack', 'teams', 'whatsapp', 'telegram', 'discord')),
  name TEXT NOT NULL,
  webhook_url TEXT,
  api_credentials JSONB DEFAULT '{}'::jsonb, -- Encrypted credentials
  config JSONB DEFAULT '{}'::jsonb, -- Channel-specific config
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES notification_channels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('new_lead', 'hot_lead', 'abandoned', 'conversion', 'daily_summary')),
  message_template TEXT NOT NULL,
  conditions JSONB DEFAULT '{}'::jsonb, -- Optional conditions
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. SOCIAL PROOF & LIVE STATS
-- ============================================
CREATE TABLE social_proof_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE UNIQUE,
  total_completions INTEGER DEFAULT 0,
  today_completions INTEGER DEFAULT 0,
  this_week_completions INTEGER DEFAULT 0,
  last_completion_at TIMESTAMPTZ,
  avg_completion_time_seconds INTEGER,
  satisfaction_rating DECIMAL(3,2), -- If you collect feedback
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update social proof stats
CREATE OR REPLACE FUNCTION update_social_proof_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO social_proof_stats (lead_magnet_id, total_completions, today_completions, this_week_completions, last_completion_at)
    VALUES (NEW.lead_magnet_id, 1, 1, 1, NOW())
    ON CONFLICT (lead_magnet_id) DO UPDATE SET
      total_completions = social_proof_stats.total_completions + 1,
      today_completions = CASE 
        WHEN DATE(social_proof_stats.updated_at) = CURRENT_DATE THEN social_proof_stats.today_completions + 1 
        ELSE 1 
      END,
      this_week_completions = CASE 
        WHEN EXTRACT(WEEK FROM social_proof_stats.updated_at) = EXTRACT(WEEK FROM NOW()) THEN social_proof_stats.this_week_completions + 1 
        ELSE 1 
      END,
      last_completion_at = NOW(),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_social_proof
AFTER INSERT OR UPDATE ON submissions
FOR EACH ROW EXECUTE FUNCTION update_social_proof_stats();

-- ============================================
-- 7. CONDITIONAL LOGIC / FLOW BUILDER
-- ============================================
CREATE TABLE flow_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_step_id UUID REFERENCES flow_steps(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('show_if', 'skip_if', 'branch_to')),
  source_field TEXT NOT NULL, -- Field from previous step
  operator TEXT NOT NULL CHECK (operator IN ('equals', 'not_equals', 'contains', 'gt', 'lt', 'gte', 'lte', 'is_empty', 'is_not_empty', 'in_array')),
  target_value JSONB NOT NULL,
  target_step_id UUID REFERENCES flow_steps(id) ON DELETE SET NULL, -- For branch_to
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. GAMIFICATION & ACHIEVEMENTS
-- ============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Emoji or icon name
  badge_color TEXT DEFAULT '#FFD700',
  condition_type TEXT NOT NULL CHECK (condition_type IN ('completions', 'streak', 'speed', 'score', 'custom')),
  condition_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, achievement_id)
);

-- ============================================
-- 9. MULTI-LANGUAGE SUPPORT
-- ============================================
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('lead_magnet', 'flow_step', 'email_template', 'ui')),
  resource_id UUID,
  language_code TEXT NOT NULL, -- 'de', 'en', 'fr', etc.
  field_name TEXT NOT NULL,
  translated_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_type, resource_id, language_code, field_name)
);

CREATE TABLE supported_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  language_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, language_code)
);

-- ============================================
-- 10. DSGVO CONSENT MANAGEMENT
-- ============================================
CREATE TABLE consent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('marketing', 'analytics', 'necessary', 'third_party')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  consent_template_id UUID REFERENCES consent_templates(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  consent_text TEXT, -- Snapshot of consent text at time of agreement
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- ============================================
-- 11. TAGS & SEGMENTATION
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

CREATE TABLE submission_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES users(id),
  UNIQUE(submission_id, tag_id)
);

-- ============================================
-- 12. EMBED CONFIGURATIONS
-- ============================================
CREATE TABLE embed_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  embed_type TEXT NOT NULL CHECK (embed_type IN ('iframe', 'popup', 'slide_in', 'full_page', 'inline')),
  config JSONB DEFAULT '{}'::jsonb, -- Width, height, position, triggers
  allowed_domains TEXT[], -- Domain whitelist
  custom_css TEXT,
  custom_js TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. EXIT INTENT SETTINGS
-- ============================================
CREATE TABLE exit_intent_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false,
  delay_seconds INTEGER DEFAULT 0, -- Min time before showing
  show_only_once BOOLEAN DEFAULT true,
  headline TEXT DEFAULT 'Warte! Bevor du gehst...',
  subheadline TEXT,
  cta_text TEXT DEFAULT 'Ja, ich will das!',
  dismiss_text TEXT DEFAULT 'Nein, danke',
  incentive_type TEXT CHECK (incentive_type IN ('discount', 'bonus', 'reminder', 'custom')),
  incentive_value TEXT, -- '10%', 'Bonus PDF', etc.
  background_color TEXT DEFAULT '#FFFFFF',
  overlay_opacity DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. ANALYTICS AGGREGATIONS (for fast dashboards)
-- ============================================
CREATE TABLE daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  abandonments INTEGER DEFAULT 0,
  avg_time_seconds INTEGER,
  conversion_rate DECIMAL(5,2),
  top_traffic_source TEXT,
  top_device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, lead_magnet_id, date)
);

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics()
RETURNS void AS $$
BEGIN
  INSERT INTO daily_analytics (tenant_id, lead_magnet_id, date, impressions, starts, completions, abandonments)
  SELECT 
    s.tenant_id,
    s.lead_magnet_id,
    CURRENT_DATE - 1 as date,
    COUNT(*) as impressions,
    COUNT(*) FILTER (WHERE s.status IN ('started', 'in_progress', 'completed')) as starts,
    COUNT(*) FILTER (WHERE s.status = 'completed') as completions,
    COUNT(*) FILTER (WHERE s.status = 'abandoned') as abandonments
  FROM submissions s
  WHERE DATE(s.created_at) = CURRENT_DATE - 1
  GROUP BY s.tenant_id, s.lead_magnet_id
  ON CONFLICT (tenant_id, lead_magnet_id, date) DO UPDATE SET
    impressions = EXCLUDED.impressions,
    starts = EXCLUDED.starts,
    completions = EXCLUDED.completions,
    abandonments = EXCLUDED.abandonments;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 15. PERSONALIZATION TOKENS
-- ============================================
CREATE TABLE personalization_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  token_key TEXT NOT NULL, -- {{first_name}}, {{company}}
  display_name TEXT NOT NULL,
  source_field TEXT NOT NULL, -- Field path in submission data
  default_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, token_key)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_lead_magnet_variants_lead_magnet ON lead_magnet_variants(lead_magnet_id);
CREATE INDEX idx_ab_test_results_variant ON ab_test_results(variant_id);
CREATE INDEX idx_lead_scores_submission ON lead_scores(submission_id);
CREATE INDEX idx_lead_scores_grade ON lead_scores(grade);
CREATE INDEX idx_submissions_utm_source ON submissions(utm_source);
CREATE INDEX idx_submissions_utm_campaign ON submissions(utm_campaign);
CREATE INDEX idx_submissions_variant ON submissions(variant_id);
CREATE INDEX idx_automation_executions_status ON automation_executions(status);
CREATE INDEX idx_automation_executions_next ON automation_executions(next_execution_at);
CREATE INDEX idx_notification_channels_tenant ON notification_channels(tenant_id);
CREATE INDEX idx_social_proof_lead_magnet ON social_proof_stats(lead_magnet_id);
CREATE INDEX idx_flow_conditions_step ON flow_conditions(flow_step_id);
CREATE INDEX idx_translations_resource ON translations(resource_type, resource_id);
CREATE INDEX idx_consent_records_submission ON consent_records(submission_id);
CREATE INDEX idx_submission_tags_submission ON submission_tags(submission_id);
CREATE INDEX idx_daily_analytics_date ON daily_analytics(date);
CREATE INDEX idx_daily_analytics_tenant_date ON daily_analytics(tenant_id, date);

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================
ALTER TABLE lead_magnet_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proof_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_intent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_tokens ENABLE ROW LEVEL SECURITY;

-- Public read for social proof
CREATE POLICY "Public can view social proof" ON social_proof_stats
  FOR SELECT USING (true);

-- Admin policies for tenant-scoped tables
CREATE POLICY "Admins manage variants" ON lead_magnet_variants
  FOR ALL USING (
    lead_magnet_id IN (
      SELECT lm.id FROM lead_magnets lm 
      WHERE lm.tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Admins manage scoring rules" ON lead_scoring_rules
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage automations" ON email_automations
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage notification channels" ON notification_channels
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage tags" ON tags
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins view daily analytics" ON daily_analytics
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- ============================================
-- SEED DEFAULT ACHIEVEMENTS
-- ============================================
-- These will be created per-tenant via the app

-- ============================================
-- 🎉 SPICY FEATURES COMPLETE! 🎉
-- ============================================

