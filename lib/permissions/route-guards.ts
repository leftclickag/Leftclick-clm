import { redirect } from "next/navigation";
import { PermissionsService } from "./permissions-service";
import { Permission } from "@/types/permissions";

/**
 * Route-Guard: Prüft, ob der Benutzer eine bestimmte Berechtigung hat
 * Leitet zu /admin um, wenn keine Berechtigung vorhanden ist
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const hasPermission = await PermissionsService.hasPermission(permission);
  
  if (!hasPermission) {
    redirect("/admin");
  }
}

/**
 * Route-Guard: Prüft, ob der Benutzer eine der angegebenen Berechtigungen hat
 * Leitet zu /admin um, wenn keine Berechtigung vorhanden ist
 */
export async function requireAnyPermission(permissions: Permission[]): Promise<void> {
  const hasPermission = await PermissionsService.hasAnyPermission(permissions);
  
  if (!hasPermission) {
    redirect("/admin");
  }
}

/**
 * Route-Guard: Prüft, ob der Benutzer alle angegebenen Berechtigungen hat
 * Leitet zu /admin um, wenn nicht alle Berechtigungen vorhanden sind
 */
export async function requireAllPermissions(permissions: Permission[]): Promise<void> {
  const hasPermissions = await PermissionsService.hasAllPermissions(permissions);
  
  if (!hasPermissions) {
    redirect("/admin");
  }
}

/**
 * Mapping von Routen zu erforderlichen Berechtigungen
 */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/admin": "dashboard.view",
  "/admin/lead-magnets": "lead_magnets.view",
  "/admin/lead-magnets/new": "lead_magnets.create",
  "/admin/leads": "leads.view",
  "/admin/analytics": "analytics.view",
  "/admin/users": "users.view",
  "/admin/invite-codes": "invite_codes.view",
  "/admin/settings": "settings.view",
  "/admin/permissions": "permissions.view",
  "/admin/profile": "profile.view",
  "/admin/help": "dashboard.view", // Alle Benutzer mit Dashboard-Zugriff können die Hilfe sehen
};

/**
 * Prüft die Berechtigung für eine bestimmte Route
 */
export async function checkRoutePermission(pathname: string): Promise<boolean> {
  // Finde die passende Route (auch mit dynamischen Segmenten)
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });

  if (!matchedRoute) {
    // Wenn keine Route gefunden wurde, erlaube Zugriff
    return true;
  }

  const requiredPermission = ROUTE_PERMISSIONS[matchedRoute];
  return await PermissionsService.hasPermission(requiredPermission);
}

