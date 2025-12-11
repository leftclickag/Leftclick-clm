import { createClient } from "@/lib/supabase/server";

interface ApiIntegration {
  id: string;
  name: string;
  endpoint_url: string;
  http_method: string;
  auth_type: string;
  auth_config: Record<string, any>;
  headers: Record<string, any>;
  data_mapping: Record<string, any>;
  timeout_seconds: number;
  retry_enabled: boolean;
  retry_max_attempts: number;
  retry_delay_seconds: number;
}

interface LeadData {
  id: string;
  lead_magnet_id: string;
  status: string;
  contact_info: Record<string, any>;
  data: Record<string, any>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  device_type?: string;
  browser?: string;
  country?: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

class ApiPushService {
  /**
   * Pusht einen Lead an alle aktiven API-Integrationen
   */
  async pushLead(leadData: LeadData, event: string = "lead.completed") {
    const supabase = await createClient();

    // Hole alle aktiven Integrationen für diesen Trigger
    const { data: integrations, error } = await supabase
      .from("api_integrations")
      .select("*")
      .eq("active", true)
      .contains("trigger_on", [event]);

    if (error) {
      console.error("Error fetching integrations:", error);
      return;
    }

    if (!integrations || integrations.length === 0) {
      return; // Keine aktiven Integrationen
    }

    // Filter Integrationen nach Lead-Magnet-ID
    const relevantIntegrations = integrations.filter((integration) => {
      // Wenn lead_magnet_ids null ist, gilt für alle Lead-Magnets
      if (!integration.lead_magnet_ids || integration.lead_magnet_ids.length === 0) {
        return true;
      }
      // Prüfe ob Lead-Magnet-ID in der Liste ist
      return integration.lead_magnet_ids.includes(leadData.lead_magnet_id);
    });

    // Pushe an alle relevanten Integrationen (parallel)
    await Promise.allSettled(
      relevantIntegrations.map((integration) =>
        this.pushToIntegration(integration, leadData)
      )
    );
  }

  /**
   * Pusht einen Lead an eine spezifische Integration
   */
  private async pushToIntegration(
    integration: ApiIntegration,
    leadData: LeadData
  ) {
    const startTime = Date.now();
    const supabase = await createClient();

    try {
      // Transformiere die Daten basierend auf dem Mapping
      const transformedData = this.transformData(integration.data_mapping, leadData);

      // Baue Request-Headers
      const headers = this.buildHeaders(integration);

      // Baue Request
      const requestConfig: RequestInit = {
        method: integration.http_method,
        headers,
        body: JSON.stringify(transformedData),
        signal: AbortSignal.timeout(integration.timeout_seconds * 1000),
      };

      // Führe Request aus
      const response = await fetch(integration.endpoint_url, requestConfig);
      const responseText = await response.text();
      const duration = Date.now() - startTime;

      // Parse Response-Headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Log den Versuch
      await this.logAttempt({
        supabase,
        integrationId: integration.id,
        submissionId: leadData.id,
        requestUrl: integration.endpoint_url,
        requestMethod: integration.http_method,
        requestHeaders: headers,
        requestBody: transformedData,
        responseStatus: response.status,
        responseHeaders,
        responseBody: responseText,
        success: response.ok,
        errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
        durationMs: duration,
        attemptNumber: 1,
      });

      // Update Integration-Statistiken
      if (response.ok) {
        await supabase
          .from("api_integrations")
          .update({
            last_success_at: new Date().toISOString(),
            success_count: integration.success_count + 1,
          })
          .eq("id", integration.id);
      } else {
        await supabase
          .from("api_integrations")
          .update({
            last_error_at: new Date().toISOString(),
            last_error_message: `HTTP ${response.status}: ${response.statusText}`,
            error_count: integration.error_count + 1,
          })
          .eq("id", integration.id);

        // Schedule Retry wenn aktiviert
        if (integration.retry_enabled && integration.retry_max_attempts > 1) {
          await this.scheduleRetry(integration, leadData, 2);
        }
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || "Unknown error";

      // Log den Fehler
      await this.logAttempt({
        supabase,
        integrationId: integration.id,
        submissionId: leadData.id,
        requestUrl: integration.endpoint_url,
        requestMethod: integration.http_method,
        requestHeaders: this.buildHeaders(integration),
        requestBody: this.transformData(integration.data_mapping, leadData),
        responseStatus: null,
        responseHeaders: {},
        responseBody: null,
        success: false,
        errorMessage,
        durationMs: duration,
        attemptNumber: 1,
      });

      // Update Integration-Statistiken
      await supabase
        .from("api_integrations")
        .update({
          last_error_at: new Date().toISOString(),
          last_error_message: errorMessage,
          error_count: integration.error_count + 1,
        })
        .eq("id", integration.id);

      console.error(`API Push error for ${integration.name}:`, error);

      // Schedule Retry wenn aktiviert
      if (integration.retry_enabled && integration.retry_max_attempts > 1) {
        await this.scheduleRetry(integration, leadData, 2);
      }
    }
  }

  /**
   * Transformiert Lead-Daten basierend auf dem Mapping
   */
  private transformData(
    mapping: Record<string, any>,
    leadData: LeadData
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(mapping)) {
      if (typeof value === "string") {
        // Unterstütze Template-Syntax: {{path.to.field}}
        result[key] = this.resolveTemplate(value, leadData);
      } else if (typeof value === "object" && value !== null) {
        // Rekursiv für verschachtelte Objekte
        result[key] = this.transformData(value, leadData);
      } else {
        // Statischer Wert
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Resolved Template-Strings wie {{contact_info.email}}
   */
  private resolveTemplate(template: string, leadData: LeadData): any {
    // Finde alle {{...}} Templates
    const matches = template.match(/\{\{([^}]+)\}\}/g);

    if (!matches) {
      return template; // Kein Template, gib String zurück
    }

    let result = template;

    for (const match of matches) {
      const path = match.replace(/\{\{|\}\}/g, "").trim();
      const value = this.getNestedValue(leadData, path);
      result = result.replace(match, value !== undefined ? String(value) : "");
    }

    // Wenn der ganze String ein Template war, gib den Wert direkt zurück
    if (matches.length === 1 && template === matches[0]) {
      const path = matches[0].replace(/\{\{|\}\}/g, "").trim();
      return this.getNestedValue(leadData, path);
    }

    return result;
  }

  /**
   * Holt einen Wert aus einem verschachtelten Objekt via Pfad
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Baut Request-Headers basierend auf Auth-Config
   */
  private buildHeaders(integration: ApiIntegration): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...integration.headers,
    };

    // Authentifizierung hinzufügen
    switch (integration.auth_type) {
      case "bearer":
        if (integration.auth_config.token) {
          headers["Authorization"] = `Bearer ${integration.auth_config.token}`;
        }
        break;

      case "api_key":
        if (integration.auth_config.header && integration.auth_config.value) {
          headers[integration.auth_config.header] = integration.auth_config.value;
        }
        break;

      case "basic":
        if (integration.auth_config.username && integration.auth_config.password) {
          const credentials = Buffer.from(
            `${integration.auth_config.username}:${integration.auth_config.password}`
          ).toString("base64");
          headers["Authorization"] = `Basic ${credentials}`;
        }
        break;

      case "custom":
        // Für Custom Auth werden die Header direkt aus auth_config verwendet
        Object.assign(headers, integration.auth_config);
        break;
    }

    return headers;
  }

  /**
   * Loggt einen API-Versuch
   */
  private async logAttempt(params: {
    supabase: any;
    integrationId: string;
    submissionId: string;
    requestUrl: string;
    requestMethod: string;
    requestHeaders: Record<string, any>;
    requestBody: Record<string, any>;
    responseStatus: number | null;
    responseHeaders: Record<string, any>;
    responseBody: string | null;
    success: boolean;
    errorMessage: string | null;
    durationMs: number;
    attemptNumber: number;
    retryScheduledFor?: string;
  }) {
    const { supabase, ...logData } = params;

    await supabase.from("api_integration_logs").insert({
      integration_id: logData.integrationId,
      submission_id: logData.submissionId,
      request_url: logData.requestUrl,
      request_method: logData.requestMethod,
      request_headers: logData.requestHeaders,
      request_body: logData.requestBody,
      response_status: logData.responseStatus,
      response_headers: logData.responseHeaders,
      response_body: logData.responseBody,
      success: logData.success,
      error_message: logData.errorMessage,
      duration_ms: logData.durationMs,
      attempt_number: logData.attemptNumber,
      retry_scheduled_for: logData.retryScheduledFor,
    });
  }

  /**
   * Plant einen Retry-Versuch
   */
  private async scheduleRetry(
    integration: ApiIntegration,
    leadData: LeadData,
    attemptNumber: number
  ) {
    if (attemptNumber > integration.retry_max_attempts) {
      return; // Max Attempts erreicht
    }

    const retryAt = new Date();
    retryAt.setSeconds(
      retryAt.getSeconds() + integration.retry_delay_seconds * (attemptNumber - 1)
    );

    // In einer echten Implementierung würde man hier einen Job-Queue verwenden
    // Für jetzt loggen wir nur, dass ein Retry geplant ist
    console.log(
      `Retry scheduled for ${integration.name} at ${retryAt.toISOString()}`
    );

    // TODO: Implementiere Job-Queue für Retries
    // Mögliche Optionen: Bull, BullMQ, oder Supabase pg_cron
  }

  /**
   * Testet eine Integration mit Mock-Daten
   */
  async testIntegration(integrationId: string) {
    const supabase = await createClient();

    // Lade Integration
    const { data: integration, error } = await supabase
      .from("api_integrations")
      .select("*")
      .eq("id", integrationId)
      .single();

    if (error || !integration) {
      throw new Error("Integration not found");
    }

    // Mock Lead-Daten
    const mockLeadData: LeadData = {
      id: "test-" + Date.now(),
      lead_magnet_id: "test-lead-magnet",
      status: "completed",
      contact_info: {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phone: "+49 123 456789",
      },
      data: {
        calculatorResult: 1500,
        selectedOption: "Premium",
        customField: "Test Value",
      },
      utm_source: "test",
      utm_medium: "api-test",
      utm_campaign: "integration-test",
      referrer: "https://example.com",
      device_type: "desktop",
      browser: "Chrome",
      country: "DE",
      city: "Berlin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Pushe Test-Daten
    await this.pushToIntegration(integration as any, mockLeadData);

    return { success: true, message: "Test completed. Check logs for results." };
  }
}

export const apiPushService = new ApiPushService();


