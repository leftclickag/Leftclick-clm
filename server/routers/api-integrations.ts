import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { apiPushService } from "@/lib/api-integration/api-push-service";

// Validation Schemas
const authConfigSchema = z.record(z.any());

const dataMappingSchema = z.record(z.any());

const apiIntegrationSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  active: z.boolean().default(true),
  endpoint_url: z.string().url(),
  http_method: z.enum(["POST", "PUT", "PATCH"]).default("POST"),
  auth_type: z.enum(["none", "bearer", "api_key", "basic", "custom"]).default("none"),
  auth_config: authConfigSchema.default({}),
  headers: z.record(z.string()).default({}),
  data_mapping: dataMappingSchema,
  trigger_on: z.array(z.string()).default(["lead.completed"]),
  filter_conditions: z.record(z.any()).default({}),
  lead_magnet_ids: z.array(z.string().uuid()).optional().nullable(),
  retry_enabled: z.boolean().default(true),
  retry_max_attempts: z.number().int().min(1).max(10).default(3),
  retry_delay_seconds: z.number().int().min(0).default(60),
  timeout_seconds: z.number().int().min(1).max(300).default(30),
});

export const apiIntegrationsRouter = router({
  // Liste aller API-Integrationen
  list: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
        active: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, active } = input;
      const offset = (page - 1) * pageSize;

      let query = ctx.supabase
        .from("api_integrations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (active !== undefined) {
        query = query.eq("active", active);
      }

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      return {
        integrations: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    }),

  // Einzelne Integration abrufen
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("api_integrations")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  // Neue Integration erstellen
  create: adminProcedure
    .input(apiIntegrationSchema)
    .mutation(async ({ ctx, input }) => {
      // Hole Tenant ID vom User
      const { data: userData } = await ctx.supabase
        .from("users")
        .select("tenant_id")
        .eq("id", ctx.userId)
        .single();

      if (!userData?.tenant_id) {
        throw new Error("User has no tenant");
      }

      const { data, error } = await ctx.supabase
        .from("api_integrations")
        .insert({
          ...input,
          tenant_id: userData.tenant_id,
          created_by: ctx.userId,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  // Integration aktualisieren
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: apiIntegrationSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("api_integrations")
        .update(input.data)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  // Integration löschen
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("api_integrations")
        .delete()
        .eq("id", input.id);

      if (error) throw new Error(error.message);
      return { success: true };
    }),

  // Integration aktivieren/deaktivieren
  toggleActive: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        active: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("api_integrations")
        .update({ active: input.active })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  // Integration testen
  test: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await apiPushService.testIntegration(input.id);
        return result;
      } catch (error: any) {
        throw new Error(`Test failed: ${error.message}`);
      }
    }),

  // Statistiken für eine Integration
  stats: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Hole Integration
      const { data: integration } = await ctx.supabase
        .from("api_integrations")
        .select("success_count, error_count, last_success_at, last_error_at")
        .eq("id", input.id)
        .single();

      // Hole letzte Logs
      const { data: recentLogs } = await ctx.supabase
        .from("api_integration_logs")
        .select("*")
        .eq("integration_id", input.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Berechne Success Rate
      const totalAttempts =
        (integration?.success_count || 0) + (integration?.error_count || 0);
      const successRate =
        totalAttempts > 0
          ? ((integration?.success_count || 0) / totalAttempts) * 100
          : 0;

      return {
        successCount: integration?.success_count || 0,
        errorCount: integration?.error_count || 0,
        successRate: Math.round(successRate * 10) / 10,
        lastSuccessAt: integration?.last_success_at,
        lastErrorAt: integration?.last_error_at,
        recentLogs: recentLogs || [],
      };
    }),

  // Logs für eine Integration abrufen
  logs: adminProcedure
    .input(
      z.object({
        integrationId: z.string().uuid(),
        page: z.number().default(1),
        pageSize: z.number().default(50),
        success: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { integrationId, page, pageSize, success } = input;
      const offset = (page - 1) * pageSize;

      let query = ctx.supabase
        .from("api_integration_logs")
        .select("*", { count: "exact" })
        .eq("integration_id", integrationId)
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (success !== undefined) {
        query = query.eq("success", success);
      }

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      return {
        logs: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    }),

  // Alle verfügbaren Lead-Magnets für Filter
  getLeadMagnets: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("lead_magnets")
      .select("id, title, type, slug")
      .eq("active", true)
      .order("title");

    if (error) throw new Error(error.message);
    return data || [];
  }),

  // Daten-Mapping-Vorlagen
  getMappingTemplates: adminProcedure.query(async () => {
    return {
      templates: [
        {
          name: "Standard",
          description: "Grundlegendes Mapping für die meisten Systeme",
          mapping: {
            email: "{{contact_info.email}}",
            first_name: "{{contact_info.firstName}}",
            last_name: "{{contact_info.lastName}}",
            phone: "{{contact_info.phone}}",
            lead_source: "{{utm_source}}",
            lead_medium: "{{utm_medium}}",
            lead_campaign: "{{utm_campaign}}",
          },
        },
        {
          name: "CRM (Salesforce)",
          description: "Mapping für Salesforce Lead API",
          mapping: {
            Email: "{{contact_info.email}}",
            FirstName: "{{contact_info.firstName}}",
            LastName: "{{contact_info.lastName}}",
            Phone: "{{contact_info.phone}}",
            Company: "{{contact_info.company}}",
            LeadSource: "{{utm_source}}",
            Status: "New",
            Description: "Lead von {{lead_magnet_id}}",
          },
        },
        {
          name: "HubSpot",
          description: "Mapping für HubSpot Contacts API",
          mapping: {
            properties: {
              email: "{{contact_info.email}}",
              firstname: "{{contact_info.firstName}}",
              lastname: "{{contact_info.lastName}}",
              phone: "{{contact_info.phone}}",
              hs_lead_status: "NEW",
              lifecyclestage: "lead",
            },
          },
        },
        {
          name: "ActiveCampaign",
          description: "Mapping für ActiveCampaign API",
          mapping: {
            contact: {
              email: "{{contact_info.email}}",
              firstName: "{{contact_info.firstName}}",
              lastName: "{{contact_info.lastName}}",
              phone: "{{contact_info.phone}}",
              fieldValues: [
                {
                  field: "1",
                  value: "{{utm_source}}",
                },
              ],
            },
          },
        },
        {
          name: "Custom Webhook",
          description: "Flexibles Mapping mit allen verfügbaren Feldern",
          mapping: {
            lead_id: "{{id}}",
            email: "{{contact_info.email}}",
            name: "{{contact_info.firstName}} {{contact_info.lastName}}",
            data: {
              calculator_result: "{{data.calculatorResult}}",
              selected_options: "{{data.selectedOptions}}",
            },
            tracking: {
              source: "{{utm_source}}",
              medium: "{{utm_medium}}",
              campaign: "{{utm_campaign}}",
              referrer: "{{referrer}}",
            },
            device: {
              type: "{{device_type}}",
              browser: "{{browser}}",
            },
            location: {
              country: "{{country}}",
              city: "{{city}}",
            },
            timestamp: "{{created_at}}",
          },
        },
      ],
    };
  }),
});



