import { createClient } from "@/lib/supabase/server";
import { createClient as createClientBrowser } from "@/lib/supabase/client";

interface Variant {
  id: string;
  variant_name: string;
  traffic_percentage: number;
  config: Record<string, any>;
  is_control: boolean;
  conversions: number;
  impressions: number;
}

interface ABTestStats {
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

class ABTestingService {
  // Server-side: Get variant for new visitor
  async assignVariant(leadMagnetId: string): Promise<Variant | null> {
    const supabase = await createClient();

    // Get active variants for this lead magnet
    const { data: variants } = await supabase
      .from("lead_magnet_variants")
      .select("*")
      .eq("lead_magnet_id", leadMagnetId)
      .eq("active", true)
      .order("created_at");

    if (!variants || variants.length === 0) {
      return null; // No A/B test configured
    }

    // Select variant based on traffic percentages
    const selectedVariant = this.selectVariantByWeight(variants);

    // Increment impression count
    await supabase.rpc("increment_variant_impressions", {
      p_variant_id: selectedVariant.id,
    });

    return selectedVariant;
  }

  // Client-side: Get assigned variant from session or assign new one
  async getOrAssignVariant(leadMagnetId: string): Promise<Variant | null> {
    if (typeof window === "undefined") return null;

    const supabase = createClientBrowser();

    // Check if variant already assigned in session
    const storedVariantId = sessionStorage.getItem(`clm_variant_${leadMagnetId}`);
    
    if (storedVariantId) {
      const { data: variant } = await supabase
        .from("lead_magnet_variants")
        .select("*")
        .eq("id", storedVariantId)
        .single();
      
      if (variant) return variant;
    }

    // Get active variants for this lead magnet
    const { data: variants } = await supabase
      .from("lead_magnet_variants")
      .select("*")
      .eq("lead_magnet_id", leadMagnetId)
      .eq("active", true)
      .order("created_at");

    if (!variants || variants.length === 0) {
      return null;
    }

    // Select variant based on traffic percentages
    const selectedVariant = this.selectVariantByWeight(variants);

    // Store in session
    sessionStorage.setItem(`clm_variant_${leadMagnetId}`, selectedVariant.id);

    // Increment impression count via API
    await fetch("/api/ab-test/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: selectedVariant.id }),
    });

    return selectedVariant;
  }

  private selectVariantByWeight(variants: Variant[]): Variant {
    // Normalize percentages to ensure they sum to 100
    const totalPercentage = variants.reduce((sum, v) => sum + v.traffic_percentage, 0);
    
    const random = Math.random() * totalPercentage;
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.traffic_percentage;
      if (random <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant (shouldn't happen)
    return variants[0];
  }

  // Get test statistics
  async getTestStats(leadMagnetId: string): Promise<ABTestStats[]> {
    const supabase = await createClient();

    const { data: variants } = await supabase
      .from("lead_magnet_variants")
      .select("*")
      .eq("lead_magnet_id", leadMagnetId)
      .order("created_at");

    if (!variants || variants.length === 0) {
      return [];
    }

    // Find control variant
    const control = variants.find((v) => v.is_control) || variants[0];
    const controlRate = control.impressions > 0 
      ? control.conversions / control.impressions 
      : 0;

    // Calculate stats for each variant
    const stats: ABTestStats[] = variants.map((variant) => {
      const conversionRate = variant.impressions > 0 
        ? variant.conversions / variant.impressions 
        : 0;
      
      const uplift = controlRate > 0 
        ? ((conversionRate - controlRate) / controlRate) * 100 
        : null;

      const significance = this.calculateStatisticalSignificance(
        control.conversions,
        control.impressions,
        variant.conversions,
        variant.impressions
      );

      return {
        variant_id: variant.id,
        variant_name: variant.variant_name,
        impressions: variant.impressions,
        conversions: variant.conversions,
        conversion_rate: conversionRate * 100,
        is_control: variant.is_control,
        is_winner: !variant.is_control && significance >= 95 && conversionRate > controlRate,
        uplift_percentage: variant.is_control ? null : uplift,
        statistical_significance: significance,
      };
    });

    return stats;
  }

  // Calculate statistical significance using Z-test
  private calculateStatisticalSignificance(
    controlConversions: number,
    controlImpressions: number,
    variantConversions: number,
    variantImpressions: number
  ): number {
    if (controlImpressions < 30 || variantImpressions < 30) {
      return 0; // Not enough data
    }

    const p1 = controlConversions / controlImpressions;
    const p2 = variantConversions / variantImpressions;
    
    const pooledP = (controlConversions + variantConversions) / 
                    (controlImpressions + variantImpressions);
    
    const se = Math.sqrt(
      pooledP * (1 - pooledP) * (1/controlImpressions + 1/variantImpressions)
    );

    if (se === 0) return 0;

    const z = Math.abs(p1 - p2) / se;
    
    // Convert Z-score to confidence percentage (approximate)
    // Using standard normal distribution
    if (z >= 2.576) return 99;
    if (z >= 1.960) return 95;
    if (z >= 1.645) return 90;
    if (z >= 1.282) return 80;
    
    return Math.round(z * 30); // Rough approximation for lower confidence
  }

  // Determine winner and optionally end test
  async determineWinner(leadMagnetId: string): Promise<{
    winner: Variant | null;
    confidence: number;
    shouldEndTest: boolean;
  }> {
    const stats = await this.getTestStats(leadMagnetId);
    
    const winners = stats.filter((s) => s.is_winner);
    
    if (winners.length === 0) {
      return { winner: null, confidence: 0, shouldEndTest: false };
    }

    // Get the variant with highest conversion rate among winners
    const bestWinner = winners.reduce((best, current) => 
      current.conversion_rate > best.conversion_rate ? current : best
    );

    const supabase = await createClient();
    const { data: variant } = await supabase
      .from("lead_magnet_variants")
      .select("*")
      .eq("id", bestWinner.variant_id)
      .single();

    return {
      winner: variant,
      confidence: bestWinner.statistical_significance,
      shouldEndTest: bestWinner.statistical_significance >= 95,
    };
  }

  // End test and apply winning variant
  async applyWinner(leadMagnetId: string, winnerVariantId: string): Promise<void> {
    const supabase = await createClient();

    // Get winner variant config
    const { data: winner } = await supabase
      .from("lead_magnet_variants")
      .select("config")
      .eq("id", winnerVariantId)
      .single();

    if (!winner) return;

    // Update lead magnet with winning config
    await supabase
      .from("lead_magnets")
      .update({ config: winner.config })
      .eq("id", leadMagnetId);

    // Deactivate all variants
    await supabase
      .from("lead_magnet_variants")
      .update({ active: false })
      .eq("lead_magnet_id", leadMagnetId);
  }

  // Create new A/B test
  async createTest(
    leadMagnetId: string,
    variants: Array<{
      name: string;
      config: Record<string, any>;
      traffic_percentage: number;
      is_control: boolean;
    }>
  ): Promise<void> {
    const supabase = await createClient();

    // Validate traffic percentages sum to 100
    const totalTraffic = variants.reduce((sum, v) => sum + v.traffic_percentage, 0);
    if (totalTraffic !== 100) {
      throw new Error("Traffic percentages must sum to 100");
    }

    // Ensure exactly one control
    const controls = variants.filter((v) => v.is_control);
    if (controls.length !== 1) {
      throw new Error("Exactly one variant must be marked as control");
    }

    // Deactivate existing variants
    await supabase
      .from("lead_magnet_variants")
      .update({ active: false })
      .eq("lead_magnet_id", leadMagnetId);

    // Create new variants
    const variantRecords = variants.map((v) => ({
      lead_magnet_id: leadMagnetId,
      variant_name: v.name,
      config: v.config,
      traffic_percentage: v.traffic_percentage,
      is_control: v.is_control,
      active: true,
    }));

    await supabase.from("lead_magnet_variants").insert(variantRecords);
  }
}

export const abTestingService = new ABTestingService();

