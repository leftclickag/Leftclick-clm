# API-Integrations-System

Das API-Integrations-System ermöglicht es Admins, Leads automatisch an externe Systeme zu pushen. Das System ist vollständig flexibel und erlaubt die individuelle Konfiguration des Datenformats über ein JSON-basiertes Mapping.

## Features

### 🎯 Kern-Features
- **Flexible Daten-Transformation**: JSON-basiertes Mapping mit Template-Syntax
- **Multi-System-Support**: Push an mehrere externe Systeme gleichzeitig
- **Authentifizierung**: Bearer Token, API Key, Basic Auth, Custom Headers
- **Retry-Mechanismus**: Automatische Wiederholungen bei Fehlern
- **Umfangreiches Logging**: Detaillierte Request/Response-Logs für Debugging
- **Statistiken**: Success Rate, Anzahl gesendeter Leads, Last Success/Error
- **Test-Funktion**: Teste Integrationen mit Mock-Daten
- **Selective Push**: Filter nach Lead-Magnet oder Status

### 🔧 Daten-Mapping

Das System verwendet eine Template-Syntax mit Platzhaltern:

```json
{
  "email": "{{contact_info.email}}",
  "first_name": "{{contact_info.firstName}}",
  "last_name": "{{contact_info.lastName}}",
  "phone": "{{contact_info.phone}}",
  "calculator_result": "{{data.calculatorResult}}",
  "utm_source": "{{utm_source}}",
  "utm_campaign": "{{utm_campaign}}",
  "country": "{{country}}",
  "timestamp": "{{created_at}}"
}
```

#### Verfügbare Variablen

**Lead-Informationen:**
- `{{id}}` - Submission ID
- `{{lead_magnet_id}}` - Lead-Magnet ID
- `{{status}}` - Status (completed, etc.)
- `{{created_at}}` - Erstellungsdatum
- `{{updated_at}}` - Aktualisierungsdatum

**Kontaktinformationen** (`contact_info.*`):
- `{{contact_info.email}}`
- `{{contact_info.firstName}}`
- `{{contact_info.lastName}}`
- `{{contact_info.phone}}`
- `{{contact_info.company}}`
- Alle anderen Felder im `contact_info` Objekt

**Lead-Daten** (`data.*`):
- `{{data.calculatorResult}}`
- `{{data.selectedOption}}`
- `{{data.score}}`
- Alle anderen Felder im `data` Objekt

**UTM-Tracking:**
- `{{utm_source}}`
- `{{utm_medium}}`
- `{{utm_campaign}}`
- `{{utm_term}}`
- `{{utm_content}}`
- `{{referrer}}`

**Device & Location:**
- `{{device_type}}` - desktop, mobile, tablet
- `{{browser}}` - Browser-Name
- `{{country}}` - Land (wenn verfügbar)
- `{{city}}` - Stadt (wenn verfügbar)

### 📋 Vordefinierte Templates

Das System bietet vordefinierte Templates für gängige Systeme:

1. **Standard** - Grundlegendes Mapping
2. **Salesforce** - Salesforce Lead API Format
3. **HubSpot** - HubSpot Contacts API Format
4. **ActiveCampaign** - ActiveCampaign Format
5. **Custom Webhook** - Vollständiges Mapping mit allen Feldern

## Verwendung

### Admin-Konfiguration

1. **Navigation**: Gehe zu Admin → API-Integrationen
2. **Neue Integration**: Klicke auf "Neue Integration"
3. **Basis-Konfiguration**:
   - Name der Integration
   - Beschreibung (optional)
   - Status (Aktiv/Inaktiv)

4. **API-Endpunkt**:
   - HTTP-Methode (POST, PUT, PATCH)
   - Endpoint URL

5. **Authentifizierung**:
   - Wähle Auth-Typ (None, Bearer, API Key, Basic, Custom)
   - Konfiguriere Auth-Details im JSON-Format

6. **Daten-Mapping**:
   - Wähle ein Template oder erstelle eigenes Mapping
   - Verwende Template-Syntax für dynamische Werte

7. **Erweiterte Optionen**:
   - Timeout (Sekunden)
   - Retry-Versuche
   - Retry-Verzögerung

8. **Lead-Magnet-Filter** (optional):
   - Wähle spezifische Lead-Magnets
   - Leer = gilt für alle Lead-Magnets

### Beispiel-Konfigurationen

#### Bearer Token Authentication

```json
{
  "token": "your-bearer-token-here"
}
```

#### API Key Authentication

```json
{
  "header": "X-API-Key",
  "value": "your-api-key-here"
}
```

#### Basic Authentication

```json
{
  "username": "your-username",
  "password": "your-password"
}
```

#### Custom Headers

```json
{
  "X-Custom-Header": "value",
  "X-Another-Header": "another-value"
}
```

### Beispiel: Salesforce Integration

**Endpoint**: `https://your-instance.salesforce.com/services/data/v58.0/sobjects/Lead/`

**Methode**: POST

**Auth-Typ**: Bearer

**Auth-Config**:
```json
{
  "token": "your-salesforce-oauth-token"
}
```

**Daten-Mapping**:
```json
{
  "Email": "{{contact_info.email}}",
  "FirstName": "{{contact_info.firstName}}",
  "LastName": "{{contact_info.lastName}}",
  "Phone": "{{contact_info.phone}}",
  "Company": "{{contact_info.company}}",
  "LeadSource": "{{utm_source}}",
  "Status": "New",
  "Description": "Lead from Lead Magnet"
}
```

### Beispiel: HubSpot Integration

**Endpoint**: `https://api.hubapi.com/contacts/v1/contact/`

**Methode**: POST

**Auth-Typ**: API Key

**Auth-Config**:
```json
{
  "header": "Authorization",
  "value": "Bearer your-hubspot-api-key"
}
```

**Daten-Mapping**:
```json
{
  "properties": {
    "email": "{{contact_info.email}}",
    "firstname": "{{contact_info.firstName}}",
    "lastname": "{{contact_info.lastName}}",
    "phone": "{{contact_info.phone}}",
    "hs_lead_status": "NEW",
    "lifecyclestage": "lead"
  }
}
```

### Beispiel: Custom Webhook

**Endpoint**: `https://your-domain.com/api/leads`

**Methode**: POST

**Auth-Typ**: API Key

**Auth-Config**:
```json
{
  "header": "X-API-Key",
  "value": "your-secret-key"
}
```

**Daten-Mapping**:
```json
{
  "lead": {
    "id": "{{id}}",
    "email": "{{contact_info.email}}",
    "name": "{{contact_info.firstName}} {{contact_info.lastName}}",
    "phone": "{{contact_info.phone}}"
  },
  "metadata": {
    "source": "{{utm_source}}",
    "medium": "{{utm_medium}}",
    "campaign": "{{utm_campaign}}",
    "device": "{{device_type}}",
    "browser": "{{browser}}",
    "country": "{{country}}"
  },
  "data": {
    "calculator_result": "{{data.calculatorResult}}",
    "score": "{{data.score}}"
  },
  "timestamp": "{{created_at}}"
}
```

## Monitoring & Logs

### Statistiken

Für jede Integration werden folgende Metriken getrackt:
- **Erfolgreich**: Anzahl erfolgreicher Pushes
- **Fehler**: Anzahl fehlgeschlagener Pushes
- **Erfolgsrate**: Prozentsatz erfolgreicher Pushes
- **Letzter Erfolg**: Zeitpunkt des letzten erfolgreichen Pushes
- **Letzter Fehler**: Zeitpunkt und Meldung des letzten Fehlers

### Logs

Jeder Push-Versuch wird detailliert geloggt:
- **Request**: URL, Methode, Headers, Body
- **Response**: Status, Headers, Body
- **Fehler**: Error-Message bei Fehlern
- **Performance**: Dauer des Requests
- **Retry-Info**: Versuchsnummer, geplante Wiederholungen

### Test-Funktion

Mit dem Test-Button kann eine Integration mit Mock-Daten getestet werden:

**Mock-Lead-Daten**:
```json
{
  "id": "test-{timestamp}",
  "lead_magnet_id": "test-lead-magnet",
  "status": "completed",
  "contact_info": {
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+49 123 456789"
  },
  "data": {
    "calculatorResult": 1500,
    "selectedOption": "Premium",
    "customField": "Test Value"
  },
  "utm_source": "test",
  "utm_medium": "api-test",
  "utm_campaign": "integration-test",
  "device_type": "desktop",
  "browser": "Chrome",
  "country": "DE",
  "city": "Berlin"
}
```

## Technische Details

### Architektur

```
Widget (Lead Completion)
    ↓
triggerLeadPush() [client-side]
    ↓
/api/integrations/push-lead [API Route]
    ↓
apiPushService.pushLead()
    ↓
[Parallel] → pushToIntegration() für jede aktive Integration
    ↓
External API
```

### Datenbank-Schema

#### api_integrations

Haupttabelle für Integration-Konfigurationen:
- `id`, `tenant_id`, `name`, `description`, `active`
- `endpoint_url`, `http_method`
- `auth_type`, `auth_config`
- `headers`, `data_mapping`
- `trigger_on`, `filter_conditions`, `lead_magnet_ids`
- `retry_enabled`, `retry_max_attempts`, `retry_delay_seconds`
- `timeout_seconds`
- Statistiken: `success_count`, `error_count`, `last_success_at`, `last_error_at`

#### api_integration_logs

Log-Tabelle für alle Push-Versuche:
- `id`, `integration_id`, `submission_id`
- `request_url`, `request_method`, `request_headers`, `request_body`
- `response_status`, `response_headers`, `response_body`
- `success`, `error_message`
- `attempt_number`, `retry_scheduled_for`
- `duration_ms`

### Berechtigungen

Folgende Permissions werden benötigt:
- `integrations.view` - Integrationen ansehen
- `integrations.create` - Integrationen erstellen
- `integrations.edit` - Integrationen bearbeiten
- `integrations.delete` - Integrationen löschen
- `integrations.test` - Integrationen testen

Standard-Zugriff:
- **Super-Admin**: Alle Berechtigungen
- **Admin**: Alle Berechtigungen
- **User**: Keine Berechtigungen

## Troubleshooting

### Integration zeigt Fehler

1. **Prüfe Logs**: Schaue in die detaillierten Logs der fehlgeschlagenen Requests
2. **Teste API-Endpunkt**: Verwende Tools wie Postman oder cURL zum Testen
3. **Validiere Auth**: Stelle sicher, dass Token/Credentials korrekt sind
4. **Prüfe Mapping**: Validiere das JSON-Mapping auf Syntax-Fehler
5. **Timeout erhöhen**: Bei langsamen APIs Timeout-Wert erhöhen

### Keine Pushes werden gesendet

1. **Integration aktiv?**: Stelle sicher, dass die Integration aktiviert ist
2. **Lead-Magnet-Filter?**: Prüfe ob Lead-Magnet-Filter korrekt konfiguriert ist
3. **Trigger-Event?**: Stelle sicher, dass der richtige Event (z.B. "lead.completed") konfiguriert ist
4. **Berechtigungen?**: Prüfe RLS-Policies in Supabase

### Mapping funktioniert nicht

1. **Variablen-Namen**: Stelle sicher, dass Variablen korrekt geschrieben sind (case-sensitive)
2. **Template-Syntax**: Verwende `{{variablen_name}}` ohne Leerzeichen
3. **Nested Values**: Für verschachtelte Werte verwende Punkt-Notation: `{{contact_info.email}}`
4. **Test mit Mock-Daten**: Verwende die Test-Funktion um Mapping zu validieren

## Best Practices

1. **Teste zuerst**: Verwende immer die Test-Funktion bevor du eine Integration aktivierst
2. **Monitoring**: Überprüfe regelmäßig die Statistiken und Logs
3. **Timeout anpassen**: Setze Timeout basierend auf der Performance der externen API
4. **Retry konfigurieren**: Aktiviere Retries für instabile APIs
5. **Sensitive Daten**: Speichere keine sensitiven Daten im Mapping
6. **Dokumentation**: Dokumentiere deine Mappings für das Team
7. **Lead-Magnet-Filter**: Verwende Filter um nur relevante Leads zu pushen
8. **Fehlerbehandlung**: Implementiere Fallback-Prozesse für kritische Integrationen

## Zukünftige Erweiterungen

Mögliche Erweiterungen für die Zukunft:
- [ ] Job-Queue für Retry-Mechanismus (Bull/BullMQ)
- [ ] Rate-Limiting für APIs
- [ ] Batch-Processing für mehrere Leads
- [ ] Bidirektionale Sync
- [ ] Webhook-Empfang für Updates
- [ ] Custom JavaScript für komplexe Transformationen
- [ ] Integration-Templates Marketplace
- [ ] Automatische API-Discovery

