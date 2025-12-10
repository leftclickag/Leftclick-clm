// 🔥 Type definitions for all spicy features

// ============================================
// A/B TESTING
// ============================================
export interface ABTestVariant {
  id: string;
  lead_magnet_id: string;
  variant_name: string;
  traffic_percentage: number;
  config: Record<string, any>;
  is_control: boolean;
  conversions: number;
  impressions: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ABTestResult {
  id: string;
  variant_id: string;
  submission_id: string;
  converted: boolean;
  time_to_complete_seconds: number | null;
  created_at: string;
}

export interface ABTestStats {
  variant_id: string;
  variant_name: string;
  impressions: number;
  conversions: number;
  conversion_rate: number;
  is_winner: boolean;
  is_control: boolean;
  uplift_percentage: number | null;
  statistical_significance: number;
}

// ============================================
// LEAD SCORING
// ============================================
export interface LeadScoringRule {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  conditions: {
    field: string;
    operator: ScoringOperator;
    value: any;
  };
  score_value: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type ScoringOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "is_empty"
  | "is_not_empty"
  | "in_array";

export interface LeadScore {
  id: string;
  submission_id: string;
  total_score: number;
  score_breakdown: ScoreBreakdownItem[];
  grade: "hot" | "warm" | "cold";
  calculated_at: string;
}

export interface ScoreBreakdownItem {
  rule_id: string;
  rule_name: string;
  score: number;
  matched_value: any;
}

// ============================================
// EMAIL AUTOMATIONS
// ============================================
export interface EmailAutomation {
  id: string;
  tenant_id: string;
  lead_magnet_id: string;
  name: string;
  trigger_event: AutomationTrigger;
  trigger_conditions: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type AutomationTrigger =
  | "completed"
  | "abandoned"
  | "started"
  | "step_complete";

export interface AutomationStep {
  id: string;
  automation_id: string;
  step_order: number;
  delay_minutes: number;
  action_type: AutomationActionType;
  config: Record<string, any>;
  created_at: string;
}

export type AutomationActionType =
  | "send_email"
  | "send_webhook"
  | "send_slack"
  | "update_score"
  | "add_tag";

export interface AutomationExecution {
  id: string;
  automation_id: string;
  submission_id: string;
  current_step: number;
  status: AutomationStatus;
  next_execution_at: string | null;
  started_at: string;
  completed_at: string | null;
}

export type AutomationStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "failed";

// ============================================
// NOTIFICATION CHANNELS
// ============================================
export interface NotificationChannel {
  id: string;
  tenant_id: string;
  channel_type: NotificationChannelType;
  name: string;
  webhook_url?: string;
  api_credentials: Record<string, any>;
  config: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationChannelType =
  | "slack"
  | "teams"
  | "whatsapp"
  | "telegram"
  | "discord";

export interface NotificationTrigger {
  id: string;
  channel_id: string;
  event_type: NotificationEventType;
  message_template: string;
  conditions: Record<string, any>;
  active: boolean;
  created_at: string;
}

export type NotificationEventType =
  | "new_lead"
  | "hot_lead"
  | "abandoned"
  | "conversion"
  | "daily_summary";

// ============================================
// SOCIAL PROOF
// ============================================
export interface SocialProofStats {
  id: string;
  lead_magnet_id: string;
  total_completions: number;
  today_completions: number;
  this_week_completions: number;
  last_completion_at: string | null;
  avg_completion_time_seconds: number | null;
  satisfaction_rating: number | null;
  updated_at: string;
}

// ============================================
// FLOW CONDITIONS
// ============================================
export interface FlowCondition {
  id: string;
  flow_step_id: string;
  condition_type: ConditionType;
  source_field: string;
  operator: ScoringOperator;
  target_value: any;
  target_step_id?: string;
  priority: number;
  created_at: string;
}

export type ConditionType = "show_if" | "skip_if" | "branch_to";

// ============================================
// GAMIFICATION
// ============================================
export interface Achievement {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  icon: string;
  badge_color: string;
  condition_type: AchievementCondition;
  condition_value: number;
  created_at: string;
}

export type AchievementCondition =
  | "completions"
  | "streak"
  | "speed"
  | "score"
  | "custom";

export interface UserAchievement {
  id: string;
  submission_id: string;
  achievement_id: string;
  earned_at: string;
}

// ============================================
// TRANSLATIONS / i18n
// ============================================
export interface Translation {
  id: string;
  tenant_id: string;
  resource_type: TranslationResourceType;
  resource_id: string;
  language_code: string;
  field_name: string;
  translated_value: string;
  created_at: string;
  updated_at: string;
}

export type TranslationResourceType =
  | "lead_magnet"
  | "flow_step"
  | "email_template"
  | "ui";

export interface SupportedLanguage {
  id: string;
  tenant_id: string;
  language_code: string;
  language_name: string;
  is_default: boolean;
  active: boolean;
  created_at: string;
}

// ============================================
// CONSENT MANAGEMENT
// ============================================
export interface ConsentTemplate {
  id: string;
  tenant_id: string;
  name: string;
  consent_type: ConsentType;
  title: string;
  description: string;
  required: boolean;
  version: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type ConsentType =
  | "marketing"
  | "analytics"
  | "necessary"
  | "third_party";

export interface ConsentRecord {
  id: string;
  submission_id: string;
  consent_template_id: string;
  granted: boolean;
  ip_hash?: string;
  user_agent?: string;
  consent_text: string;
  granted_at: string;
  revoked_at?: string;
}

// ============================================
// TAGS & SEGMENTATION
// ============================================
export interface Tag {
  id: string;
  tenant_id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
}

export interface SubmissionTag {
  id: string;
  submission_id: string;
  tag_id: string;
  added_at: string;
  added_by?: string;
}

// ============================================
// EMBED CONFIGURATIONS
// ============================================
export interface EmbedConfig {
  id: string;
  lead_magnet_id: string;
  embed_type: EmbedType;
  config: {
    width?: string;
    height?: string;
    position?: string;
    trigger?: string;
    triggerValue?: number;
  };
  allowed_domains: string[];
  custom_css?: string;
  custom_js?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type EmbedType =
  | "iframe"
  | "popup"
  | "slide_in"
  | "full_page"
  | "inline";

// ============================================
// EXIT INTENT
// ============================================
export interface ExitIntentConfig {
  id: string;
  lead_magnet_id: string;
  enabled: boolean;
  delay_seconds: number;
  show_only_once: boolean;
  headline: string;
  subheadline?: string;
  cta_text: string;
  dismiss_text: string;
  incentive_type?: IncentiveType;
  incentive_value?: string;
  background_color: string;
  overlay_opacity: number;
  created_at: string;
  updated_at: string;
}

export type IncentiveType = "discount" | "bonus" | "reminder" | "custom";

// ============================================
// DAILY ANALYTICS
// ============================================
export interface DailyAnalytics {
  id: string;
  tenant_id: string;
  lead_magnet_id: string;
  date: string;
  impressions: number;
  starts: number;
  completions: number;
  abandonments: number;
  avg_time_seconds?: number;
  conversion_rate: number;
  top_traffic_source?: string;
  top_device?: string;
  created_at: string;
}

// ============================================
// PERSONALIZATION TOKENS
// ============================================
export interface PersonalizationToken {
  id: string;
  tenant_id: string;
  token_key: string;
  display_name: string;
  source_field: string;
  default_value?: string;
  created_at: string;
}

// ============================================
// EXTENDED SUBMISSION (with new fields)
// ============================================
export interface ExtendedSubmission {
  id: string;
  lead_magnet_id: string;
  tenant_id: string;
  session_id: string;
  status: "started" | "in_progress" | "completed" | "abandoned";
  data: Record<string, any>;
  result: Record<string, any>;
  contact_info: Record<string, any>;
  // UTM Tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  // Device Info
  device_type?: "desktop" | "mobile" | "tablet";
  browser?: string;
  user_agent?: string;
  ip_hash?: string;
  country?: string;
  city?: string;
  // A/B Testing
  variant_id?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
}

