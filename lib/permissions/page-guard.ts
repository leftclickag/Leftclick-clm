import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Permission, UserRole } from "@/types/permissions";

/**
 * Server-seitige Funktion zum Schutz von Seiten
 * Prüft ob der Benutzer die erforderliche Berechtigung hat
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Hole User-Daten mit Rolle und Tenant
  const { data: userData } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect("/auth/login");
  }

  const role = userData.role as UserRole;

  // Super Admin hat alle Rechte
  if (role === 'super_admin') {
    return;
  }

  // Hole Berechtigungen für diese Rolle
  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('permissions')
    .eq('tenant_id', userData.tenant_id)
    .eq('role', role)
    .single();

  const permissions = rolePermissions?.permissions || getDefaultPermissions(role);

  if (!permissions.includes(permission)) {
    // Keine Berechtigung - Weiterleitung zum Dashboard
    redirect("/admin?error=insufficient_permissions");
  }
}

/**
 * Prüft, ob der Benutzer eine der angegebenen Berechtigungen hat
 */
export async function requireAnyPermission(requiredPermissions: Permission[]): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect("/auth/login");
  }

  const role = userData.role as UserRole;

  if (role === 'super_admin') {
    return;
  }

  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('permissions')
    .eq('tenant_id', userData.tenant_id)
    .eq('role', role)
    .single();

  const permissions = rolePermissions?.permissions || getDefaultPermissions(role);

  // Prüfe ob mindestens eine Berechtigung vorhanden ist
  const hasPermission = requiredPermissions.some(p => permissions.includes(p));

  if (!hasPermission) {
    redirect("/admin?error=insufficient_permissions");
  }
}

// Hilfsfunktion für Standard-Berechtigungen
function getDefaultPermissions(role: UserRole): Permission[] {
  const defaults: Record<string, Permission[]> = {
    super_admin: [
      'dashboard.view',
      'lead_magnets.view', 'lead_magnets.create', 'lead_magnets.edit', 'lead_magnets.delete',
      'leads.view', 'leads.export', 'leads.delete',
      'analytics.view', 'analytics.advanced',
      'integrations.view', 'integrations.create', 'integrations.edit', 'integrations.delete', 'integrations.test',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
      'permissions.view', 'permissions.edit',
      'settings.view', 'settings.edit', 'settings.sso',
      'invite_codes.view', 'invite_codes.create', 'invite_codes.delete',
      'profile.view', 'profile.edit',
    ],
    admin: [
      'dashboard.view',
      'lead_magnets.view', 'lead_magnets.create', 'lead_magnets.edit', 'lead_magnets.delete',
      'leads.view', 'leads.export',
      'analytics.view', 'analytics.advanced',
      'integrations.view', 'integrations.create', 'integrations.edit', 'integrations.delete', 'integrations.test',
      'users.view',
      'settings.view', 'settings.edit',
      'invite_codes.view',
      'profile.view', 'profile.edit',
    ],
    // Standard-Benutzer: Grundlegende Ansichtsrechte
    user: [
      'dashboard.view',
      'lead_magnets.view',
      'leads.view',
      'analytics.view',
      'profile.view', 'profile.edit',
    ],
  };

  return defaults[role] || [];
}

