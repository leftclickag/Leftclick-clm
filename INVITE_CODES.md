# Invite Codes & Benutzerverwaltung

## Übersicht

Das System unterstützt nun Benutzerregistrierung über Invite Codes und eine vollständige Benutzerverwaltung im Admin-Bereich.

## Features

### 1. Invite Code System
- Generierung von einzigartigen Invite Codes
- Konfigurierbare Nutzungslimits (max. Verwendungen)
- Ablaufdatum für Codes
- Automatische Deaktivierung abgelaufener/verbrauchter Codes
- Tracking der Code-Verwendung

### 2. Benutzerverwaltung
- Liste aller registrierten Benutzer
- Rollenverwaltung (User, Admin, Super Admin)
- Benutzer-Statistiken
- Benutzer löschen (nur Super Admin)

### 3. Benutzer-Rollen

- **User**: Normaler Benutzer mit eingeschränkten Rechten
- **Admin**: Kann Invite Codes erstellen und verwalten
- **Super Admin**: Vollzugriff inkl. Benutzerverwaltung und Rollenzuweisung

## Erste Schritte

### 1. Migrationen ausführen

Führe die neue Migration in Supabase aus:

```sql
-- Datei: supabase/migrations/005_invite_codes.sql
```

### 2. Ersten Super Admin erstellen

Die Migration erstellt automatisch einen Super Admin für den Benutzer mit der E-Mail `admin@leftclick.de`.

**WICHTIG**: Ändere die E-Mail in der Migration auf deine eigene E-Mail, bevor du sie ausführst:

```sql
-- In 005_invite_codes.sql, letzte Zeilen ändern:
INSERT INTO user_roles (user_id, role, permissions)
SELECT id, 'super_admin', '["all"]'::jsonb
FROM auth.users
WHERE email = 'DEINE-EMAIL@example.com'  -- <-- Hier deine E-Mail eintragen
ON CONFLICT (user_id) DO NOTHING;
```

### 3. Ersten Invite Code erstellen

1. Melde dich als Super Admin im Admin-Bereich an
2. Navigiere zu "Invite Codes" in der Sidebar
3. Klicke auf "Neuer Code"
4. Konfiguriere:
   - Maximale Verwendungen (z.B. 10)
   - Gültigkeit in Tagen (z.B. 30)
5. Klicke "Erstellen"

### 4. Invite Code teilen

Nach der Erstellung kannst du:
- Den Code kopieren und direkt teilen
- Den kompletten Registrierungslink kopieren (inkl. Code als Parameter)

Beispiel-Link:
```
https://deine-domain.de/auth/register?code=INVITE-ABC123XYZ
```

## Verwendung

### Für Administratoren

#### Invite Codes verwalten
1. Gehe zu `/admin/invite-codes`
2. Sehe alle Codes mit Status und Verwendung
3. Erstelle neue Codes
4. Deaktiviere oder lösche Codes

#### Benutzer verwalten
1. Gehe zu `/admin/users`
2. Sehe alle registrierten Benutzer
3. Ändere Benutzer-Rollen
4. Lösche Benutzer (nur Super Admin)

### Für neue Benutzer

#### Registrierung
1. Erhalte einen Invite Code von einem Admin
2. Gehe zu `/auth/register` oder verwende den Link mit Code
3. Fülle das Registrierungsformular aus:
   - Invite Code (wird automatisch validiert)
   - Name
   - E-Mail
   - Passwort (min. 8 Zeichen)
4. Klicke "Registrieren"
5. Nach erfolgreicher Registrierung wirst du zum Dashboard weitergeleitet

## Sicherheit

### Row Level Security (RLS)

Alle Tabellen sind mit RLS geschützt:

- **invite_codes**: Nur Admins können Codes sehen/erstellen/verwalten
- **invite_code_usage**: Admins sehen alle Verwendungen, User können nur eigene hinzufügen
- **user_roles**: User sehen nur ihre eigene Rolle, Admins sehen alle

### Berechtigungen

- **Invite Code erstellen**: Admin, Super Admin
- **Invite Code deaktivieren/löschen**: Admin, Super Admin
- **Benutzer-Rollen ändern**: Nur Super Admin
- **Benutzer löschen**: Nur Super Admin
- **Selbständerung**: Verhindert (Admin kann sich nicht selbst degradieren/löschen)

## API / tRPC Endpoints

### Invite Codes

```typescript
// Liste alle Codes
trpc.inviteCodes.list.useQuery({ page, pageSize, activeOnly })

// Erstelle neuen Code
trpc.inviteCodes.create.useMutation({ maxUses, expiresInDays })

// Validiere Code (öffentlich)
trpc.inviteCodes.validate.useQuery({ code })

// Verwende Code (öffentlich, während Registrierung)
trpc.inviteCodes.use.useMutation({ code, userId })

// Deaktiviere Code
trpc.inviteCodes.deactivate.useMutation({ codeId })

// Lösche Code
trpc.inviteCodes.delete.useMutation({ codeId })

// Statistiken
trpc.inviteCodes.stats.useQuery()
```

### Benutzer

```typescript
// Liste alle Benutzer
trpc.users.list.useQuery({ page, pageSize, search })

// Hole einzelnen Benutzer
trpc.users.get.useQuery({ userId })

// Aktualisiere Rolle
trpc.users.updateRole.useMutation({ userId, role, permissions })

// Lösche Benutzer
trpc.users.delete.useMutation({ userId })

// Statistiken
trpc.users.stats.useQuery()
```

## Datenbank-Schema

### Tabellen

#### `invite_codes`
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) (Unique)
- `created_by`: UUID (Foreign Key -> auth.users)
- `created_at`: TIMESTAMPTZ
- `expires_at`: TIMESTAMPTZ (Optional)
- `max_uses`: INTEGER
- `current_uses`: INTEGER
- `is_active`: BOOLEAN
- `metadata`: JSONB

#### `invite_code_usage`
- `id`: UUID (Primary Key)
- `invite_code_id`: UUID (Foreign Key -> invite_codes)
- `used_by`: UUID (Foreign Key -> auth.users)
- `used_at`: TIMESTAMPTZ

#### `user_roles`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> auth.users, Unique)
- `role`: VARCHAR(50)
- `permissions`: JSONB
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## Troubleshooting

### Problem: Kann keinen Invite Code erstellen

**Lösung**: Stelle sicher, dass dein Benutzer die Rolle "admin" oder "super_admin" hat.

```sql
-- Prüfe deine Rolle
SELECT role FROM user_roles WHERE user_id = 'DEINE-USER-ID';

-- Setze Super Admin Rolle (wenn nötig)
INSERT INTO user_roles (user_id, role, permissions)
VALUES ('DEINE-USER-ID', 'super_admin', '["all"]'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

### Problem: Invite Code wird als ungültig angezeigt

**Prüfe**:
1. Code ist noch aktiv: `is_active = true`
2. Code ist nicht abgelaufen: `expires_at > NOW()`
3. Code hat noch Verwendungen übrig: `current_uses < max_uses`

```sql
SELECT * FROM invite_codes WHERE code = 'DEIN-CODE';
```

### Problem: Registrierung schlägt fehl

**Häufige Ursachen**:
1. Invite Code bereits vollständig verwendet
2. Invite Code abgelaufen
3. E-Mail bereits registriert
4. Passwort zu kurz (min. 8 Zeichen)

## Backup & Migration

### Backup der Invite Codes

```sql
-- Exportiere alle aktiven Codes
SELECT * FROM invite_codes WHERE is_active = true;
```

### Alle abgelaufenen Codes deaktivieren

```sql
-- Manuell ausführen oder läuft automatisch via Trigger
SELECT deactivate_expired_codes();
```

## Support

Bei Fragen oder Problemen:
1. Prüfe die Supabase Logs
2. Prüfe die Browser-Konsole auf Fehler
3. Prüfe die tRPC Responses im Network-Tab

