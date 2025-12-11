"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  RotateCcw, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { UserRole, Permission } from "@/types/permissions";

export default function PermissionsPage() {
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Lade Daten
  const { data: rolePermissionsData, refetch } = trpc.permissions.getAllRolePermissions.useQuery();
  const { data: allPermissionsData } = trpc.permissions.getAllPermissions.useQuery();

  // Mutations
  const updatePermissions = trpc.permissions.updateRolePermissions.useMutation({
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError(null);
      setEditingRole(null);
      refetch();
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error) => {
      setSaveError(error.message);
      setTimeout(() => setSaveError(null), 5000);
    },
  });

  const resetToDefault = trpc.permissions.resetToDefault.useMutation({
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError(null);
      setEditingRole(null);
      refetch();
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error) => {
      setSaveError(error.message);
      setTimeout(() => setSaveError(null), 5000);
    },
  });

  const rolePermissions = rolePermissionsData?.rolePermissions || [];
  const permissionsGrouped = allPermissionsData?.grouped || {};

  const handleEditRole = (role: UserRole) => {
    const roleData = rolePermissions.find(rp => rp.role === role);
    if (roleData) {
      setEditingRole(role);
      setSelectedPermissions(new Set(roleData.permissions as Permission[]));
    }
  };

  const handleTogglePermission = (permission: Permission) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permission)) {
      newSet.delete(permission);
    } else {
      newSet.add(permission);
    }
    setSelectedPermissions(newSet);
  };

  const handleSave = () => {
    if (!editingRole) return;
    updatePermissions.mutate({
      role: editingRole,
      permissions: Array.from(selectedPermissions),
    });
  };

  const handleReset = (role: UserRole) => {
    if (confirm(`Möchten Sie die Berechtigungen für ${getRoleName(role)} wirklich auf Standard zurücksetzen?`)) {
      resetToDefault.mutate({ role });
    }
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setSelectedPermissions(new Set());
  };

  const getRoleName = (role: UserRole): string => {
    const names: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      user: 'Benutzer',
    };
    return names[role];
  };

  const getRoleColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      super_admin: 'from-purple-600 to-pink-600',
      admin: 'from-blue-600 to-cyan-600',
      user: 'from-green-600 to-emerald-600',
    };
    return colors[role];
  };

  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      dashboard: 'Dashboard',
      lead_magnets: 'Lead-Magnete',
      leads: 'Leads',
      analytics: 'Analytics',
      users: 'Benutzer',
      invite_codes: 'Invite Codes',
      settings: 'Einstellungen',
      permissions: 'Berechtigungen',
      profile: 'Profil',
    };
    return names[category] || category;
  };

  const getPermissionName = (permission: Permission): string => {
    const [category, action] = permission.split('.');
    const actions: Record<string, string> = {
      view: 'Ansehen',
      create: 'Erstellen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      export: 'Exportieren',
      advanced: 'Erweitert',
      manage_roles: 'Rollen verwalten',
      sso: 'SSO verwalten',
    };
    return actions[action] || action;
  };

  if (!rolePermissionsData || !allPermissionsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Rechteverwaltung
          </h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Berechtigungen für verschiedene Benutzerrollen
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Card className="p-4 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span>Berechtigungen erfolgreich gespeichert!</span>
          </div>
        </Card>
      )}

      {saveError && (
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{saveError}</span>
          </div>
        </Card>
      )}

      {/* Rollen-Übersicht */}
      {!editingRole && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rolePermissions.map((roleData) => (
            <Card key={roleData.role} className="relative overflow-hidden hover-lift">
              {/* Gradient Background */}
              <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-r ${getRoleColor(roleData.role)} opacity-10`} />
              
              <div className="relative p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{getRoleName(roleData.role)}</h3>
                  {roleData.isSystem && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      System
                    </span>
                  )}
                  {roleData.isCustom && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      Angepasst
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Berechtigungen
                  </div>
                  <div className="text-3xl font-bold">
                    {roleData.permissions.length}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleEditRole(roleData.role)}
                    disabled={roleData.isSystem}
                    className="flex-1"
                    variant="default"
                  >
                    Bearbeiten
                  </Button>
                  {roleData.isCustom && !roleData.isSystem && (
                    <Button
                      onClick={() => handleReset(roleData.role)}
                      variant="outline"
                      size="icon"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bearbeitungsansicht */}
      {editingRole && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">
                  Berechtigungen für {getRoleName(editingRole)}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Wählen Sie die Berechtigungen aus, die diese Rolle haben soll
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  disabled={updatePermissions.isPending}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updatePermissions.isPending}
                  className="gap-2"
                >
                  {updatePermissions.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Speichern
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Berechtigungs-Matrix */}
            <div className="space-y-6">
              {Object.entries(permissionsGrouped).map(([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {getCategoryName(category)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <Checkbox
                          id={permission}
                          checked={selectedPermissions.has(permission as Permission)}
                          onCheckedChange={() => handleTogglePermission(permission as Permission)}
                        />
                        <label
                          htmlFor={permission}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {getPermissionName(permission as Permission)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Zusammenfassung */}
            <div className="pt-6 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Ausgewählte Berechtigungen
                </span>
                <span className="font-bold text-lg">
                  {selectedPermissions.size}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

