# Deployment-Anleitung für Coolify

Diese Anleitung beschreibt, wie Sie die LeftClick CLM-Plattform auf Coolify deployen.

## Voraussetzungen

- Coolify-Instanz (selbst gehostet oder Cloud)
- Supabase-Projekt erstellt
- Domain für die Anwendung (optional)

## 1. Supabase Setup

### 1.1 Projekt erstellen

1. Gehen Sie zu [supabase.com](https://supabase.com) und erstellen Sie ein neues Projekt
2. Notieren Sie sich die folgenden Werte:
   - Project URL
   - Anon/Public Key
   - Service Role Key

### 1.2 Datenbank-Migrationen ausführen

1. Öffnen Sie die SQL Editor in Supabase
2. Führen Sie die Migrationen in dieser Reihenfolge aus:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
   - `supabase/migrations/003_auto_create_user.sql`
   - `supabase/migrations/004_spicy_features.sql`
   - `supabase/migrations/005_invite_codes.sql` (NEU - für Benutzerverwaltung und Invite Codes)

### 1.3 Auth-Konfiguration

#### Microsoft 365 SSO einrichten:

1. Gehen Sie zu Authentication > Providers in Supabase
2. Aktivieren Sie Azure (Microsoft)
3. Erstellen Sie eine App-Registrierung in Azure AD:
   - Gehen Sie zu [portal.azure.com](https://portal.azure.com)
   - Azure Active Directory > App registrations > New registration
   - Redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Notieren Sie sich Client ID und Client Secret
4. Tragen Sie diese Werte in Supabase ein

#### MFA aktivieren:

1. In Supabase: Authentication > Settings
2. Aktivieren Sie "Multi-Factor Authentication"

## 2. Coolify Setup

### 2.1 Neues Projekt erstellen

1. Loggen Sie sich in Coolify ein
2. Klicken Sie auf "New Resource" > "Application"
3. Wählen Sie "Docker Compose" oder "Dockerfile"

### 2.2 Repository verbinden

1. Verbinden Sie Ihr GitHub/GitLab Repository
2. Wählen Sie den Branch (z.B. `main`)
3. Setzen Sie den Build-Pack auf "Dockerfile"

### 2.3 Umgebungsvariablen konfigurieren

Fügen Sie folgende Umgebungsvariablen in Coolify hinzu:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://your-domain.com

# SMTP (für E-Mail-Versand)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@leftclick.de

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### 2.4 Dockerfile-Konfiguration

Das Projekt enthält bereits ein `Dockerfile`. Coolify sollte dies automatisch erkennen.

Falls nicht, stellen Sie sicher, dass:
- Build Command: `npm run build`
- Start Command: `node server.js`
- Port: `3000`

### 2.5 Domain konfigurieren

1. In Coolify: Settings > Domains
2. Fügen Sie Ihre Domain hinzu
3. Coolify generiert automatisch SSL-Zertifikate

## 3. Post-Deployment

### 3.1 Cron-Jobs einrichten (für E-Mail-Queue)

In Coolify können Sie einen Cron-Job einrichten, der regelmäßig die E-Mail-Queue abarbeitet:

1. Gehen Sie zu "Cron Jobs" in Coolify
2. Erstellen Sie einen neuen Job:
   - Schedule: `*/5 * * * *` (alle 5 Minuten)
   - Command: `curl -X POST https://your-domain.com/api/email/process-queue`

### 3.2 Health-Check

Testen Sie die Anwendung:

```bash
curl https://your-domain.com/api/trpc/healthcheck
```

Erwartete Antwort:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## 4. Monitoring & Wartung

### 4.1 Logs überwachen

In Coolify können Sie die Logs der Anwendung in Echtzeit einsehen.

### 4.2 Datenbank-Backups

Konfigurieren Sie regelmäßige Backups in Supabase:
- Supabase Dashboard > Settings > Database
- Aktivieren Sie automatische Backups

### 4.3 Updates deployen

1. Pushen Sie Änderungen zu Ihrem Repository
2. Coolify erkennt automatisch neue Commits
3. Klicken Sie auf "Redeploy" in Coolify

## 5. Troubleshooting

### Problem: Anwendung startet nicht

- Überprüfen Sie die Logs in Coolify
- Stellen Sie sicher, dass alle Umgebungsvariablen gesetzt sind
- Überprüfen Sie die Supabase-Verbindung

### Problem: E-Mails werden nicht versendet

- Überprüfen Sie die SMTP-Konfiguration
- Testen Sie die SMTP-Verbindung manuell
- Überprüfen Sie die E-Mail-Queue in der Datenbank

### Problem: Widgets werden nicht angezeigt

- Überprüfen Sie die CORS-Einstellungen
- Stellen Sie sicher, dass `NEXT_PUBLIC_APP_URL` korrekt gesetzt ist
- Überprüfen Sie die Supabase RLS-Policies

## 6. Sicherheit

### 6.1 Secrets Management

- Verwenden Sie Coolify's Secret-Management für sensible Daten
- Rotieren Sie regelmäßig API-Keys und Passwörter

### 6.2 Rate Limiting

Implementieren Sie Rate Limiting für öffentliche Endpoints:
- Verwenden Sie einen Reverse Proxy (Nginx/Traefik)
- Oder implementieren Sie Rate Limiting in der Anwendung

### 6.3 Firewall

Stellen Sie sicher, dass nur notwendige Ports geöffnet sind:
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (nur intern)

## 7. Skalierung

Für höhere Lasten:

1. **Horizontal Scaling**: Erstellen Sie mehrere Instanzen in Coolify
2. **Database Connection Pooling**: Konfigurieren Sie Connection Pooling in Supabase
3. **CDN**: Verwenden Sie einen CDN für statische Assets

## Support

Bei Fragen oder Problemen:
- Überprüfen Sie die [Coolify-Dokumentation](https://coolify.io/docs)
- Überprüfen Sie die [Supabase-Dokumentation](https://supabase.com/docs)
- Erstellen Sie ein Issue im Repository

