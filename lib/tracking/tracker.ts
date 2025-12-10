import { createClient } from "@/lib/supabase/client";

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
}

interface DeviceInfo {
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
  user_agent: string;
}

export class Tracker {
  private sessionId: string;
  private submissionId: string | null = null;
  private startTime: number | null = null;
  private utmParams: UTMParams = {};
  private deviceInfo: DeviceInfo | null = null;
  private variantId: string | null = null;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    if (typeof window !== "undefined") {
      this.captureUTMParams();
      this.captureDeviceInfo();
    }
  }

  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "";

    let sessionId = sessionStorage.getItem("clm_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("clm_session_id", sessionId);
    }
    return sessionId;
  }

  private captureUTMParams(): void {
    const params = new URLSearchParams(window.location.search);
    this.utmParams = {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      utm_term: params.get("utm_term") || undefined,
      utm_content: params.get("utm_content") || undefined,
      referrer: document.referrer || undefined,
      landing_page: window.location.href,
    };

    // Store UTM params in session for later use
    if (Object.values(this.utmParams).some(Boolean)) {
      sessionStorage.setItem("clm_utm_params", JSON.stringify(this.utmParams));
    } else {
      // Try to restore from session
      const stored = sessionStorage.getItem("clm_utm_params");
      if (stored) {
        this.utmParams = JSON.parse(stored);
      }
    }
  }

  private captureDeviceInfo(): void {
    const ua = navigator.userAgent;
    let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
    
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      deviceType = "tablet";
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
      deviceType = "mobile";
    }

    // Detect browser
    let browser = "Unknown";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Trident")) browser = "IE";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Edg")) browser = "Edge Chromium";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    this.deviceInfo = {
      device_type: deviceType,
      browser,
      user_agent: ua,
    };
  }

  setVariantId(variantId: string): void {
    this.variantId = variantId;
    sessionStorage.setItem("clm_variant_id", variantId);
  }

  getVariantId(): string | null {
    if (!this.variantId && typeof window !== "undefined") {
      this.variantId = sessionStorage.getItem("clm_variant_id");
    }
    return this.variantId;
  }

  getSubmissionId(): string | null {
    return this.submissionId;
  }

  async trackEvent(
    eventType: "start" | "step_view" | "step_complete" | "abandon" | "conversion",
    leadMagnetId: string,
    metadata?: Record<string, any>
  ) {
    const supabase = createClient();

    // Create submission if it doesn't exist
    if (!this.submissionId && eventType === "start") {
      this.startTime = Date.now();

      const { data: submission } = await supabase
        .from("submissions")
        .insert({
          lead_magnet_id: leadMagnetId,
          session_id: this.sessionId,
          status: "started",
          // UTM Tracking
          utm_source: this.utmParams.utm_source,
          utm_medium: this.utmParams.utm_medium,
          utm_campaign: this.utmParams.utm_campaign,
          utm_term: this.utmParams.utm_term,
          utm_content: this.utmParams.utm_content,
          referrer: this.utmParams.referrer,
          landing_page: this.utmParams.landing_page,
          // Device Info
          device_type: this.deviceInfo?.device_type,
          browser: this.deviceInfo?.browser,
          user_agent: this.deviceInfo?.user_agent,
          // A/B Testing
          variant_id: this.variantId,
        })
        .select()
        .single();

      if (submission) {
        this.submissionId = submission.id;
        sessionStorage.setItem("clm_submission_id", submission.id);
      }
    }

    // Restore submission ID from session if needed
    if (!this.submissionId && typeof window !== "undefined") {
      this.submissionId = sessionStorage.getItem("clm_submission_id");
    }

    // Track the event
    if (this.submissionId) {
      const eventMetadata = {
        ...metadata,
        timestamp: new Date().toISOString(),
        time_since_start_ms: this.startTime ? Date.now() - this.startTime : null,
      };

      await supabase.from("tracking_events").insert({
        submission_id: this.submissionId,
        event_type: eventType,
        metadata: eventMetadata,
      });

      // Update social proof on conversion
      if (eventType === "conversion") {
        await this.trackConversion(leadMagnetId);
      }
    }
  }

  private async trackConversion(leadMagnetId: string) {
    // A/B Test result tracking
    if (this.variantId && this.submissionId) {
      const supabase = createClient();
      const completionTime = this.startTime 
        ? Math.round((Date.now() - this.startTime) / 1000) 
        : null;

      await supabase.from("ab_test_results").insert({
        variant_id: this.variantId,
        submission_id: this.submissionId,
        converted: true,
        time_to_complete_seconds: completionTime,
      });

      // Update variant conversion count
      await supabase.rpc("increment_variant_conversions", {
        p_variant_id: this.variantId,
      });
    }
  }

  async updateSubmissionStatus(
    status: "started" | "in_progress" | "completed" | "abandoned",
    data?: Record<string, any>
  ) {
    if (!this.submissionId) return;

    const supabase = createClient();
    await supabase
      .from("submissions")
      .update({
        status,
        data: data || {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", this.submissionId);
  }

  async trackStepProgress(
    stepNumber: number,
    totalSteps: number,
    stepData?: Record<string, any>
  ) {
    if (!this.submissionId) return;

    const supabase = createClient();
    const progress = Math.round((stepNumber / totalSteps) * 100);

    await supabase
      .from("submissions")
      .update({
        data: {
          current_step: stepNumber,
          total_steps: totalSteps,
          progress_percentage: progress,
          step_data: stepData,
        },
        status: stepNumber === totalSteps ? "completed" : "in_progress",
      })
      .eq("id", this.submissionId);
  }

  // Track page visibility for abandon detection
  setupAbandonTracking(leadMagnetId: string) {
    if (typeof window === "undefined") return;

    let isLeaving = false;

    // Track when user leaves the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isLeaving) {
        isLeaving = true;
        // Use sendBeacon for reliable tracking when leaving
        const payload = JSON.stringify({
          submission_id: this.submissionId,
          event_type: "potential_abandon",
          timestamp: new Date().toISOString(),
        });
        navigator.sendBeacon("/api/track/abandon", payload);
      }
    };

    // Track exit intent (mouse leaving viewport at top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        window.dispatchEvent(new CustomEvent("exitIntent", {
          detail: { submissionId: this.submissionId }
        }));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Return cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }

  // Get attribution summary
  getAttributionData(): UTMParams & DeviceInfo {
    return {
      ...this.utmParams,
      ...this.deviceInfo!,
    };
  }

  // Clear session data (for testing or reset)
  clearSession() {
    this.submissionId = null;
    this.startTime = null;
    this.variantId = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("clm_session_id");
      sessionStorage.removeItem("clm_submission_id");
      sessionStorage.removeItem("clm_variant_id");
      sessionStorage.removeItem("clm_utm_params");
    }
    this.sessionId = this.getOrCreateSessionId();
  }
}

// Singleton instance
export const tracker = new Tracker();

// Helper to get clean UTM params for display
export function formatUTMSource(submission: any): string {
  if (submission.utm_source) {
    return `${submission.utm_source}${submission.utm_medium ? ` / ${submission.utm_medium}` : ""}`;
  }
  if (submission.referrer) {
    try {
      const url = new URL(submission.referrer);
      return url.hostname;
    } catch {
      return "Direct";
    }
  }
  return "Direct";
}
