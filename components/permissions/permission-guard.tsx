"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Permission, UserRole } from "@/types/permissions";

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Client-Komponente zum Prüfen von Berechtigungen
 * Blendet Kinder-Elemente aus, wenn keine Berechtigung vorliegt
 */
export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [permission, permissions]);

  async function checkPermissions() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      // Hole User-Rolle
      const { data: userData } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      const userRole = userData.role as UserRole;

      // Super Admin hat immer Zugriff
      if (userRole === 'super_admin') {
        setHasPermission(true);
        setLoading(false);
        return;
      }

      // Hole Berechtigungen für diese Rolle
      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permissions')
        .eq('tenant_id', userData.tenant_id)
        .eq('role', userRole)
        .single();

      const userPermissions = rolePermissions?.permissions || getDefaultPermissions(userRole);

      // Prüfe Berechtigungen
      if (permission) {
        setHasPermission(userPermissions.includes(permission));
      } else if (permissions) {
        if (requireAll) {
          setHasPermission(permissions.every(p => userPermissions.includes(p)));
        } else {
          setHasPermission(permissions.some(p => userPermissions.includes(p)));
        }
      } else {
        setHasPermission(true);
      }

      setLoading(false);
    } catch (error) {
      console.error('Permission check error:', error);
      setHasPermission(false);
      setLoading(false);
    }
  }

  if (loading) {
    return null; // Oder einen Loader
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook zum Prüfen von Berechtigungen
 */
export function usePermission(permission: Permission): boolean {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, [permission]);

  async function checkPermission() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setHasPermission(false);
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData) {
        setHasPermission(false);
        return;
      }

      const userRole = userData.role as UserRole;

      if (userRole === 'super_admin') {
        setHasPermission(true);
        return;
      }

      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permissions')
        .eq('tenant_id', userData.tenant_id)
        .eq('role', userRole)
        .single();

      const userPermissions = rolePermissions?.permissions || getDefaultPermissions(userRole);
      setHasPermission(userPermissions.includes(permission));
    } catch (error) {
      console.error('Permission check error:', error);
      setHasPermission(false);
    }
  }

  return hasPermission;
}

/**
 * Hook zum Abrufen aller Berechtigungen des Benutzers
 */
export function useUserPermissions(): Permission[] {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setPermissions([]);
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData) {
        setPermissions([]);
        return;
      }

      const userRole = userData.role as UserRole;

      if (userRole === 'super_admin') {
        setPermissions(getDefaultPermissions('super_admin'));
        return;
      }

      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permissions')
        .eq('tenant_id', userData.tenant_id)
        .eq('role', userRole)
        .single();

      setPermissions(rolePermissions?.permissions || getDefaultPermissions(userRole));
    } catch (error) {
      console.error('Load permissions error:', error);
      setPermissions([]);
    }
  }

  return permissions;
}

// Hilfsfunktion für Standard-Berechtigungen
function getDefaultPermissions(role: UserRole): Permission[] {
  const defaults: Record<UserRole, Permission[]> = {
    super_admin: [
      'dashboard.view',
      'lead_magnets.view', 'lead_magnets.create', 'lead_magnets.edit', 'lead_magnets.delete',
      'leads.view', 'leads.export', 'leads.delete',
      'analytics.view', 'analytics.extended',
      'integrations.view', 'integrations.create', 'integrations.edit', 'integrations.delete',
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'permissions.view', 'permissions.edit',
    ],
    admin: [
      'dashboard.view',
      'lead_magnets.view', 'lead_magnets.create', 'lead_magnets.edit', 'lead_magnets.delete',
      'leads.view', 'leads.export',
      'analytics.view',
      'integrations.view', 'integrations.create', 'integrations.edit',
      'users.view',
    ],
    editor: [
      'dashboard.view',
      'lead_magnets.view', 'lead_magnets.edit',
      'leads.view',
      'analytics.view',
    ],
    viewer: [
      'dashboard.view',
      'lead_magnets.view',
      'leads.view',
      'analytics.view',
    ],
  };

  return defaults[role] || [];
}

