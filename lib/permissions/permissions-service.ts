import { createClient } from "@/lib/supabase/server";
import { 
  Permission, 
  UserRole, 
  DEFAULT_ROLE_PERMISSIONS,
  PermissionConfig 
} from "@/types/permissions";

/**
 * Service für die Verwaltung von Berechtigungen
 */
export class PermissionsService {
  /**
   * Holt die Rolle des aktuellen Benutzers
   */
  static async getCurrentUserRole(): Promise<UserRole | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role as UserRole || null;
  }

  /**
   * Holt die Berechtigungen für eine bestimmte Rolle
   */
  static async getPermissionsForRole(
    tenantId: string, 
    role: UserRole
  ): Promise<Permission[]> {
    const supabase = await createClient();
    
    // Versuche custom Berechtigungen aus der DB zu holen
    const { data } = await supabase
      .from('role_permissions')
      .select('permissions')
      .eq('tenant_id', tenantId)
      .eq('role', role)
      .single();

    // Wenn custom Berechtigungen existieren, nutze diese
    if (data?.permissions) {
      return data.permissions as Permission[];
    }

    // Sonst nutze Standard-Berechtigungen
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Prüft, ob ein Benutzer eine bestimmte Berechtigung hat
   */
  static async hasPermission(permission: Permission): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    // Hole User-Daten mit Rolle und Tenant
    const { data: userData } = await supabase
      .from('users')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (!userData) return false;

    const role = userData.role as UserRole;
    const tenantId = userData.tenant_id;

    // Super Admin hat alle Rechte
    if (role === 'super_admin') return true;

    // Hole Berechtigungen für diese Rolle
    const permissions = await this.getPermissionsForRole(tenantId, role);
    
    return permissions.includes(permission);
  }

  /**
   * Prüft, ob ein Benutzer eine der angegebenen Berechtigungen hat
   */
  static async hasAnyPermission(permissions: Permission[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Prüft, ob ein Benutzer alle angegebenen Berechtigungen hat
   */
  static async hasAllPermissions(permissions: Permission[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Holt alle Berechtigungen des aktuellen Benutzers
   */
  static async getCurrentUserPermissions(): Promise<Permission[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data: userData } = await supabase
      .from('users')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (!userData) return [];

    const role = userData.role as UserRole;
    
    // Super Admin bekommt immer alle Berechtigungen
    if (role === 'super_admin') {
      return DEFAULT_ROLE_PERMISSIONS['super_admin'];
    }

    const tenantId = userData.tenant_id;

    return await this.getPermissionsForRole(tenantId, role);
  }

  /**
   * Aktualisiert die Berechtigungen für eine Rolle
   */
  static async updateRolePermissions(
    tenantId: string,
    role: UserRole,
    permissions: Permission[]
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Prüfe, ob der aktuelle Benutzer die Berechtigung hat
    const hasPermission = await this.hasPermission('permissions.edit');
    if (!hasPermission) {
      return { success: false, error: 'Keine Berechtigung' };
    }

    // Super Admin kann nicht geändert werden
    if (role === 'super_admin') {
      return { 
        success: false, 
        error: 'Super Admin-Berechtigungen können nicht geändert werden' 
      };
    }

    // Upsert (Insert oder Update)
    const { error } = await supabase
      .from('role_permissions')
      .upsert({
        tenant_id: tenantId,
        role,
        permissions,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id,role'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Holt alle Berechtigungskonfigurationen für einen Tenant
   */
  static async getAllRolePermissions(
    tenantId: string
  ): Promise<PermissionConfig[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error || !data) return [];

    return data as PermissionConfig[];
  }

  /**
   * Setzt die Berechtigungen auf Standard zurück
   */
  static async resetToDefault(
    tenantId: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const hasPermission = await this.hasPermission('permissions.edit');
    if (!hasPermission) {
      return { success: false, error: 'Keine Berechtigung' };
    }

    if (role === 'super_admin') {
      return { 
        success: false, 
        error: 'Super Admin-Berechtigungen können nicht zurückgesetzt werden' 
      };
    }

    // Lösche custom Berechtigungen (dann werden Standards verwendet)
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('role', role);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}

