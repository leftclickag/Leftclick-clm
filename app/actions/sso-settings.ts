"use server";

import { createClient } from "@/lib/supabase/server";

const SSO_FLAG_KEY = "sso_microsoft";
// Assuming we are operating on the default tenant for global login settings
// or the first tenant found. In a real multi-tenant app, we might need context.
// For now, we'll try to find the 'LeftClick' tenant or just the first one.
// Ideally, we should pass the tenant ID, but for the login page, we don't have it yet unless it's in the URL.
// We will assume a single-tenant deployment model or main tenant controls this for now.

async function getTenantId(supabase: any) {
  // Try to find the default tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .limit(1)
    .single();
    
  return tenant?.id;
}

export async function getSSOSettings() {
  const supabase = await createClient();
  const tenantId = await getTenantId(supabase);

  if (!tenantId) return { enabled: false, clientId: "", tenantId: "" };

  const { data: flag } = await supabase
    .from("feature_flags")
    .select("enabled, config")
    .eq("tenant_id", tenantId)
    .eq("flag_key", SSO_FLAG_KEY)
    .single();

  if (!flag) {
    return { enabled: false, clientId: "", tenantId: "" };
  }

  return {
    enabled: flag.enabled || false,
    clientId: flag.config?.clientId || "",
    tenantId: flag.config?.tenantId || "",
  };
}

export async function updateSSOSettings(settings: { enabled: boolean; clientId: string; tenantId: string }) {
  const supabase = await createClient();
  const tenantId = await getTenantId(supabase);

  if (!tenantId) throw new Error("No tenant found");

  const { error } = await supabase
    .from("feature_flags")
    .upsert(
      {
        tenant_id: tenantId,
        flag_key: SSO_FLAG_KEY,
        enabled: settings.enabled,
        config: {
          clientId: settings.clientId,
          tenantId: settings.tenantId,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id, flag_key" }
    );

  if (error) throw error;
  
  return { success: true };
}

