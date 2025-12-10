import { createClient } from "@/lib/supabase/server";

interface ScoringRule {
  id: string;
  name: string;
  conditions: {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "gt" | "lt" | "gte" | "lte" | "is_empty" | "is_not_empty" | "in_array";
    value: any;
  };
  score_value: number;
}

interface ScoreBreakdown {
  rule_id: string;
  rule_name: string;
  score: number;
  matched_value: any;
}

export class LeadScoringService {
  async calculateScore(
    submissionId: string,
    tenantId: string
  ): Promise<{ totalScore: number; grade: string; breakdown: ScoreBreakdown[] }> {
    const supabase = await createClient();

    // Get submission data
    const { data: submission } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (!submission) {
      throw new Error("Submission not found");
    }

    // Get active scoring rules for tenant
    const { data: rules } = await supabase
      .from("lead_scoring_rules")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("active", true);

    if (!rules || rules.length === 0) {
      // Use default scoring if no rules configured
      return this.calculateDefaultScore(submission);
    }

    // Calculate score based on rules
    let totalScore = 0;
    const breakdown: ScoreBreakdown[] = [];

    for (const rule of rules) {
      const result = this.evaluateRule(rule, submission);
      if (result.matched) {
        totalScore += rule.score_value;
        breakdown.push({
          rule_id: rule.id,
          rule_name: rule.name,
          score: rule.score_value,
          matched_value: result.matchedValue,
        });
      }
    }

    const grade = this.calculateGrade(totalScore);

    // Save score to database
    await supabase
      .from("lead_scores")
      .upsert({
        submission_id: submissionId,
        total_score: totalScore,
        score_breakdown: breakdown,
        grade,
        calculated_at: new Date().toISOString(),
      });

    return { totalScore, grade, breakdown };
  }

  private evaluateRule(
    rule: ScoringRule,
    submission: any
  ): { matched: boolean; matchedValue: any } {
    const { field, operator, value } = rule.conditions;
    
    // Navigate nested fields like "data.budget" or "contact_info.company_size"
    const fieldValue = this.getNestedValue(submission, field);

    switch (operator) {
      case "equals":
        return { matched: fieldValue === value, matchedValue: fieldValue };
      case "not_equals":
        return { matched: fieldValue !== value, matchedValue: fieldValue };
      case "contains":
        return { 
          matched: String(fieldValue).toLowerCase().includes(String(value).toLowerCase()),
          matchedValue: fieldValue 
        };
      case "gt":
        return { matched: Number(fieldValue) > Number(value), matchedValue: fieldValue };
      case "lt":
        return { matched: Number(fieldValue) < Number(value), matchedValue: fieldValue };
      case "gte":
        return { matched: Number(fieldValue) >= Number(value), matchedValue: fieldValue };
      case "lte":
        return { matched: Number(fieldValue) <= Number(value), matchedValue: fieldValue };
      case "is_empty":
        return { matched: !fieldValue || fieldValue === "", matchedValue: fieldValue };
      case "is_not_empty":
        return { matched: !!fieldValue && fieldValue !== "", matchedValue: fieldValue };
      case "in_array":
        return { 
          matched: Array.isArray(value) && value.includes(fieldValue),
          matchedValue: fieldValue 
        };
      default:
        return { matched: false, matchedValue: null };
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private calculateDefaultScore(submission: any): {
    totalScore: number;
    grade: string;
    breakdown: ScoreBreakdown[];
  } {
    let totalScore = 0;
    const breakdown: ScoreBreakdown[] = [];

    // Base score for completing
    if (submission.status === "completed") {
      totalScore += 50;
      breakdown.push({
        rule_id: "default_completion",
        rule_name: "Lead Magnet abgeschlossen",
        score: 50,
        matched_value: true,
      });
    }

    // Email provided
    if (submission.contact_info?.email) {
      totalScore += 20;
      breakdown.push({
        rule_id: "default_email",
        rule_name: "E-Mail angegeben",
        score: 20,
        matched_value: submission.contact_info.email,
      });
    }

    // Phone provided
    if (submission.contact_info?.phone) {
      totalScore += 15;
      breakdown.push({
        rule_id: "default_phone",
        rule_name: "Telefon angegeben",
        score: 15,
        matched_value: submission.contact_info.phone,
      });
    }

    // Company provided
    if (submission.contact_info?.company) {
      totalScore += 10;
      breakdown.push({
        rule_id: "default_company",
        rule_name: "Unternehmen angegeben",
        score: 10,
        matched_value: submission.contact_info.company,
      });
    }

    // Budget info (if calculator)
    if (submission.data?.budget && submission.data.budget > 10000) {
      totalScore += 25;
      breakdown.push({
        rule_id: "default_high_budget",
        rule_name: "Hohes Budget",
        score: 25,
        matched_value: submission.data.budget,
      });
    }

    const grade = this.calculateGrade(totalScore);
    return { totalScore, grade, breakdown };
  }

  private calculateGrade(score: number): "hot" | "warm" | "cold" {
    if (score >= 80) return "hot";
    if (score >= 40) return "warm";
    return "cold";
  }

  // Get score display info
  static getGradeInfo(grade: string): { label: string; color: string; emoji: string } {
    switch (grade) {
      case "hot":
        return { label: "Heißer Lead", color: "#EF4444", emoji: "🔥" };
      case "warm":
        return { label: "Warmer Lead", color: "#F59E0B", emoji: "☀️" };
      case "cold":
        return { label: "Kalter Lead", color: "#3B82F6", emoji: "❄️" };
      default:
        return { label: "Nicht bewertet", color: "#6B7280", emoji: "❓" };
    }
  }
}

export const leadScoringService = new LeadScoringService();

