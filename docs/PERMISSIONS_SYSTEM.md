# Berechtigungssystem / Rechteverwaltung

## Übersicht

Das Berechtigungssystem ermöglicht eine feingranulare Kontrolle darüber, welche Benutzer auf welche Bereiche der Anwendung zugreifen können.

## Rollen

Das System unterstützt drei Benutzerrollen:

1. **Super Admin** (`super_admin`)
   - Hat alle Berechtigungen
   - Kann Berechtigungen für andere Rollen verwalten
   - Kann nicht bearbeitet werden (System-Rolle)

2. **Admin** (`admin`)
   - Hat erweiterte Berechtigungen
   - Kann Lead-Magnete und Leads verwalten
   - Kann keine Benutzer oder Berechtigungen verwalten (Standard)

3. **User** (`user`)
   - Basis-Berechtigungen
   - Kann nur ansehen und eigenes Profil bearbeiten

## Berechtigungen

Berechtigungen sind nach Kategorien organisiert:

- **dashboard**: Dashboard-Zugriff
- **lead_magnets**: Lead-Magnete ansehen/erstellen/bearbeiten/löschen
- **leads**: Leads ansehen/exportieren/löschen
- **analytics**: Analytics ansehen/erweitert
- **users**: Benutzer verwalten
- **invite_codes**: Invite Codes verwalten
- **settings**: Einstellungen ansehen/bearbeiten
- **permissions**: Berechtigungen ansehen/bearbeiten
- **profile**: Profil ansehen/bearbeiten

## Rechteverwaltungs-UI

Unter `/admin/permissions` können Super Admins:

- Eine Matrix-Ansicht aller Rollen und deren Berechtigungen sehen
- Berechtigungen für Admin und User anpassen
- Berechtigungen auf Standard zurücksetzen

### Matrix-Ansicht

Die Matrix zeigt:
- Alle verfügbaren Berechtigungen gruppiert nach Kategorie
- Checkboxen zum Aktivieren/Deaktivieren einzelner Berechtigungen
- Zusammenfassung der ausgewählten Berechtigungen

## Technische Implementierung

### Datenbank

**Tabelle: `role_permissions`**
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  role TEXT CHECK (role IN ('super_admin', 'admin', 'user')),
  permissions JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(tenant_id, role)
);
```

### Service-Layer

**`lib/permissions/permissions-service.ts`**

Wichtige Methoden:
- `getCurrentUserRole()`: Holt die Rolle des aktuellen Benutzers
- `hasPermission(permission)`: Prüft eine einzelne Berechtigung
- `getCurrentUserPermissions()`: Holt alle Berechtigungen des Users
- `updateRolePermissions()`: Aktualisiert Berechtigungen für eine Rolle

### Route-Guards

**`lib/permissions/route-guards.ts`**

- `checkRoutePermission(pathname)`: Prüft Berechtigung für eine Route
- `requirePermission(permission)`: Guard für Server-Komponenten
- `ROUTE_PERMISSIONS`: Mapping von Routen zu Berechtigungen

### Sidebar-Integration

Die Sidebar (`components/admin/sidebar.tsx`) filtert automatisch Menüpunkte basierend auf Berechtigungen:

```typescript
const { data: permissionsData } = trpc.permissions.getCurrentUserPermissions.useQuery();
const userPermissions = new Set(permissionsData?.permissions || []);

const navigation = allNavigation.filter(item => 
  userPermissions.has(item.requiredPermission)
);
```

### Admin-Layout Protection

Das Admin-Layout (`app/admin/layout.tsx`) prüft automatisch Berechtigungen für alle Routen:

```typescript
const pathname = headersList.get("x-pathname") || "";

if (pathname && pathname !== "/admin") {
  const hasPermission = await checkRoutePermission(pathname);
  if (!hasPermission) {
    redirect("/admin");
  }
}
```

## TRPC Router

**`server/routers/permissions.ts`**

API-Endpunkte:
- `getCurrentUserRole`: Aktuelle Benutzerrolle
- `getCurrentUserPermissions`: Alle Berechtigungen des Users
- `getAllRolePermissions`: Alle Rollen-Berechtigungen (für Admin-UI)
- `updateRolePermissions`: Berechtigungen aktualisieren
- `resetToDefault`: Auf Standard zurücksetzen
- `getAllPermissions`: Alle verfügbaren Berechtigungen

## Standard-Berechtigungen

Standard-Berechtigungen werden in `types/permissions.ts` definiert:

```typescript
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [...alle Berechtigungen...],
  admin: [...Admin-Berechtigungen...],
  user: [...Basis-Berechtigungen...],
};
```

Diese werden verwendet, wenn keine custom Berechtigungen in der Datenbank gespeichert sind.

## Migration

Um das System zu aktivieren, führen Sie die Migration aus:

```bash
# Über Supabase Dashboard oder CLI
supabase migration up
```

Die Migration `008_permissions_system.sql`:
- Erweitert die `users` Tabelle um `super_admin` Rolle
- Erstellt die `role_permissions` Tabelle
- Richtet RLS-Policies ein
- Erstellt Hilfsfunktion `user_has_permission()`

## Verwendung in eigenen Komponenten

### Server-Komponenten

```typescript
import { requirePermission } from "@/lib/permissions/route-guards";

export default async function MyPage() {
  await requirePermission("lead_magnets.create");
  
  // Rest der Komponente
}
```

### Client-Komponenten

```typescript
import { trpc } from "@/lib/trpc/client";

export default function MyComponent() {
  const { data } = trpc.permissions.checkPermission.useQuery({
    permission: "leads.export"
  });
  
  if (!data?.hasPermission) {
    return <div>Keine Berechtigung</div>;
  }
  
  // Rest der Komponente
}
```

## Best Practices

1. **Immer auf Server-Seite prüfen**: Client-seitige Checks sind nur UI-Helper
2. **Granular bleiben**: Verwenden Sie spezifische Berechtigungen statt breite Rollen-Checks
3. **Standard-Berechtigungen**: Definieren Sie sinnvolle Defaults in `types/permissions.ts`
4. **Dokumentation**: Dokumentieren Sie neue Berechtigungen in diesem Dokument

## Nächste Schritte

- [ ] Super Admin Benutzer in der Datenbank anlegen
- [ ] Standard-Berechtigungen nach Bedarf anpassen
- [ ] Weitere Seiten mit Route-Guards schützen
- [ ] Audit-Logging für Berechtigungsänderungen implementieren

