# Schnelle Admin-Einrichtung

## Problem
Du bekommst den Fehler "Keine Berechtigung für diese Aktion" beim Erstellen von Invite Codes, weil dein Benutzer noch keine Admin-Rolle hat.

## Lösung - 3 Schritte

### Schritt 1: Migrationen ausführen

Gehe zu Supabase SQL Editor und führe die Migrationen aus:

1. **005_invite_codes.sql** - Erstellt Invite Code Tabellen und user_roles
2. **006_fix_user_roles_setup.sql** - Setzt dich automatisch als Super Admin

### Schritt 2: Verifiziere die Einrichtung

Führe diese Abfrage in Supabase aus, um zu prüfen ob alles funktioniert:

```sql
-- Prüfe deine Rolle
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.permissions
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'DEINE-EMAIL@example.com';
```

Du solltest `role: super_admin` sehen.

### Schritt 3: Manuell Super Admin setzen (falls Schritt 2 nichts zeigt)

Falls die automatische Einrichtung nicht funktioniert hat:

```sql
-- 1. Finde deine User ID
SELECT id, email FROM auth.users WHERE email = 'DEINE-EMAIL@example.com';

-- 2. Setze dich als Super Admin (ersetze die USER_ID)
INSERT INTO user_roles (user_id, role, permissions)
VALUES ('DEINE-USER-ID-HIER', 'super_admin', '["all"]'::jsonb)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin', permissions = '["all"]'::jsonb;
```

### Alternative: Service Role Key verwenden

Falls Supabase Admin API nicht funktioniert, kannst du temporär den Service Role Key verwenden:

1. Gehe zu Supabase Project Settings > API
2. Kopiere den "service_role" Key (nicht den anon key!)
3. Füge ihn in deine `.env.local` hinzu:
   ```
   SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
   ```

## Nach der Einrichtung

1. Starte den Dev-Server neu: `npm run dev`
2. Melde dich erneut an
3. Gehe zu "Invite Codes" im Admin-Bereich
4. Jetzt solltest du Codes erstellen können! 🎉

## Überprüfung

Öffne die Browser-Konsole und prüfe, ob die tRPC-Anfrage jetzt funktioniert:
- Keine "FORBIDDEN" Fehler mehr
- Invite Codes werden angezeigt
- "Neuer Code" Button funktioniert

## Troubleshooting

### Fehler: "Cannot read property 'role' of null"

**Lösung**: Die user_roles Tabelle ist leer. Führe Schritt 3 (Manuell Super Admin setzen) aus.

### Fehler: "auth.admin.getUserById is not a function"

**Lösung**: Der Supabase Client hat keinen Admin-Zugriff. 
- Stelle sicher, dass du den Service Role Key verwendest
- Oder erstelle einen Admin-Context mit Service Role

### Migration schlägt fehl

**Lösung**: Führe die Migrationen einzeln aus und prüfe die Fehler:

```sql
-- Test 1: Prüfe ob user_roles Tabelle existiert
SELECT * FROM user_roles LIMIT 1;

-- Test 2: Prüfe ob invite_codes Tabelle existiert
SELECT * FROM invite_codes LIMIT 1;

-- Test 3: Prüfe RLS Policies
SELECT * FROM pg_policies WHERE tablename IN ('user_roles', 'invite_codes');
```

## Support-Query für Debug

Wenn nichts funktioniert, führe diese Query aus und teile das Ergebnis:

```sql
SELECT 
  'Auth Users' as type,
  id,
  email,
  created_at
FROM auth.users
UNION ALL
SELECT 
  'User Roles' as type,
  user_id as id,
  role as email,
  created_at
FROM user_roles;
```

