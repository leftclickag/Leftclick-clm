-- 🔥 SPICY FUNCTIONS MIGRATION 🔥
-- Stored procedures and functions for new features

-- ============================================
-- A/B TESTING FUNCTIONS
-- ============================================

-- Increment variant impressions
CREATE OR REPLACE FUNCTION increment_variant_impressions(p_variant_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lead_magnet_variants
  SET impressions = impressions + 1
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment variant conversions
CREATE OR REPLACE FUNCTION increment_variant_conversions(p_variant_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lead_magnet_variants
  SET conversions = conversions + 1
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- LEAD SCORING FUNCTIONS
-- ============================================

-- Adjust lead score
CREATE OR REPLACE FUNCTION adjust_lead_score(
  p_submission_id UUID,
  p_adjustment INTEGER
)
RETURNS void AS $$
DECLARE
  v_current_score INTEGER;
  v_new_score INTEGER;
  v_new_grade TEXT;
BEGIN
  -- Get current score or create new record
  SELECT total_score INTO v_current_score
  FROM lead_scores
  WHERE submission_id = p_submission_id;

  IF v_current_score IS NULL THEN
    v_new_score := GREATEST(0, p_adjustment);
    
    INSERT INTO lead_scores (submission_id, total_score, grade, calculated_at)
    VALUES (p_submission_id, v_new_score, 
      CASE
        WHEN v_new_score >= 80 THEN 'hot'
        WHEN v_new_score >= 40 THEN 'warm'
        ELSE 'cold'
      END,
      NOW()
    );
  ELSE
    v_new_score := GREATEST(0, v_current_score + p_adjustment);
    v_new_grade := CASE
      WHEN v_new_score >= 80 THEN 'hot'
      WHEN v_new_score >= 40 THEN 'warm'
      ELSE 'cold'
    END;

    UPDATE lead_scores
    SET 
      total_score = v_new_score,
      grade = v_new_grade,
      calculated_at = NOW()
    WHERE submission_id = p_submission_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Get conversion rate for a lead magnet
CREATE OR REPLACE FUNCTION get_conversion_rate(
  p_lead_magnet_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS DECIMAL AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total, v_completed
  FROM submissions
  WHERE lead_magnet_id = p_lead_magnet_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;

  IF v_total = 0 THEN
    RETURN 0;
  END IF;

  RETURN (v_completed::DECIMAL / v_total::DECIMAL) * 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get top traffic sources
CREATE OR REPLACE FUNCTION get_top_traffic_sources(
  p_tenant_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  source TEXT,
  lead_count BIGINT,
  conversion_count BIGINT,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(s.utm_source, 'Direct') as source,
    COUNT(*) as lead_count,
    COUNT(*) FILTER (WHERE s.status = 'completed') as conversion_count,
    CASE 
      WHEN COUNT(*) > 0 
      THEN (COUNT(*) FILTER (WHERE s.status = 'completed')::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0
    END as conversion_rate
  FROM submissions s
  WHERE s.tenant_id = p_tenant_id
    AND s.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY COALESCE(s.utm_source, 'Direct')
  ORDER BY lead_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- DAILY AGGREGATION CRON FUNCTION
-- ============================================

-- Call this daily via pg_cron or external cron
CREATE OR REPLACE FUNCTION run_daily_aggregation()
RETURNS void AS $$
BEGIN
  -- Aggregate yesterday's analytics
  INSERT INTO daily_analytics (
    tenant_id,
    lead_magnet_id,
    date,
    impressions,
    starts,
    completions,
    abandonments,
    conversion_rate
  )
  SELECT 
    s.tenant_id,
    s.lead_magnet_id,
    CURRENT_DATE - 1 as date,
    COUNT(*) as impressions,
    COUNT(*) FILTER (WHERE s.status IN ('started', 'in_progress', 'completed')) as starts,
    COUNT(*) FILTER (WHERE s.status = 'completed') as completions,
    COUNT(*) FILTER (WHERE s.status = 'abandoned') as abandonments,
    CASE 
      WHEN COUNT(*) FILTER (WHERE s.status IN ('started', 'in_progress', 'completed')) > 0 
      THEN (COUNT(*) FILTER (WHERE s.status = 'completed')::DECIMAL / 
            COUNT(*) FILTER (WHERE s.status IN ('started', 'in_progress', 'completed'))::DECIMAL) * 100
      ELSE 0
    END as conversion_rate
  FROM submissions s
  WHERE DATE(s.created_at) = CURRENT_DATE - 1
  GROUP BY s.tenant_id, s.lead_magnet_id
  ON CONFLICT (tenant_id, lead_magnet_id, date) DO UPDATE SET
    impressions = EXCLUDED.impressions,
    starts = EXCLUDED.starts,
    completions = EXCLUDED.completions,
    abandonments = EXCLUDED.abandonments,
    conversion_rate = EXCLUDED.conversion_rate;

  -- Reset today counters in social proof stats
  UPDATE social_proof_stats
  SET today_completions = 0
  WHERE DATE(updated_at) < CURRENT_DATE;

  -- Reset weekly counters on Monday
  IF EXTRACT(DOW FROM CURRENT_DATE) = 1 THEN
    UPDATE social_proof_stats
    SET this_week_completions = 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CONSENT TRACKING FUNCTIONS
-- ============================================

-- Record consent
CREATE OR REPLACE FUNCTION record_consent(
  p_submission_id UUID,
  p_consent_template_id UUID,
  p_granted BOOLEAN,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_consent_text TEXT;
  v_record_id UUID;
BEGIN
  -- Get consent text at this moment
  SELECT CONCAT(title, ': ', description) INTO v_consent_text
  FROM consent_templates
  WHERE id = p_consent_template_id;

  INSERT INTO consent_records (
    submission_id,
    consent_template_id,
    granted,
    ip_hash,
    user_agent,
    consent_text,
    granted_at
  )
  VALUES (
    p_submission_id,
    p_consent_template_id,
    p_granted,
    p_ip_hash,
    p_user_agent,
    v_consent_text,
    NOW()
  )
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke consent
CREATE OR REPLACE FUNCTION revoke_consent(
  p_submission_id UUID,
  p_consent_template_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE consent_records
  SET 
    granted = false,
    revoked_at = NOW()
  WHERE submission_id = p_submission_id
    AND consent_template_id = p_consent_template_id
    AND granted = true
    AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CONDITIONAL LOGIC EVALUATION
-- ============================================

-- Evaluate flow condition
CREATE OR REPLACE FUNCTION evaluate_flow_condition(
  p_condition_id UUID,
  p_submission_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_condition RECORD;
  v_field_value JSONB;
  v_target_value JSONB;
BEGIN
  SELECT * INTO v_condition
  FROM flow_conditions
  WHERE id = p_condition_id;

  IF NOT FOUND THEN
    RETURN true; -- No condition = always show
  END IF;

  -- Get field value from submission data
  v_field_value := p_submission_data -> v_condition.source_field;
  v_target_value := v_condition.target_value;

  -- Evaluate based on operator
  CASE v_condition.operator
    WHEN 'equals' THEN
      RETURN v_field_value = v_target_value;
    WHEN 'not_equals' THEN
      RETURN v_field_value != v_target_value;
    WHEN 'contains' THEN
      RETURN v_field_value::text ILIKE '%' || v_target_value::text || '%';
    WHEN 'gt' THEN
      RETURN (v_field_value::text)::NUMERIC > (v_target_value::text)::NUMERIC;
    WHEN 'lt' THEN
      RETURN (v_field_value::text)::NUMERIC < (v_target_value::text)::NUMERIC;
    WHEN 'gte' THEN
      RETURN (v_field_value::text)::NUMERIC >= (v_target_value::text)::NUMERIC;
    WHEN 'lte' THEN
      RETURN (v_field_value::text)::NUMERIC <= (v_target_value::text)::NUMERIC;
    WHEN 'is_empty' THEN
      RETURN v_field_value IS NULL OR v_field_value::text = '' OR v_field_value::text = 'null';
    WHEN 'is_not_empty' THEN
      RETURN v_field_value IS NOT NULL AND v_field_value::text != '' AND v_field_value::text != 'null';
    WHEN 'in_array' THEN
      RETURN v_target_value ? v_field_value::text;
    ELSE
      RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Generic increment function
CREATE OR REPLACE FUNCTION increment(x INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN x + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Hash IP for privacy
CREATE OR REPLACE FUNCTION hash_ip(ip TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(ip || 'salt_for_privacy', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- GRANTS
-- ============================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_variant_impressions(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_variant_conversions(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION adjust_lead_score(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversion_rate(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_traffic_sources(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_consent(UUID, UUID, BOOLEAN, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION evaluate_flow_condition(UUID, JSONB) TO anon, authenticated;

