import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { PermissionsService } from "@/lib/permissions/permissions-service";
import { 
  UserRole, 
  Permission, 
  DEFAULT_ROLE_PERMISSIONS,
  ADMIN_PAGES 
} from "@/types/permissions";
import { createClient } from "@/lib/supabase/server";

export const permissionsRouter = router({
  /**
   * Holt die aktuelle Benutzerrolle
   */
  getCurrentUserRole: publicProcedure.query(async () => {
    const role = await PermissionsService.getCurrentUserRole();
    return { role };
  }),

  /**
   * Holt alle Berechtigungen des aktuellen Benutzers
   */
  getCurrentUserPermissions: publicProcedure.query(async () => {
    const permissions = await PermissionsService.getCurrentUserPermissions();
    return { permissions };
  }),

  /**
   * Prüft eine einzelne Berechtigung
   */
  checkPermission: publicProcedure
    .input(z.object({
      permission: z.string(),
    }))
    .query(async ({ input }) => {
      const hasPermission = await PermissionsService.hasPermission(
        input.permission as Permission
      );
      return { hasPermission };
    }),

  /**
   * Holt alle Rollen-Berechtigungen für den aktuellen Tenant
   */
  getAllRolePermissions: publicProcedure.query(async () => {
    // Prüfe Berechtigung
    const canView = await PermissionsService.hasPermission('permissions.view');
    if (!canView) {
      throw new Error('Keine Berechtigung');
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Nicht angemeldet');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userData?.tenant_id) {
      throw new Error('Kein Tenant gefunden');
    }

    const configs = await PermissionsService.getAllRolePermissions(
      userData.tenant_id
    );

    // Erstelle vollständige Liste mit Defaults
    const roles: UserRole[] = ['super_admin', 'admin', 'editor', 'viewer', 'user'];
    const result = roles.map(role => {
      const config = configs.find(c => c.role === role);
      return {
        role,
        permissions: config?.permissions || DEFAULT_ROLE_PERMISSIONS[role] || [],
        isCustom: !!config,
        isSystem: role === 'super_admin',
      };
    });

    return { rolePermissions: result };
  }),

  /**
   * Aktualisiert die Berechtigungen für eine Rolle
   */
  updateRolePermissions: publicProcedure
    .input(z.object({
      role: z.enum(['super_admin', 'admin', 'editor', 'viewer', 'user']),
      permissions: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      // Prüfe Berechtigung
      const canEdit = await PermissionsService.hasPermission('permissions.edit');
      if (!canEdit) {
        throw new Error('Keine Berechtigung');
      }

      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Nicht angemeldet');
      }

      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData?.tenant_id) {
        throw new Error('Kein Tenant gefunden');
      }

      const result = await PermissionsService.updateRolePermissions(
        userData.tenant_id,
        input.role as UserRole,
        input.permissions as Permission[]
      );

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Aktualisieren');
      }

      return { success: true };
    }),

  /**
   * Setzt Berechtigungen auf Standard zurück
   */
  resetToDefault: publicProcedure
    .input(z.object({
      role: z.enum(['super_admin', 'admin', 'editor', 'viewer', 'user']),
    }))
    .mutation(async ({ input }) => {
      // Prüfe Berechtigung
      const canEdit = await PermissionsService.hasPermission('permissions.edit');
      if (!canEdit) {
        throw new Error('Keine Berechtigung');
      }

      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Nicht angemeldet');
      }

      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData?.tenant_id) {
        throw new Error('Kein Tenant gefunden');
      }

      const result = await PermissionsService.resetToDefault(
        userData.tenant_id,
        input.role as UserRole
      );

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Zurücksetzen');
      }

      return { success: true };
    }),

  /**
   * Holt alle verfügbaren Seiten mit ihren Berechtigungen
   */
  getAvailablePages: publicProcedure.query(async () => {
    return { pages: ADMIN_PAGES };
  }),

  /**
   * Holt alle verfügbaren Berechtigungen
   */
  getAllPermissions: publicProcedure.query(async () => {
    // Sammle alle eindeutigen Berechtigungen aus den Standard-Rollen
    const allPermissions = new Set<Permission>();
    
    Object.values(DEFAULT_ROLE_PERMISSIONS).forEach(permissions => {
      permissions.forEach(p => allPermissions.add(p));
    });

    // Gruppiere nach Kategorie
    const grouped: Record<string, Permission[]> = {};
    
    allPermissions.forEach(permission => {
      const [category] = permission.split('.');
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });

    return { 
      permissions: Array.from(allPermissions),
      grouped,
    };
  }),
});

