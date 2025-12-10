# 🔥 Spicy Features - LeftClick CLM

Diese Dokumentation beschreibt alle neuen Features, die das Lead Management System auf das nächste Level bringen!

## Übersicht der neuen Features

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| A/B Testing | ✅ | Teste verschiedene Varianten deiner Lead Magnets |
| Lead Scoring | ✅ | Automatische Bewertung von Leads |
| UTM Tracking | ✅ | Vollständige Source Attribution |
| Drip Campaigns | ✅ | Automatisierte E-Mail-Sequenzen |
| Slack/Teams Notifications | ✅ | Instant-Benachrichtigungen bei neuen Leads |
| Exit Intent Popup | ✅ | Fange abbrechende Besucher auf |
| Social Proof Widget | ✅ | "X Personen haben das gemacht" |
| Gamification | ✅ | Progress Bars, Konfetti, Achievements |
| Conditional Logic Builder | ✅ | Visueller Flow-Editor |
| Embed Code Generator | ✅ | One-Click Integration |
| Real-time Analytics | ✅ | Live Dashboard mit Charts |
| Multi-Language (i18n) | ✅ | DE, EN, FR, ES, IT, NL |
| DSGVO Consent Management | ✅ | Cookie-Banner & Consent-Tracking |
| Personalisierte PDFs | ✅ | Mit QR-Code & dynamischem Content |

---

## 1. A/B Testing System

Teste verschiedene Varianten deiner Lead Magnets und finde heraus, welche besser konvertiert.

### Features:
- Traffic-Split konfigurierbar (z.B. 50/50)
- Automatische statistische Signifikanz-Berechnung
- Winner-Detection wenn Konfidenz > 95%
- Separate Tracking pro Variante

### Verwendung:

```typescript
import { abTestingService } from "@/lib/ab-testing/ab-testing-service";

// Test erstellen
await abTestingService.createTest(leadMagnetId, [
  { name: "Control", config: {...}, traffic_percentage: 50, is_control: true },
  { name: "Variant A", config: {...}, traffic_percentage: 50, is_control: false },
]);

// Variante für Besucher auswählen
const variant = await abTestingService.getOrAssignVariant(leadMagnetId);

// Stats abrufen
const stats = await abTestingService.getTestStats(leadMagnetId);
```

---

## 2. Lead Scoring System

Automatische Bewertung von Leads basierend auf konfigurierbaren Regeln.

### Bewertungskriterien:
- Antworten auf Fragen (z.B. Budget > 10k → +25 Punkte)
- Vollständigkeit der Daten
- Verhaltens-Signale

### Lead-Grade:
- 🔥 **Hot** (80+ Punkte) - Sofort kontaktieren!
- ☀️ **Warm** (40-79 Punkte) - Follow-up planen
- ❄️ **Cold** (<40 Punkte) - In Nurturing-Sequenz

```typescript
import { leadScoringService } from "@/lib/scoring/lead-scoring";

const { totalScore, grade, breakdown } = await leadScoringService.calculateScore(
  submissionId,
  tenantId
);
```

---

## 3. UTM Tracking & Source Attribution

Vollständiges Tracking woher deine Leads kommen.

### Erfasste Daten:
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- Referrer URL
- Landing Page
- Device Type (Desktop/Mobile/Tablet)
- Browser

### Verwendung im Widget:
```typescript
import { tracker } from "@/lib/tracking/tracker";

// UTM wird automatisch erfasst!
await tracker.trackEvent("start", leadMagnetId);

// Attribution-Daten abrufen
const attribution = tracker.getAttributionData();
```

---

## 4. Drip Email Campaigns

Automatisierte E-Mail-Sequenzen basierend auf Trigger-Events.

### Trigger-Events:
- `completed` - Lead Magnet abgeschlossen
- `abandoned` - Lead Magnet abgebrochen
- `started` - Lead Magnet gestartet
- `step_complete` - Bestimmter Schritt abgeschlossen

### Actions:
- E-Mail senden
- Webhook auslösen
- Slack-Nachricht senden
- Score anpassen
- Tag hinzufügen

### Cron Job Setup:
```bash
# Vercel cron.json
{
  "crons": [
    {
      "path": "/api/automation/process",
      "schedule": "* * * * *"
    }
  ]
}
```

---

## 5. Notification Channels

Sofortige Benachrichtigungen bei wichtigen Events.

### Unterstützte Channels:
- 💬 Slack
- 🔷 Microsoft Teams
- 📱 Telegram
- 🎮 Discord

### Setup:

```typescript
import { notificationService } from "@/lib/notifications/notification-service";

await notificationService.sendNotification(tenantId, {
  event_type: "hot_lead",
  submission_id: "...",
  email: "lead@example.com",
  lead_magnet_title: "IT-Kosten Rechner",
  score: 95,
  grade: "hot",
});
```

---

## 6. Exit Intent Popup

Fange Besucher auf, bevor sie die Seite verlassen.

### Komponente:

```tsx
import { ExitIntentPopup } from "@/components/public/exit-intent-popup";

<ExitIntentPopup
  config={{
    enabled: true,
    headline: "Warte! Bevor du gehst...",
    subheadline: "Sichere dir noch schnell...",
    cta_text: "Ja, ich will das!",
    dismiss_text: "Nein, danke",
    incentive_type: "bonus",
    incentive_value: "Kostenloses E-Book",
    delay_seconds: 5,
    show_only_once: true,
  }}
  leadMagnetId={leadMagnetId}
  onAccept={() => {/* ... */}}
  onDismiss={() => {/* ... */}}
/>
```

---

## 7. Social Proof Widget

Zeige Besuchern, dass andere auch mitmachen.

### Varianten:
- `floating` - Schwebendes Widget in der Ecke
- `banner` - Volle Breite oben/unten
- `inline` - Im Content eingebettet
- `minimal` - Nur Text

```tsx
import { SocialProofWidget } from "@/components/public/social-proof-widget";

<SocialProofWidget
  leadMagnetId={leadMagnetId}
  variant="floating"
  position="bottom-left"
  showRealtime={true}
/>
```

---

## 8. Gamification

Mache Lead Magnets interaktiver und spaßiger!

### Komponenten:

```tsx
import {
  AnimatedProgressBar,
  ConfettiCelebration,
  AchievementBadge,
  CompletionScreen,
  ScoreDisplay,
} from "@/components/public/gamification";

// Progress Bar
<AnimatedProgressBar
  currentStep={3}
  totalSteps={5}
  variant="gradient" // "default" | "gradient" | "segments" | "dots"
/>

// Konfetti bei Abschluss
<ConfettiCelebration
  trigger={isCompleted}
  variant="fireworks" // "default" | "fireworks" | "stars" | "emoji"
/>

// Completion Screen
<CompletionScreen
  headline="🎉 Gratulation!"
  achievements={[
    { name: "Speed Runner", icon: "⚡", color: "#FFD700" },
  ]}
  stats={{
    timeSpent: 120,
    score: 85,
    percentile: 15,
  }}
/>
```

---

## 9. Conditional Logic Builder

Visueller Editor für Flow-Bedingungen.

```tsx
import { ConditionalLogicBuilder } from "@/components/admin/conditional-logic-builder";

<ConditionalLogicBuilder
  steps={flowSteps}
  conditions={conditions}
  availableFields={[
    { id: "budget", label: "Budget", type: "number" },
    { id: "company_size", label: "Unternehmensgröße", type: "select" },
  ]}
  onConditionsChange={setConditions}
/>
```

### Condition Types:
- **show_if** - Schritt nur anzeigen wenn...
- **skip_if** - Schritt überspringen wenn...
- **branch_to** - Zu anderem Schritt springen wenn...

---

## 10. Embed Code Generator

One-Click Integration für externe Websites.

```tsx
import { EmbedCodeGenerator } from "@/components/admin/embed-code-generator";

<EmbedCodeGenerator
  leadMagnetId={leadMagnetId}
  leadMagnetSlug="it-kosten-rechner"
  tenantSlug="meine-firma"
/>
```

### Embed Types:
- **iFrame** - Einfache Integration
- **Popup** - Als Modal über der Seite
- **Slide-In** - Gleitet von der Seite rein
- **Inline** - Direkt im Content

---

## 11. Real-time Analytics Dashboard

Live-Dashboard mit allen wichtigen Metriken.

```tsx
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

<AnalyticsDashboard
  tenantId={tenantId}
  leadMagnetId={leadMagnetId} // Optional für spezifische Ansicht
/>
```

### Features:
- Live-Updates via Polling (optional Supabase Realtime)
- Conversion Funnel Visualisierung
- Traffic-Quellen Analyse
- Device-Verteilung
- Lead-Qualität nach Score

---

## 12. Multi-Language Support (i18n)

Widgets in 6 Sprachen verfügbar.

### Setup:

```tsx
// In app/layout.tsx oder providers
import { I18nProvider } from "@/lib/i18n/context";

<I18nProvider
  defaultLocale="de"
  availableLocales={["de", "en", "fr", "es", "it", "nl"]}
>
  {children}
</I18nProvider>

// In Komponenten
import { useTranslation } from "@/lib/i18n/context";

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <button>{t("common.next")}</button>
  );
}
```

### Language Selector:

```tsx
import { LanguageSelector } from "@/components/ui/language-selector";

<LanguageSelector
  variant="dropdown" // "dropdown" | "buttons" | "minimal"
  showFlag={true}
  showLabel={true}
/>
```

---

## 13. DSGVO Consent Management

Vollständiges Cookie-Consent-Management.

```tsx
import { ConsentManager, useConsent } from "@/components/public/consent-manager";

// Banner/Modal anzeigen
<ConsentManager
  categories={[
    {
      id: "analytics",
      type: "analytics",
      title: "Analyse-Cookies",
      description: "Helfen uns die Website zu verbessern",
      required: false,
      defaultEnabled: false,
    },
  ]}
  privacyPolicyUrl="/datenschutz"
  onConsent={(records) => {
    // Consent-Records speichern
  }}
  variant="banner" // "banner" | "modal" | "inline"
  companyName="Meine Firma"
/>

// Consent prüfen
const { hasConsent } = useConsent();
if (hasConsent("analytics")) {
  // Analytics laden
}
```

---

## 14. Personalisierte PDFs

PDFs mit Namen, Logo und dynamischem Content.

```tsx
import { generatePersonalizedPDF } from "@/lib/pdf/pdf-generator";

const pdf = await generatePersonalizedPDF({
  leadMagnet,
  submissionData,
  personalization: {
    firstName: "Max",
    lastName: "Mustermann",
    company: "Tech GmbH",
  },
  branding: {
    primaryColor: "#6366F1",
    secondaryColor: "#8B5CF6",
    logoUrl: "/logo.png",
    companyName: "LeftClick",
    website: "https://leftclick.de",
  },
  qrCodeUrl: "https://leftclick.de/callback?id=123",
  includeChapters: ["chapter1", "chapter3"], // Conditional content
});
```

---

## Installation neuer Dependencies

```bash
npm install canvas-confetti qrcode
npm install -D @types/canvas-confetti @types/qrcode
```

---

## Datenbank-Migrationen

Die neuen Features benötigen zusätzliche Tabellen. Führe die Migrationen aus:

```bash
# Via Supabase CLI
supabase db push

# Oder manuell die Dateien ausführen:
# - supabase/migrations/004_spicy_features.sql
# - supabase/migrations/005_spicy_functions.sql
```

---

## Umgebungsvariablen

Neue ENV-Variablen für die Features:

```env
# Für Cron Jobs (Automations)
CRON_SECRET=dein-geheimer-cron-key

# Für die App-URL (Embeds, QR-Codes)
NEXT_PUBLIC_APP_URL=https://deine-app.de
```

---

## 🚀 Los geht's!

Mit all diesen Features hast du jetzt eine Enterprise-ready Lead Management Platform! Wenn du Fragen hast oder Hilfe bei der Implementation brauchst, schau in die einzelnen Komponenten-Dateien - dort findest du ausführliche Kommentare und Beispiele.

**Happy Lead Generating! 🎯**

