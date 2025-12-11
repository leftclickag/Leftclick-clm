/**
 * Rollen im System
 */
export type UserRole = 'super_admin' | 'admin' | 'user';

/**
 * Verfügbare Berechtigungen (Permissions)
 */
export type Permission = 
  // Dashboard
  | 'dashboard.view'
  // Lead Magnets
  | 'lead_magnets.view'
  | 'lead_magnets.create'
  | 'lead_magnets.edit'
  | 'lead_magnets.delete'
  // Leads
  | 'leads.view'
  | 'leads.export'
  | 'leads.delete'
  // Analytics
  | 'analytics.view'
  | 'analytics.advanced'
  // API-Integrationen
  | 'integrations.view'
  | 'integrations.create'
  | 'integrations.edit'
  | 'integrations.delete'
  | 'integrations.test'
  // Benutzer
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  // Invite Codes
  | 'invite_codes.view'
  | 'invite_codes.create'
  | 'invite_codes.delete'
  // Einstellungen
  | 'settings.view'
  | 'settings.edit'
  | 'settings.sso'
  // Berechtigungen
  | 'permissions.view'
  | 'permissions.edit'
  // Profil
  | 'profile.view'
  | 'profile.edit';

/**
 * Seiten im Admin-Bereich
 */
export type AdminPage = {
  id: string;
  name: string;
  path: string;
  icon: string;
  requiredPermission: Permission;
  description?: string;
};

/**
 * Rollen-Berechtigungen Mapping
 */
export type RolePermissions = {
  role: UserRole;
  permissions: Permission[];
  isSystem?: boolean; // System-Rollen können nicht gelöscht werden
};

/**
 * Berechtigungs-Konfiguration
 */
export type PermissionConfig = {
  id: string;
  tenant_id: string;
  role: UserRole;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
};

/**
 * Standard-Berechtigungen für jede Rolle
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Alle Berechtigungen
    'dashboard.view',
    'lead_magnets.view',
    'lead_magnets.create',
    'lead_magnets.edit',
    'lead_magnets.delete',
    'leads.view',
    'leads.export',
    'leads.delete',
    'analytics.view',
    'analytics.advanced',
    'integrations.view',
    'integrations.create',
    'integrations.edit',
    'integrations.delete',
    'integrations.test',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage_roles',
    'invite_codes.view',
    'invite_codes.create',
    'invite_codes.delete',
    'settings.view',
    'settings.edit',
    'settings.sso',
    'permissions.view',
    'permissions.edit',
    'profile.view',
    'profile.edit',
  ],
  admin: [
    // Admin-Berechtigungen (ohne Benutzer- und Berechtigungsverwaltung)
    'dashboard.view',
    'lead_magnets.view',
    'lead_magnets.create',
    'lead_magnets.edit',
    'lead_magnets.delete',
    'leads.view',
    'leads.export',
    'analytics.view',
    'analytics.advanced',
    'integrations.view',
    'integrations.create',
    'integrations.edit',
    'integrations.delete',
    'integrations.test',
    'settings.view',
    'settings.edit',
    'profile.view',
    'profile.edit',
  ],
  user: [
    // Standard-Benutzer
    'dashboard.view',
    'lead_magnets.view',
    'leads.view',
    'analytics.view',
    'profile.view',
    'profile.edit',
  ],
};

/**
 * Seiten-Definitionen mit erforderlichen Berechtigungen
 */
export const ADMIN_PAGES: AdminPage[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/admin',
    icon: 'LayoutDashboard',
    requiredPermission: 'dashboard.view',
    description: 'Übersicht und Statistiken',
  },
  {
    id: 'lead-magnets',
    name: 'Lead-Magnete',
    path: '/admin/lead-magnets',
    icon: 'FileText',
    requiredPermission: 'lead_magnets.view',
    description: 'Lead-Magnete verwalten',
  },
  {
    id: 'leads',
    name: 'Leads',
    path: '/admin/leads',
    icon: 'Contact',
    requiredPermission: 'leads.view',
    description: 'Lead-Kontakte ansehen',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    path: '/admin/analytics',
    icon: 'BarChart3',
    requiredPermission: 'analytics.view',
    description: 'Analysen und Berichte',
  },
  {
    id: 'users',
    name: 'Benutzer',
    path: '/admin/users',
    icon: 'Users',
    requiredPermission: 'users.view',
    description: 'Benutzerverwaltung',
  },
  {
    id: 'invite-codes',
    name: 'Invite Codes',
    path: '/admin/invite-codes',
    icon: 'Ticket',
    requiredPermission: 'invite_codes.view',
    description: 'Einladungscodes verwalten',
  },
  {
    id: 'settings',
    name: 'Einstellungen',
    path: '/admin/settings',
    icon: 'Settings',
    requiredPermission: 'settings.view',
    description: 'System-Einstellungen',
  },
  {
    id: 'permissions',
    name: 'Berechtigungen',
    path: '/admin/permissions',
    icon: 'Shield',
    requiredPermission: 'permissions.view',
    description: 'Rechteverwaltung',
  },
];

