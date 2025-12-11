-- ============================================================================
-- VOLLSTÄNDIGE KALKULATOR-KONFIGURATIONEN
-- Alle Kalkulatoren mit kompletten Preisvariablen, Berechnungen und Feldern
-- ============================================================================

-- ============================================================================
-- 1. MICROSOFT TEAMS TELEPHONY KOSTENRECHNER - VOLLSTÄNDIG
-- ============================================================================
UPDATE lead_magnets 
SET config = '{
  "wizardMode": true,
  "showProgress": true,
  "expertModeEnabled": true,
  "priceVariables": [
    {
      "id": "pv_phone_system",
      "name": "Phone System Lizenz",
      "variableName": "phoneSystemPrice",
      "value": 8.00,
      "unit": "CHF/User/Monat",
      "category": "Lizenzen",
      "description": "Microsoft Phone System Basislizenz"
    },
    {
      "id": "pv_calling_domestic",
      "name": "Calling Plan National",
      "variableName": "callingPlanDomestic",
      "value": 12.00,
      "unit": "CHF/User/Monat",
      "category": "Lizenzen",
      "description": "Nationale Anrufe unbegrenzt"
    },
    {
      "id": "pv_calling_international",
      "name": "Calling Plan International",
      "variableName": "callingPlanInternational",
      "value": 24.00,
      "unit": "CHF/User/Monat",
      "category": "Lizenzen",
      "description": "Internationale Anrufe 600 Min/Monat"
    },
    {
      "id": "pv_operator_connect",
      "name": "Operator Connect",
      "variableName": "operatorConnectPrice",
      "value": 15.00,
      "unit": "CHF/User/Monat",
      "category": "Lizenzen",
      "description": "Telefonie über zertifizierten Anbieter"
    },
    {
      "id": "pv_direct_routing_small",
      "name": "Direct Routing SBC (klein)",
      "variableName": "sbcSmall",
      "value": 500,
      "unit": "CHF/Monat",
      "category": "Infrastruktur",
      "description": "SBC für 1-10 Benutzer"
    },
    {
      "id": "pv_direct_routing_medium",
      "name": "Direct Routing SBC (mittel)",
      "variableName": "sbcMedium",
      "value": 2000,
      "unit": "CHF/Monat",
      "category": "Infrastruktur",
      "description": "SBC für 11-50 Benutzer"
    },
    {
      "id": "pv_direct_routing_large",
      "name": "Direct Routing SBC (gross)",
      "variableName": "sbcLarge",
      "value": 5000,
      "unit": "CHF/Monat",
      "category": "Infrastruktur",
      "description": "SBC für 51-100 Benutzer"
    },
    {
      "id": "pv_traditional_phone",
      "name": "Traditionelle Telefonie",
      "variableName": "traditionalCost",
      "value": 50,
      "unit": "CHF/User/Monat",
      "category": "Vergleich",
      "description": "Durchschnittliche Kosten herkömmlicher Telefonanlage"
    },
    {
      "id": "pv_audio_conferencing",
      "name": "Audio Conferencing",
      "variableName": "audioConferencing",
      "value": 4.00,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "Einwahl per Telefon in Meetings"
    },
    {
      "id": "pv_call_queues",
      "name": "Call Queues & Auto Attendant",
      "variableName": "callQueues",
      "value": 0,
      "unit": "CHF/Monat",
      "category": "Features",
      "description": "In Phone System enthalten"
    }
  ],
  "calculations": [
    {
      "id": "phone_system_cost",
      "formula": "users * phoneSystemPrice",
      "label": "Phone System Kosten",
      "dependsOn": ["users", "phoneSystemPrice"]
    },
    {
      "id": "calling_plan_cost",
      "formula": "CASE(callingType, domestic, users * callingPlanDomestic, international, users * callingPlanInternational, operator, users * operatorConnectPrice, 0)",
      "label": "Calling Plan Kosten",
      "dependsOn": ["users", "callingType", "callingPlanDomestic", "callingPlanInternational", "operatorConnectPrice"]
    },
    {
      "id": "sbc_cost",
      "formula": "CASE(callingType, direct_routing, IF(users <= 10, sbcSmall, IF(users <= 50, sbcMedium, sbcLarge)), 0)",
      "label": "SBC Kosten",
      "dependsOn": ["callingType", "users", "sbcSmall", "sbcMedium", "sbcLarge"]
    },
    {
      "id": "addon_cost",
      "formula": "(needsAudioConf * audioConferencing * users)",
      "label": "Add-On Kosten",
      "dependsOn": ["needsAudioConf", "audioConferencing", "users"]
    },
    {
      "id": "total_monthly",
      "formula": "phone_system_cost + calling_plan_cost + sbc_cost + addon_cost",
      "label": "Monatliche Gesamtkosten",
      "dependsOn": ["phone_system_cost", "calling_plan_cost", "sbc_cost", "addon_cost"]
    },
    {
      "id": "total_annual",
      "formula": "total_monthly * 12",
      "label": "Jährliche Gesamtkosten",
      "dependsOn": ["total_monthly"]
    },
    {
      "id": "current_cost_annual",
      "formula": "currentMonthlyCost * 12",
      "label": "Aktuelle Jahreskosten",
      "dependsOn": ["currentMonthlyCost"]
    },
    {
      "id": "savings_monthly",
      "formula": "currentMonthlyCost - total_monthly",
      "label": "Monatliche Ersparnis",
      "dependsOn": ["currentMonthlyCost", "total_monthly"]
    },
    {
      "id": "savings_annual",
      "formula": "savings_monthly * 12",
      "label": "Jährliche Ersparnis",
      "dependsOn": ["savings_monthly"]
    },
    {
      "id": "savings_5years",
      "formula": "savings_annual * 5",
      "label": "Ersparnis über 5 Jahre",
      "dependsOn": ["savings_annual"]
    },
    {
      "id": "roi_percentage",
      "formula": "(savings_annual / current_cost_annual) * 100",
      "label": "ROI Prozent",
      "dependsOn": ["savings_annual", "current_cost_annual"]
    },
    {
      "id": "cost_per_user",
      "formula": "total_monthly / users",
      "label": "Kosten pro Benutzer",
      "dependsOn": ["total_monthly", "users"]
    }
  ],
  "outputs": [
    {
      "id": "out_monthly",
      "label": "Monatliche Kosten (Teams)",
      "formula": "total_monthly",
      "format": "currency",
      "highlight": true
    },
    {
      "id": "out_annual",
      "label": "Jährliche Kosten (Teams)",
      "formula": "total_annual",
      "format": "currency"
    },
    {
      "id": "out_per_user",
      "label": "Kosten pro Benutzer/Monat",
      "formula": "cost_per_user",
      "format": "currency"
    },
    {
      "id": "out_savings",
      "label": "Jährliche Ersparnis",
      "formula": "savings_annual",
      "format": "currency",
      "highlight": true,
      "color": "green"
    },
    {
      "id": "out_savings_5y",
      "label": "Ersparnis über 5 Jahre",
      "formula": "savings_5years",
      "format": "currency"
    },
    {
      "id": "out_roi",
      "label": "ROI",
      "formula": "roi_percentage",
      "format": "percentage"
    }
  ],
  "charts": [
    {
      "id": "chart_cost_comparison",
      "type": "bar",
      "title": "Kostenvergleich",
      "dataSource": ["current_cost_annual", "total_annual"],
      "labels": ["Aktuelle Telefonie", "Teams Telefonie"],
      "colors": ["#ef4444", "#22c55e"]
    },
    {
      "id": "chart_breakdown",
      "type": "pie",
      "title": "Kostenaufteilung Teams",
      "dataSource": ["phone_system_cost", "calling_plan_cost", "sbc_cost", "addon_cost"],
      "labels": ["Phone System", "Calling Plan", "SBC", "Add-Ons"],
      "colors": ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"]
    }
  ]
}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000001';

-- Teams Telephony Flow Steps - VOLLSTÄNDIG
DELETE FROM flow_steps WHERE lead_magnet_id = '10000000-0000-0000-0000-000000000001';

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
-- Schritt 1: Unternehmensdaten
(
  '10000000-0000-0000-0000-000000000001',
  1,
  'Unternehmensprofil',
  'Grundlegende Informationen zu Ihrem Unternehmen',
  'form',
  '{
    "fields": [
      {
        "id": "users",
        "label": "Anzahl der Telefonbenutzer",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 50",
        "min": 1,
        "max": 10000,
        "variableName": "users",
        "helpText": "Mitarbeiter, die einen Telefonanschluss benötigen"
      },
      {
        "id": "locations",
        "label": "Anzahl Standorte",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 3",
        "min": 1,
        "max": 100,
        "variableName": "locations",
        "helpText": "Bürostandorte mit Telefonbedarf"
      },
      {
        "id": "currentMonthlyCost",
        "label": "Aktuelle monatliche Telefonkosten (CHF)",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 2500",
        "min": 0,
        "variableName": "currentMonthlyCost",
        "helpText": "Was zahlen Sie aktuell für Telefonie inkl. Anschlüsse und Gespräche?"
      }
    ]
  }'::jsonb
),
-- Schritt 2: Bestehende Lizenzen
(
  '10000000-0000-0000-0000-000000000001',
  2,
  'Microsoft 365 Lizenzen',
  'Welche Microsoft Lizenzen haben Sie bereits?',
  'radio_group',
  '{
    "id": "existingLicense",
    "variableName": "existingLicense",
    "options": [
      {
        "id": "none",
        "label": "Keine Microsoft 365 Lizenzen",
        "description": "Sie benötigen zusätzlich M365 Lizenzen",
        "value": "none"
      },
      {
        "id": "basic",
        "label": "Microsoft 365 Business Basic",
        "description": "5,60 CHF/User/Monat - Teams bereits enthalten",
        "value": "basic"
      },
      {
        "id": "standard",
        "label": "Microsoft 365 Business Standard",
        "description": "11,70 CHF/User/Monat - Teams + Office Apps",
        "value": "standard"
      },
      {
        "id": "premium",
        "label": "Microsoft 365 Business Premium",
        "description": "20,60 CHF/User/Monat - Teams + Office + Security",
        "value": "premium"
      },
      {
        "id": "e3",
        "label": "Microsoft 365 E3",
        "description": "35,70 CHF/User/Monat - Enterprise Features",
        "value": "e3"
      },
      {
        "id": "e5",
        "label": "Microsoft 365 E5",
        "description": "54,20 CHF/User/Monat - Phone System ENTHALTEN!",
        "value": "e5",
        "highlight": true
      }
    ]
  }'::jsonb
),
-- Schritt 3: Telefonie-Lösung
(
  '10000000-0000-0000-0000-000000000001',
  3,
  'Telefonie-Lösung wählen',
  'Wie möchten Sie telefonieren?',
  'radio_group',
  '{
    "id": "callingType",
    "variableName": "callingType",
    "options": [
      {
        "id": "domestic",
        "label": "Microsoft Calling Plan (National)",
        "description": "12,00 CHF/User/Monat - Unbegrenzte nationale Anrufe. Microsoft verwaltet alles.",
        "value": "domestic",
        "recommended": true
      },
      {
        "id": "international",
        "label": "Microsoft Calling Plan (International)",
        "description": "24,00 CHF/User/Monat - 600 Min internationale Anrufe + unbegrenzt national",
        "value": "international"
      },
      {
        "id": "operator",
        "label": "Operator Connect",
        "description": "~15,00 CHF/User/Monat - Ihr Telekom-Anbieter über Teams. Einfach & flexibel.",
        "value": "operator"
      },
      {
        "id": "direct_routing",
        "label": "Direct Routing",
        "description": "Variable Kosten - Eigener SIP-Trunk. Maximale Kontrolle, technisch komplex.",
        "value": "direct_routing"
      }
    ]
  }'::jsonb
),
-- Schritt 4: Zusatz-Features
(
  '10000000-0000-0000-0000-000000000001',
  4,
  'Zusätzliche Features',
  'Welche Extras benötigen Sie?',
  'multi_select',
  '{
    "id": "additionalFeatures",
    "options": [
      {
        "id": "audioConf",
        "label": "Audio Conferencing",
        "description": "4,00 CHF/User/Monat - Einwahl per Telefon in Meetings",
        "variableName": "needsAudioConf",
        "value": 1
      },
      {
        "id": "callQueues",
        "label": "Anrufwarteschlangen",
        "description": "Im Phone System enthalten - Professionelle Anrufverteilung",
        "variableName": "needsCallQueues",
        "value": 0
      },
      {
        "id": "autoAttendant",
        "label": "Auto Attendant (IVR)",
        "description": "Im Phone System enthalten - Automatische Ansage & Weiterleitung",
        "variableName": "needsAutoAttendant",
        "value": 0
      },
      {
        "id": "callRecording",
        "label": "Compliance-Aufzeichnung",
        "description": "Im E5 enthalten oder separat - Anrufaufzeichnung für Compliance",
        "variableName": "needsRecording",
        "value": 0
      },
      {
        "id": "contactCenter",
        "label": "Contact Center Integration",
        "description": "Separates Produkt - Für Call Center & Service Desk",
        "variableName": "needsContactCenter",
        "value": 0
      }
    ]
  }'::jsonb
),
-- Schritt 5: Ergebnis
(
  '10000000-0000-0000-0000-000000000001',
  5,
  'Ihre Kostenanalyse',
  'Teams Telephony Kostenrechner - Ergebnis',
  'result',
  '{
    "showChart": true,
    "showBreakdown": true,
    "showComparison": true,
    "ctaText": "Persönliche Beratung anfordern",
    "ctaDescription": "Unsere Teams-Telefonie Experten beraten Sie kostenlos"
  }'::jsonb
);

-- ============================================================================
-- 2. MICROSOFT 365 LIZENZ-VERGLEICHSRECHNER - VOLLSTÄNDIG
-- ============================================================================
UPDATE lead_magnets 
SET config = '{
  "wizardMode": true,
  "showProgress": true,
  "expertModeEnabled": true,
  "priceVariables": [
    {
      "id": "pv_basic",
      "name": "Business Basic",
      "variableName": "priceBasic",
      "value": 5.60,
      "unit": "CHF/User/Monat",
      "category": "Business",
      "description": "Web-Apps, E-Mail, Teams, OneDrive 1TB"
    },
    {
      "id": "pv_standard",
      "name": "Business Standard",
      "variableName": "priceStandard",
      "value": 11.70,
      "unit": "CHF/User/Monat",
      "category": "Business",
      "description": "Alles aus Basic + Desktop Office Apps"
    },
    {
      "id": "pv_premium",
      "name": "Business Premium",
      "variableName": "pricePremium",
      "value": 20.60,
      "unit": "CHF/User/Monat",
      "category": "Business",
      "description": "Alles aus Standard + Sicherheit + Geräteverwaltung"
    },
    {
      "id": "pv_e3",
      "name": "Enterprise E3",
      "variableName": "priceE3",
      "value": 35.70,
      "unit": "CHF/User/Monat",
      "category": "Enterprise",
      "description": "Unbegrenzter Speicher, eDiscovery, Compliance"
    },
    {
      "id": "pv_e5",
      "name": "Enterprise E5",
      "variableName": "priceE5",
      "value": 54.20,
      "unit": "CHF/User/Monat",
      "category": "Enterprise",
      "description": "E3 + Advanced Security + Phone System + Power BI Pro"
    },
    {
      "id": "pv_f3",
      "name": "Frontline F3",
      "variableName": "priceF3",
      "value": 7.50,
      "unit": "CHF/User/Monat",
      "category": "Frontline",
      "description": "Für Schichtarbeiter - eingeschränkte Features"
    },
    {
      "id": "pv_discount_10",
      "name": "Rabatt ab 10 Lizenzen",
      "variableName": "discount10",
      "value": 0.05,
      "unit": "Prozent",
      "category": "Rabatte",
      "description": "5% Rabatt ab 10 Lizenzen"
    },
    {
      "id": "pv_discount_50",
      "name": "Rabatt ab 50 Lizenzen",
      "variableName": "discount50",
      "value": 0.10,
      "unit": "Prozent",
      "category": "Rabatte",
      "description": "10% Rabatt ab 50 Lizenzen"
    },
    {
      "id": "pv_discount_100",
      "name": "Rabatt ab 100 Lizenzen",
      "variableName": "discount100",
      "value": 0.15,
      "unit": "Prozent",
      "category": "Rabatte",
      "description": "15% Rabatt ab 100 Lizenzen"
    },
    {
      "id": "pv_discount_250",
      "name": "Rabatt ab 250 Lizenzen",
      "variableName": "discount250",
      "value": 0.20,
      "unit": "Prozent",
      "category": "Rabatte",
      "description": "20% Rabatt ab 250 Lizenzen"
    },
    {
      "id": "pv_addon_defender",
      "name": "Defender for Office 365",
      "variableName": "addonDefender",
      "value": 1.90,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "Erweiterte E-Mail-Sicherheit"
    },
    {
      "id": "pv_addon_powerbi",
      "name": "Power BI Pro",
      "variableName": "addonPowerBI",
      "value": 9.40,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "Business Intelligence (in E5 enthalten)"
    },
    {
      "id": "pv_addon_phone",
      "name": "Phone System",
      "variableName": "addonPhone",
      "value": 7.50,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "Teams Telefonie (in E5 enthalten)"
    },
    {
      "id": "pv_addon_visio",
      "name": "Visio Plan 2",
      "variableName": "addonVisio",
      "value": 14.30,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "Professionelle Diagrammerstellung"
    },
    {
      "id": "pv_addon_project",
      "name": "Project Plan 3",
      "variableName": "addonProject",
      "value": 28.10,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "Projektmanagement"
    }
  ],
  "calculations": [
    {
      "id": "base_price",
      "formula": "CASE(licenseType, basic, priceBasic, standard, priceStandard, premium, pricePremium, e3, priceE3, e5, priceE5, f3, priceF3, 0)",
      "label": "Grundpreis",
      "dependsOn": ["licenseType"]
    },
    {
      "id": "volume_discount_rate",
      "formula": "IF(users >= 250, discount250, IF(users >= 100, discount100, IF(users >= 50, discount50, IF(users >= 10, discount10, 0))))",
      "label": "Volumenrabatt",
      "dependsOn": ["users"]
    },
    {
      "id": "monthly_base",
      "formula": "users * base_price",
      "label": "Monatliche Basiskosten",
      "dependsOn": ["users", "base_price"]
    },
    {
      "id": "discount_amount",
      "formula": "monthly_base * volume_discount_rate",
      "label": "Rabattbetrag",
      "dependsOn": ["monthly_base", "volume_discount_rate"]
    },
    {
      "id": "addon_total",
      "formula": "(needsDefender * addonDefender * users) + (needsPowerBI * addonPowerBI * users) + (needsPhone * addonPhone * users) + (needsVisio * visioUsers * addonVisio) + (needsProject * projectUsers * addonProject)",
      "label": "Add-On Kosten",
      "dependsOn": ["needsDefender", "addonDefender", "needsPowerBI", "addonPowerBI", "needsPhone", "addonPhone", "needsVisio", "visioUsers", "addonVisio", "needsProject", "projectUsers", "addonProject", "users"]
    },
    {
      "id": "monthly_total",
      "formula": "monthly_base - discount_amount + addon_total",
      "label": "Monatliche Gesamtkosten",
      "dependsOn": ["monthly_base", "discount_amount", "addon_total"]
    },
    {
      "id": "annual_total",
      "formula": "monthly_total * 12",
      "label": "Jährliche Kosten",
      "dependsOn": ["monthly_total"]
    },
    {
      "id": "cost_per_user",
      "formula": "monthly_total / users",
      "label": "Kosten pro User",
      "dependsOn": ["monthly_total", "users"]
    },
    {
      "id": "annual_savings_vs_retail",
      "formula": "(users * base_price * 12) - annual_total",
      "label": "Ersparnis durch Volumenrabatt",
      "dependsOn": ["users", "base_price", "annual_total"]
    }
  ],
  "outputs": [
    {
      "id": "out_monthly",
      "label": "Monatliche Kosten",
      "formula": "monthly_total",
      "format": "currency",
      "highlight": true
    },
    {
      "id": "out_annual",
      "label": "Jährliche Kosten",
      "formula": "annual_total",
      "format": "currency"
    },
    {
      "id": "out_per_user",
      "label": "Kosten pro User/Monat",
      "formula": "cost_per_user",
      "format": "currency"
    },
    {
      "id": "out_discount",
      "label": "Ihr Volumenrabatt",
      "formula": "volume_discount_rate",
      "format": "percentage"
    },
    {
      "id": "out_savings",
      "label": "Jährliche Ersparnis",
      "formula": "annual_savings_vs_retail",
      "format": "currency",
      "color": "green"
    }
  ],
  "charts": [
    {
      "id": "chart_comparison",
      "type": "bar",
      "title": "Lizenz-Preisvergleich pro User/Monat",
      "dataSource": ["priceBasic", "priceStandard", "pricePremium", "priceE3", "priceE5"],
      "labels": ["Basic", "Standard", "Premium", "E3", "E5"],
      "colors": ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"],
      "highlightSelected": true
    },
    {
      "id": "chart_breakdown",
      "type": "pie",
      "title": "Ihre Kostenverteilung",
      "dataSource": ["monthly_base", "addon_total"],
      "labels": ["Lizenzen", "Add-Ons"],
      "colors": ["#3b82f6", "#8b5cf6"]
    }
  ]
}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000002';

-- M365 Flow Steps - VOLLSTÄNDIG
DELETE FROM flow_steps WHERE lead_magnet_id = '10000000-0000-0000-0000-000000000002';

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
-- Schritt 1: Anzahl Benutzer
(
  '10000000-0000-0000-0000-000000000002',
  1,
  'Benutzeranzahl',
  'Für wie viele Mitarbeiter benötigen Sie Lizenzen?',
  'form',
  '{
    "fields": [
      {
        "id": "users",
        "label": "Anzahl Benutzer (Standard-Lizenzen)",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 50",
        "min": 1,
        "max": 10000,
        "variableName": "users",
        "helpText": "Mitarbeiter, die vollwertigen Zugriff benötigen"
      },
      {
        "id": "frontlineUsers",
        "label": "Anzahl Frontline-Benutzer (optional)",
        "type": "number",
        "required": false,
        "placeholder": "z.B. 20",
        "min": 0,
        "max": 10000,
        "variableName": "frontlineUsers",
        "helpText": "Schichtarbeiter, Produktionsmitarbeiter (eingeschränkte Features)"
      }
    ]
  }'::jsonb
),
-- Schritt 2: Lizenztyp
(
  '10000000-0000-0000-0000-000000000002',
  2,
  'Lizenztyp wählen',
  'Welche Microsoft 365 Lizenz passt zu Ihren Anforderungen?',
  'radio_group',
  '{
    "id": "licenseType",
    "variableName": "licenseType",
    "showFeatureComparison": true,
    "options": [
      {
        "id": "basic",
        "label": "Microsoft 365 Business Basic",
        "description": "5,60 CHF/User/Monat",
        "value": "basic",
        "features": ["Exchange Online", "Teams", "SharePoint", "OneDrive 1TB", "Web Office Apps"]
      },
      {
        "id": "standard",
        "label": "Microsoft 365 Business Standard",
        "description": "11,70 CHF/User/Monat",
        "value": "standard",
        "recommended": true,
        "features": ["Alles aus Basic", "Desktop Office Apps", "Bookings", "Publisher/Access (PC)"]
      },
      {
        "id": "premium",
        "label": "Microsoft 365 Business Premium",
        "description": "20,60 CHF/User/Monat",
        "value": "premium",
        "features": ["Alles aus Standard", "Defender for Office 365", "Intune", "Azure AD Premium P1"]
      },
      {
        "id": "e3",
        "label": "Microsoft 365 E3",
        "description": "35,70 CHF/User/Monat",
        "value": "e3",
        "features": ["Alles aus Premium", "Unbegrenzter OneDrive", "eDiscovery", "DLP", "Windows Enterprise"]
      },
      {
        "id": "e5",
        "label": "Microsoft 365 E5",
        "description": "54,20 CHF/User/Monat",
        "value": "e5",
        "features": ["Alles aus E3", "Phone System", "Power BI Pro", "Defender XDR", "Advanced Compliance"]
      }
    ]
  }'::jsonb
),
-- Schritt 3: Add-Ons
(
  '10000000-0000-0000-0000-000000000002',
  3,
  'Zusätzliche Produkte',
  'Benötigen Sie weitere Microsoft-Dienste?',
  'multi_select',
  '{
    "id": "addons",
    "description": "Einige Add-Ons sind bereits in höheren Lizenzen enthalten",
    "options": [
      {
        "id": "defender",
        "label": "Defender for Office 365 Plan 1",
        "description": "+1,90 CHF/User/Monat - Erweiterte E-Mail-Sicherheit (in Premium/E3/E5 enthalten)",
        "variableName": "needsDefender",
        "value": 1,
        "excludeIfLicense": ["premium", "e3", "e5"]
      },
      {
        "id": "powerbi",
        "label": "Power BI Pro",
        "description": "+9,40 CHF/User/Monat - Business Intelligence (in E5 enthalten)",
        "variableName": "needsPowerBI",
        "value": 1,
        "excludeIfLicense": ["e5"]
      },
      {
        "id": "phone",
        "label": "Phone System",
        "description": "+7,50 CHF/User/Monat - Teams Telefonie (in E5 enthalten)",
        "variableName": "needsPhone",
        "value": 1,
        "excludeIfLicense": ["e5"]
      }
    ]
  }'::jsonb
),
-- Schritt 4: Spezial-Lizenzen
(
  '10000000-0000-0000-0000-000000000002',
  4,
  'Spezial-Produkte',
  'Benötigen einzelne Mitarbeiter Visio oder Project?',
  'form',
  '{
    "fields": [
      {
        "id": "needsVisio",
        "label": "Benötigen Sie Visio?",
        "type": "select",
        "required": true,
        "variableName": "needsVisio",
        "options": [
          {"value": "0", "label": "Nein"},
          {"value": "1", "label": "Ja"}
        ]
      },
      {
        "id": "visioUsers",
        "label": "Anzahl Visio-Benutzer",
        "type": "number",
        "required": false,
        "min": 0,
        "variableName": "visioUsers",
        "helpText": "14,30 CHF/User/Monat",
        "showIf": "needsVisio == 1"
      },
      {
        "id": "needsProject",
        "label": "Benötigen Sie Project?",
        "type": "select",
        "required": true,
        "variableName": "needsProject",
        "options": [
          {"value": "0", "label": "Nein"},
          {"value": "1", "label": "Ja"}
        ]
      },
      {
        "id": "projectUsers",
        "label": "Anzahl Project-Benutzer",
        "type": "number",
        "required": false,
        "min": 0,
        "variableName": "projectUsers",
        "helpText": "28,10 CHF/User/Monat",
        "showIf": "needsProject == 1"
      }
    ]
  }'::jsonb
),
-- Schritt 5: Ergebnis
(
  '10000000-0000-0000-0000-000000000002',
  5,
  'Ihre Lizenzübersicht',
  'Microsoft 365 Kostenberechnung',
  'result',
  '{
    "showChart": true,
    "showFeatureTable": true,
    "showComparison": true,
    "ctaText": "Angebot anfordern",
    "ctaDescription": "Wir erstellen Ihnen ein individuelles Angebot"
  }'::jsonb
);

-- ============================================================================
-- 3. IT-OUTSOURCING ROI RECHNER - VOLLSTÄNDIG
-- ============================================================================
UPDATE lead_magnets 
SET config = '{
  "wizardMode": true,
  "showProgress": true,
  "expertModeEnabled": true,
  "priceVariables": [
    {
      "id": "pv_avg_salary",
      "name": "Durchschnittliches IT-Gehalt",
      "variableName": "avgSalary",
      "value": 65000,
      "unit": "CHF/Jahr",
      "category": "Personal",
      "description": "Brutto inkl. Lohnnebenkosten (~30%)"
    },
    {
      "id": "pv_tier1",
      "name": "Support Tier 1 - Basis",
      "variableName": "tier1Price",
      "value": 45,
      "unit": "CHF/User/Monat",
      "category": "Outsourcing",
      "description": "8x5 Support, E-Mail & Telefon"
    },
    {
      "id": "pv_tier2",
      "name": "Support Tier 2 - Standard",
      "variableName": "tier2Price",
      "value": 85,
      "unit": "CHF/User/Monat",
      "category": "Outsourcing",
      "description": "24x7 Support, Premium SLA"
    },
    {
      "id": "pv_tier3",
      "name": "Support Tier 3 - Premium",
      "variableName": "tier3Price",
      "value": 135,
      "unit": "CHF/User/Monat",
      "category": "Outsourcing",
      "description": "24x7 Proaktiv, Dedicated Manager"
    },
    {
      "id": "pv_security",
      "name": "Managed Security",
      "variableName": "securityPrice",
      "value": 25,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "SOC, SIEM, Incident Response"
    },
    {
      "id": "pv_backup",
      "name": "Managed Backup",
      "variableName": "backupPrice",
      "value": 15,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "Backup, DR, Restore Testing"
    },
    {
      "id": "pv_cloud",
      "name": "Cloud Management",
      "variableName": "cloudPrice",
      "value": 30,
      "unit": "CHF/User/Monat",
      "category": "Add-Ons",
      "description": "Azure/AWS/M365 Administration"
    },
    {
      "id": "pv_migration",
      "name": "Onboarding/Migration",
      "variableName": "migrationPerUser",
      "value": 500,
      "unit": "CHF/User einmalig",
      "category": "Einmalig",
      "description": "Einmalige Setup-Kosten"
    },
    {
      "id": "pv_hidden_it_overhead",
      "name": "IT-Overhead intern",
      "variableName": "itOverhead",
      "value": 1.3,
      "unit": "Faktor",
      "category": "Kalkulation",
      "description": "30% versteckte Kosten (Schulung, Tools, etc.)"
    }
  ],
  "calculations": [
    {
      "id": "internal_salary_cost",
      "formula": "internalStaff * avgSalary",
      "label": "Personalkosten intern",
      "dependsOn": ["internalStaff", "avgSalary"]
    },
    {
      "id": "internal_overhead",
      "formula": "internal_salary_cost * (itOverhead - 1)",
      "label": "Versteckte IT-Kosten",
      "dependsOn": ["internal_salary_cost", "itOverhead"]
    },
    {
      "id": "infrastructure_annual",
      "formula": "infrastructureMonthly * 12",
      "label": "Infrastrukturkosten jährlich",
      "dependsOn": ["infrastructureMonthly"]
    },
    {
      "id": "current_total_annual",
      "formula": "internal_salary_cost + internal_overhead + infrastructure_annual",
      "label": "Aktuelle Gesamtkosten jährlich",
      "dependsOn": ["internal_salary_cost", "internal_overhead", "infrastructure_annual"]
    },
    {
      "id": "outsourcing_base",
      "formula": "CASE(supportTier, tier1, tier1Price, tier2, tier2Price, tier3, tier3Price, 0) * users * 12",
      "label": "Outsourcing Basiskosten",
      "dependsOn": ["supportTier", "users"]
    },
    {
      "id": "outsourcing_security",
      "formula": "needsSecurity * securityPrice * users * 12",
      "label": "Security Services",
      "dependsOn": ["needsSecurity", "securityPrice", "users"]
    },
    {
      "id": "outsourcing_backup",
      "formula": "needsBackup * backupPrice * users * 12",
      "label": "Backup Services",
      "dependsOn": ["needsBackup", "backupPrice", "users"]
    },
    {
      "id": "outsourcing_cloud",
      "formula": "needsCloud * cloudPrice * users * 12",
      "label": "Cloud Services",
      "dependsOn": ["needsCloud", "cloudPrice", "users"]
    },
    {
      "id": "outsourcing_annual",
      "formula": "outsourcing_base + outsourcing_security + outsourcing_backup + outsourcing_cloud",
      "label": "Outsourcing Jahreskosten",
      "dependsOn": ["outsourcing_base", "outsourcing_security", "outsourcing_backup", "outsourcing_cloud"]
    },
    {
      "id": "migration_cost",
      "formula": "users * migrationPerUser",
      "label": "Einmalige Migrationskosten",
      "dependsOn": ["users", "migrationPerUser"]
    },
    {
      "id": "savings_annual",
      "formula": "current_total_annual - outsourcing_annual",
      "label": "Jährliche Ersparnis",
      "dependsOn": ["current_total_annual", "outsourcing_annual"]
    },
    {
      "id": "savings_5years",
      "formula": "(savings_annual * 5) - migration_cost",
      "label": "Ersparnis über 5 Jahre",
      "dependsOn": ["savings_annual", "migration_cost"]
    },
    {
      "id": "roi_percentage",
      "formula": "(savings_annual / current_total_annual) * 100",
      "label": "ROI Prozent",
      "dependsOn": ["savings_annual", "current_total_annual"]
    },
    {
      "id": "break_even_months",
      "formula": "migration_cost / (savings_annual / 12)",
      "label": "Break-Even Monate",
      "dependsOn": ["migration_cost", "savings_annual"]
    },
    {
      "id": "cost_per_user_internal",
      "formula": "current_total_annual / users / 12",
      "label": "Interne Kosten pro User",
      "dependsOn": ["current_total_annual", "users"]
    },
    {
      "id": "cost_per_user_outsourced",
      "formula": "outsourcing_annual / users / 12",
      "label": "Outsourcing Kosten pro User",
      "dependsOn": ["outsourcing_annual", "users"]
    }
  ],
  "outputs": [
    {
      "id": "out_current",
      "label": "Aktuelle IT-Kosten (jährlich)",
      "formula": "current_total_annual",
      "format": "currency",
      "color": "red"
    },
    {
      "id": "out_outsourcing",
      "label": "Outsourcing-Kosten (jährlich)",
      "formula": "outsourcing_annual",
      "format": "currency",
      "color": "green"
    },
    {
      "id": "out_savings",
      "label": "Jährliche Ersparnis",
      "formula": "savings_annual",
      "format": "currency",
      "highlight": true,
      "color": "green"
    },
    {
      "id": "out_roi",
      "label": "ROI",
      "formula": "roi_percentage",
      "format": "percentage"
    },
    {
      "id": "out_breakeven",
      "label": "Break-Even",
      "formula": "break_even_months",
      "format": "number",
      "unit": "Monate"
    },
    {
      "id": "out_5year",
      "label": "Ersparnis über 5 Jahre",
      "formula": "savings_5years",
      "format": "currency"
    }
  ],
  "charts": [
    {
      "id": "chart_comparison",
      "type": "bar",
      "title": "Kostenvergleich Intern vs. Outsourcing",
      "dataSource": ["current_total_annual", "outsourcing_annual"],
      "labels": ["Interne IT", "Outsourcing"],
      "colors": ["#ef4444", "#22c55e"]
    },
    {
      "id": "chart_breakdown_internal",
      "type": "pie",
      "title": "Aufschlüsselung aktuelle Kosten",
      "dataSource": ["internal_salary_cost", "internal_overhead", "infrastructure_annual"],
      "labels": ["Personal", "Overhead", "Infrastruktur"],
      "colors": ["#3b82f6", "#8b5cf6", "#f59e0b"]
    },
    {
      "id": "chart_timeline",
      "type": "line",
      "title": "5-Jahres Projektion",
      "showCumulative": true
    }
  ]
}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000003';

-- IT-Outsourcing Flow Steps - VOLLSTÄNDIG
DELETE FROM flow_steps WHERE lead_magnet_id = '10000000-0000-0000-0000-000000000003';

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
-- Schritt 1: Aktuelle IT-Situation
(
  '10000000-0000-0000-0000-000000000003',
  1,
  'Ihre IT-Organisation',
  'Wie ist Ihre IT derzeit aufgestellt?',
  'form',
  '{
    "fields": [
      {
        "id": "users",
        "label": "Anzahl IT-Benutzer",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 100",
        "min": 1,
        "max": 10000,
        "variableName": "users",
        "helpText": "Mitarbeiter, die IT-Support benötigen"
      },
      {
        "id": "internalStaff",
        "label": "Anzahl interne IT-Mitarbeiter",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 3",
        "min": 0,
        "max": 100,
        "variableName": "internalStaff",
        "helpText": "Vollzeit-IT-Mitarbeiter"
      },
      {
        "id": "infrastructureMonthly",
        "label": "Monatliche IT-Infrastrukturkosten (CHF)",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 5000",
        "min": 0,
        "variableName": "infrastructureMonthly",
        "helpText": "Server, Cloud, Lizenzen, Hardware, etc."
      }
    ]
  }'::jsonb
),
-- Schritt 2: Support-Level
(
  '10000000-0000-0000-0000-000000000003',
  2,
  'Gewünschtes Service-Level',
  'Welchen Support benötigen Sie?',
  'radio_group',
  '{
    "id": "supportTier",
    "variableName": "supportTier",
    "options": [
      {
        "id": "tier1",
        "label": "Tier 1: Basis-Support",
        "description": "45 CHF/User/Monat - 8x5 Support, Standard SLA (4h Reaktion)",
        "value": "tier1",
        "features": ["E-Mail & Telefon Support", "Remote-Hilfe", "Ticketsystem", "Monatliche Reports"]
      },
      {
        "id": "tier2",
        "label": "Tier 2: Standard-Support",
        "description": "85 CHF/User/Monat - 24x7 Support, Premium SLA (1h Reaktion)",
        "value": "tier2",
        "recommended": true,
        "features": ["Alles aus Tier 1", "24/7 Erreichbarkeit", "Proaktives Monitoring", "Quartals-Reviews"]
      },
      {
        "id": "tier3",
        "label": "Tier 3: Premium-Support",
        "description": "135 CHF/User/Monat - 24x7 Proaktiv mit Dedicated Manager",
        "value": "tier3",
        "features": ["Alles aus Tier 2", "Dedicated Account Manager", "Strategische Beratung", "Vor-Ort Support"]
      }
    ]
  }'::jsonb
),
-- Schritt 3: Zusatz-Services
(
  '10000000-0000-0000-0000-000000000003',
  3,
  'Zusätzliche Services',
  'Welche spezialisierten Services benötigen Sie?',
  'multi_select',
  '{
    "id": "additionalServices",
    "options": [
      {
        "id": "security",
        "label": "Managed Security",
        "description": "+25 CHF/User/Monat - SOC, SIEM, Incident Response, Security Awareness",
        "variableName": "needsSecurity",
        "value": 1
      },
      {
        "id": "backup",
        "label": "Managed Backup & DR",
        "description": "+15 CHF/User/Monat - Backup, Disaster Recovery, regelmäßige Restore-Tests",
        "variableName": "needsBackup",
        "value": 1
      },
      {
        "id": "cloud",
        "label": "Cloud Management",
        "description": "+30 CHF/User/Monat - Azure/AWS/M365 Administration & Optimierung",
        "variableName": "needsCloud",
        "value": 1
      }
    ]
  }'::jsonb
),
-- Schritt 4: Ergebnis
(
  '10000000-0000-0000-0000-000000000003',
  4,
  'Ihre ROI-Analyse',
  'IT-Outsourcing Wirtschaftlichkeitsberechnung',
  'result',
  '{
    "showChart": true,
    "showBreakdown": true,
    "showTimeline": true,
    "ctaText": "Unverbindliches Angebot anfordern",
    "ctaDescription": "Unsere Experten erstellen ein individuelles Konzept für Sie"
  }'::jsonb
);

-- ============================================================================
-- 4. CLOUD MIGRATION KOSTENRECHNER - VOLLSTÄNDIG
-- ============================================================================
UPDATE lead_magnets 
SET config = '{
  "wizardMode": true,
  "showProgress": true,
  "expertModeEnabled": true,
  "priceVariables": [
    {
      "id": "pv_server_onprem",
      "name": "On-Premise Server (Abschreibung)",
      "variableName": "serverOnpremYearly",
      "value": 3000,
      "unit": "CHF/Server/Jahr",
      "category": "On-Premise",
      "description": "Hardware-Kosten über 5 Jahre"
    },
    {
      "id": "pv_maintenance",
      "name": "Wartung & Support",
      "variableName": "maintenanceRate",
      "value": 0.20,
      "unit": "Prozent",
      "category": "On-Premise",
      "description": "20% der Hardware-Kosten"
    },
    {
      "id": "pv_power",
      "name": "Stromkosten",
      "variableName": "powerPerServer",
      "value": 100,
      "unit": "CHF/Server/Monat",
      "category": "On-Premise",
      "description": "Strom + Kühlung"
    },
    {
      "id": "pv_datacenter",
      "name": "Rechenzentrums-Kosten",
      "variableName": "datacenterPerServer",
      "value": 50,
      "unit": "CHF/Server/Monat",
      "category": "On-Premise",
      "description": "Fläche, Sicherheit, Internet"
    },
    {
      "id": "pv_azure_small",
      "name": "Azure VM (klein)",
      "variableName": "azureSmall",
      "value": 80,
      "unit": "CHF/VM/Monat",
      "category": "Azure",
      "description": "B2s: 2 vCPU, 4 GB RAM"
    },
    {
      "id": "pv_azure_medium",
      "name": "Azure VM (mittel)",
      "variableName": "azureMedium",
      "value": 180,
      "unit": "CHF/VM/Monat",
      "category": "Azure",
      "description": "D4s v3: 4 vCPU, 16 GB RAM"
    },
    {
      "id": "pv_azure_large",
      "name": "Azure VM (groß)",
      "variableName": "azureLarge",
      "value": 350,
      "unit": "CHF/VM/Monat",
      "category": "Azure",
      "description": "D8s v3: 8 vCPU, 32 GB RAM"
    },
    {
      "id": "pv_azure_xlarge",
      "name": "Azure VM (sehr groß)",
      "variableName": "azureXLarge",
      "value": 700,
      "unit": "CHF/VM/Monat",
      "category": "Azure",
      "description": "D16s v3: 16 vCPU, 64 GB RAM"
    },
    {
      "id": "pv_aws_small",
      "name": "AWS EC2 (klein)",
      "variableName": "awsSmall",
      "value": 75,
      "unit": "CHF/VM/Monat",
      "category": "AWS",
      "description": "t3.medium"
    },
    {
      "id": "pv_aws_medium",
      "name": "AWS EC2 (mittel)",
      "variableName": "awsMedium",
      "value": 160,
      "unit": "CHF/VM/Monat",
      "category": "AWS",
      "description": "m5.large"
    },
    {
      "id": "pv_aws_large",
      "name": "AWS EC2 (groß)",
      "variableName": "awsLarge",
      "value": 320,
      "unit": "CHF/VM/Monat",
      "category": "AWS",
      "description": "m5.xlarge"
    },
    {
      "id": "pv_migration_self",
      "name": "Migration Selbst",
      "variableName": "migrationSelf",
      "value": 0,
      "unit": "CHF/Server",
      "category": "Migration",
      "description": "Eigenleistung"
    },
    {
      "id": "pv_migration_basic",
      "name": "Migration Basic",
      "variableName": "migrationBasic",
      "value": 300,
      "unit": "CHF/Server",
      "category": "Migration",
      "description": "Mit Unterstützung"
    },
    {
      "id": "pv_migration_full",
      "name": "Migration Full-Service",
      "variableName": "migrationFull",
      "value": 800,
      "unit": "CHF/Server",
      "category": "Migration",
      "description": "Komplett durch Partner"
    },
    {
      "id": "pv_backup_cloud",
      "name": "Cloud Backup",
      "variableName": "backupCloud",
      "value": 25,
      "unit": "CHF/Server/Monat",
      "category": "Add-Ons",
      "description": "Automatisches Backup"
    },
    {
      "id": "pv_monitoring",
      "name": "Monitoring",
      "variableName": "monitoringCloud",
      "value": 20,
      "unit": "CHF/Server/Monat",
      "category": "Add-Ons",
      "description": "24/7 Überwachung"
    },
    {
      "id": "pv_security_cloud",
      "name": "Cloud Security",
      "variableName": "securityCloud",
      "value": 30,
      "unit": "CHF/Server/Monat",
      "category": "Add-Ons",
      "description": "Firewall, WAF, DDoS"
    }
  ],
  "calculations": [
    {
      "id": "onprem_hardware",
      "formula": "servers * serverOnpremYearly",
      "label": "Hardware-Kosten (jährlich)",
      "dependsOn": ["servers", "serverOnpremYearly"]
    },
    {
      "id": "onprem_maintenance",
      "formula": "onprem_hardware * maintenanceRate",
      "label": "Wartungskosten",
      "dependsOn": ["onprem_hardware", "maintenanceRate"]
    },
    {
      "id": "onprem_power",
      "formula": "servers * powerPerServer * 12",
      "label": "Stromkosten (jährlich)",
      "dependsOn": ["servers", "powerPerServer"]
    },
    {
      "id": "onprem_datacenter",
      "formula": "servers * datacenterPerServer * 12",
      "label": "Rechenzentrums-Kosten",
      "dependsOn": ["servers", "datacenterPerServer"]
    },
    {
      "id": "onprem_total",
      "formula": "onprem_hardware + onprem_maintenance + onprem_power + onprem_datacenter",
      "label": "On-Premise Gesamtkosten",
      "dependsOn": ["onprem_hardware", "onprem_maintenance", "onprem_power", "onprem_datacenter"]
    },
    {
      "id": "cloud_vm_price",
      "formula": "CASE(cloudProvider, azure, CASE(vmSize, small, azureSmall, medium, azureMedium, large, azureLarge, xlarge, azureXLarge, 0), aws, CASE(vmSize, small, awsSmall, medium, awsMedium, large, awsLarge, 0), 0)",
      "label": "Cloud VM Preis",
      "dependsOn": ["cloudProvider", "vmSize"]
    },
    {
      "id": "cloud_base_annual",
      "formula": "servers * cloud_vm_price * 12",
      "label": "Cloud Grundkosten (jährlich)",
      "dependsOn": ["servers", "cloud_vm_price"]
    },
    {
      "id": "cloud_addons",
      "formula": "(needsBackup * backupCloud + needsMonitoring * monitoringCloud + needsSecurity * securityCloud) * servers * 12",
      "label": "Cloud Add-Ons (jährlich)",
      "dependsOn": ["needsBackup", "backupCloud", "needsMonitoring", "monitoringCloud", "needsSecurity", "securityCloud", "servers"]
    },
    {
      "id": "cloud_annual",
      "formula": "cloud_base_annual + cloud_addons",
      "label": "Cloud Gesamtkosten (jährlich)",
      "dependsOn": ["cloud_base_annual", "cloud_addons"]
    },
    {
      "id": "migration_total",
      "formula": "servers * CASE(migrationService, self, migrationSelf, basic, migrationBasic, full, migrationFull, 0)",
      "label": "Migrationskosten (einmalig)",
      "dependsOn": ["servers", "migrationService"]
    },
    {
      "id": "first_year_cloud",
      "formula": "cloud_annual + migration_total",
      "label": "Cloud Kosten Jahr 1",
      "dependsOn": ["cloud_annual", "migration_total"]
    },
    {
      "id": "savings_annual",
      "formula": "onprem_total - cloud_annual",
      "label": "Jährliche Ersparnis",
      "dependsOn": ["onprem_total", "cloud_annual"]
    },
    {
      "id": "savings_year1",
      "formula": "onprem_total - first_year_cloud",
      "label": "Ersparnis Jahr 1",
      "dependsOn": ["onprem_total", "first_year_cloud"]
    },
    {
      "id": "savings_3years",
      "formula": "(savings_annual * 3) - migration_total",
      "label": "Ersparnis 3 Jahre",
      "dependsOn": ["savings_annual", "migration_total"]
    },
    {
      "id": "savings_5years",
      "formula": "(savings_annual * 5) - migration_total",
      "label": "Ersparnis 5 Jahre",
      "dependsOn": ["savings_annual", "migration_total"]
    },
    {
      "id": "break_even_months",
      "formula": "IF(savings_annual > 0, migration_total / (savings_annual / 12), 999)",
      "label": "Break-Even Monate",
      "dependsOn": ["migration_total", "savings_annual"]
    }
  ],
  "outputs": [
    {
      "id": "out_onprem",
      "label": "On-Premise (jährlich)",
      "formula": "onprem_total",
      "format": "currency",
      "color": "red"
    },
    {
      "id": "out_cloud",
      "label": "Cloud (jährlich)",
      "formula": "cloud_annual",
      "format": "currency",
      "color": "green"
    },
    {
      "id": "out_migration",
      "label": "Migrationskosten (einmalig)",
      "formula": "migration_total",
      "format": "currency"
    },
    {
      "id": "out_savings_y1",
      "label": "Ersparnis Jahr 1",
      "formula": "savings_year1",
      "format": "currency",
      "highlight": true
    },
    {
      "id": "out_savings_3y",
      "label": "Ersparnis über 3 Jahre",
      "formula": "savings_3years",
      "format": "currency"
    },
    {
      "id": "out_savings_5y",
      "label": "Ersparnis über 5 Jahre",
      "formula": "savings_5years",
      "format": "currency"
    },
    {
      "id": "out_breakeven",
      "label": "Break-Even",
      "formula": "break_even_months",
      "format": "number",
      "unit": "Monate"
    }
  ],
  "charts": [
    {
      "id": "chart_comparison",
      "type": "bar",
      "title": "Jährliche Kosten im Vergleich",
      "dataSource": ["onprem_total", "cloud_annual"],
      "labels": ["On-Premise", "Cloud"],
      "colors": ["#ef4444", "#22c55e"]
    },
    {
      "id": "chart_onprem_breakdown",
      "type": "pie",
      "title": "On-Premise Kostenaufteilung",
      "dataSource": ["onprem_hardware", "onprem_maintenance", "onprem_power", "onprem_datacenter"],
      "labels": ["Hardware", "Wartung", "Strom", "Rechenzentrum"],
      "colors": ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"]
    },
    {
      "id": "chart_timeline",
      "type": "line",
      "title": "5-Jahres Kostenprojektion",
      "showCumulative": true,
      "years": 5
    }
  ]
}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000004';

-- Cloud Migration Flow Steps - VOLLSTÄNDIG
DELETE FROM flow_steps WHERE lead_magnet_id = '10000000-0000-0000-0000-000000000004';

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
-- Schritt 1: Aktuelle Infrastruktur
(
  '10000000-0000-0000-0000-000000000004',
  1,
  'Aktuelle Infrastruktur',
  'Beschreiben Sie Ihre On-Premise Server-Landschaft',
  'form',
  '{
    "fields": [
      {
        "id": "servers",
        "label": "Anzahl physischer Server",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 10",
        "min": 1,
        "max": 1000,
        "variableName": "servers",
        "helpText": "Physische Server, die migriert werden sollen"
      },
      {
        "id": "avgAge",
        "label": "Durchschnittliches Alter der Server",
        "type": "select",
        "required": true,
        "variableName": "avgAge",
        "options": [
          {"value": "1-2", "label": "1-2 Jahre (neuwertig)"},
          {"value": "3-4", "label": "3-4 Jahre (gut)"},
          {"value": "5+", "label": "5+ Jahre (veraltet)"}
        ],
        "helpText": "Ältere Server = höhere Einsparung durch Migration"
      }
    ]
  }'::jsonb
),
-- Schritt 2: Cloud-Anbieter
(
  '10000000-0000-0000-0000-000000000004',
  2,
  'Cloud-Anbieter wählen',
  'Welchen Cloud-Anbieter bevorzugen Sie?',
  'radio_group',
  '{
    "id": "cloudProvider",
    "variableName": "cloudProvider",
    "options": [
      {
        "id": "azure",
        "label": "Microsoft Azure",
        "description": "Beste Integration mit Microsoft 365 & Windows Server",
        "value": "azure",
        "recommended": true,
        "features": ["Azure AD Integration", "Hybrid Cloud", "Windows License Benefits"]
      },
      {
        "id": "aws",
        "label": "Amazon Web Services (AWS)",
        "description": "Marktführer mit größtem Service-Portfolio",
        "value": "aws",
        "features": ["Größte Auswahl", "Globale Präsenz", "Etabliertes Ökosystem"]
      }
    ]
  }'::jsonb
),
-- Schritt 3: VM-Größe
(
  '10000000-0000-0000-0000-000000000004',
  3,
  'Server-Größe',
  'Welche Leistungsklasse benötigen Ihre Server?',
  'radio_group',
  '{
    "id": "vmSize",
    "variableName": "vmSize",
    "options": [
      {
        "id": "small",
        "label": "Klein (2 vCPU, 4-8 GB RAM)",
        "description": "Azure: ~80 CHF/Monat | AWS: ~75 CHF/Monat",
        "value": "small",
        "useCase": "Fileserver, Domain Controller, kleine Datenbanken"
      },
      {
        "id": "medium",
        "label": "Mittel (4 vCPU, 16 GB RAM)",
        "description": "Azure: ~180 CHF/Monat | AWS: ~160 CHF/Monat",
        "value": "medium",
        "recommended": true,
        "useCase": "Applikationsserver, mittelgroße Datenbanken"
      },
      {
        "id": "large",
        "label": "Groß (8 vCPU, 32 GB RAM)",
        "description": "Azure: ~350 CHF/Monat | AWS: ~320 CHF/Monat",
        "value": "large",
        "useCase": "Datenbankserver, ERP-Systeme"
      },
      {
        "id": "xlarge",
        "label": "Sehr groß (16 vCPU, 64 GB RAM)",
        "description": "Azure: ~700 CHF/Monat",
        "value": "xlarge",
        "useCase": "High-Performance Workloads"
      }
    ]
  }'::jsonb
),
-- Schritt 4: Migration
(
  '10000000-0000-0000-0000-000000000004',
  4,
  'Migrations-Service',
  'Wie möchten Sie die Migration durchführen?',
  'radio_group',
  '{
    "id": "migrationService",
    "variableName": "migrationService",
    "options": [
      {
        "id": "self",
        "label": "Selbst durchführen",
        "description": "CHF 0 - Sie haben das Know-how im Haus",
        "value": "self"
      },
      {
        "id": "basic",
        "label": "Mit Unterstützung",
        "description": "300 CHF/Server - Beratung + Unterstützung bei der Migration",
        "value": "basic",
        "recommended": true
      },
      {
        "id": "full",
        "label": "Full-Service Migration",
        "description": "800 CHF/Server - Wir übernehmen die komplette Migration",
        "value": "full"
      }
    ]
  }'::jsonb
),
-- Schritt 5: Cloud Add-Ons
(
  '10000000-0000-0000-0000-000000000004',
  5,
  'Cloud-Services',
  'Welche zusätzlichen Cloud-Services benötigen Sie?',
  'multi_select',
  '{
    "id": "cloudAddons",
    "options": [
      {
        "id": "backup",
        "label": "Cloud Backup & Disaster Recovery",
        "description": "+25 CHF/Server/Monat - Automatische Backups, Geo-Redundanz",
        "variableName": "needsBackup",
        "value": 1,
        "recommended": true
      },
      {
        "id": "monitoring",
        "label": "24/7 Monitoring & Alerting",
        "description": "+20 CHF/Server/Monat - Proaktive Überwachung aller Systeme",
        "variableName": "needsMonitoring",
        "value": 1,
        "recommended": true
      },
      {
        "id": "security",
        "label": "Advanced Security",
        "description": "+30 CHF/Server/Monat - Firewall, WAF, DDoS-Schutz",
        "variableName": "needsSecurity",
        "value": 1
      }
    ]
  }'::jsonb
),
-- Schritt 6: Ergebnis
(
  '10000000-0000-0000-0000-000000000004',
  6,
  'Ihre Cloud-Migration Analyse',
  'On-Premise vs. Cloud Kostenvergleich',
  'result',
  '{
    "showChart": true,
    "showBreakdown": true,
    "showTimeline": true,
    "ctaText": "Migrations-Workshop buchen",
    "ctaDescription": "Kostenloses Assessment Ihrer Infrastruktur"
  }'::jsonb
);

-- ============================================================================
-- 5. IT-SECURITY AUDIT KOSTEN/NUTZEN RECHNER - VOLLSTÄNDIG
-- ============================================================================
UPDATE lead_magnets 
SET config = '{
  "wizardMode": true,
  "showProgress": true,
  "expertModeEnabled": true,
  "priceVariables": [
    {
      "id": "pv_audit_basic_base",
      "name": "Basis-Audit Grundgebühr",
      "variableName": "auditBasicBase",
      "value": 3500,
      "unit": "CHF einmalig",
      "category": "Audit-Kosten",
      "description": "Grundpreis für Basis-Audit"
    },
    {
      "id": "pv_audit_basic_user",
      "name": "Basis-Audit pro User",
      "variableName": "auditBasicUser",
      "value": 5,
      "unit": "CHF/User",
      "category": "Audit-Kosten",
      "description": "Zusatzkosten pro User"
    },
    {
      "id": "pv_audit_standard_base",
      "name": "Standard-Audit Grundgebühr",
      "variableName": "auditStandardBase",
      "value": 8000,
      "unit": "CHF einmalig",
      "category": "Audit-Kosten",
      "description": "Grundpreis für Standard-Audit"
    },
    {
      "id": "pv_audit_standard_user",
      "name": "Standard-Audit pro User",
      "variableName": "auditStandardUser",
      "value": 12,
      "unit": "CHF/User",
      "category": "Audit-Kosten",
      "description": "Zusatzkosten pro User"
    },
    {
      "id": "pv_audit_premium_base",
      "name": "Premium-Audit Grundgebühr",
      "variableName": "auditPremiumBase",
      "value": 15000,
      "unit": "CHF einmalig",
      "category": "Audit-Kosten",
      "description": "Grundpreis für Premium-Audit"
    },
    {
      "id": "pv_audit_premium_user",
      "name": "Premium-Audit pro User",
      "variableName": "auditPremiumUser",
      "value": 25,
      "unit": "CHF/User",
      "category": "Audit-Kosten",
      "description": "Zusatzkosten pro User"
    },
    {
      "id": "pv_pentests",
      "name": "Penetration Tests",
      "variableName": "pentestPrice",
      "value": 5000,
      "unit": "CHF einmalig",
      "category": "Add-Ons",
      "description": "Externe Sicherheitstests"
    },
    {
      "id": "pv_social_engineering",
      "name": "Social Engineering Test",
      "variableName": "socialEngPrice",
      "value": 3000,
      "unit": "CHF einmalig",
      "category": "Add-Ons",
      "description": "Phishing-Simulation & Awareness Test"
    },
    {
      "id": "pv_compliance_check",
      "name": "Compliance-Check",
      "variableName": "compliancePrice",
      "value": 2500,
      "unit": "CHF einmalig",
      "category": "Add-Ons",
      "description": "DSGVO, ISO 27001, etc."
    },
    {
      "id": "pv_avg_breach_cost",
      "name": "Durchschn. Kosten Datenpanne",
      "variableName": "avgBreachCost",
      "value": 165000,
      "unit": "CHF",
      "category": "Risiko",
      "description": "Durchschnittliche Kosten einer Datenpanne (Bitkom)"
    },
    {
      "id": "pv_risk_factor_high",
      "name": "Risikofaktor Hoch",
      "variableName": "riskFactorHigh",
      "value": 0.35,
      "unit": "Prozent",
      "category": "Risiko",
      "description": "35% Wahrscheinlichkeit pro Jahr"
    },
    {
      "id": "pv_risk_factor_medium",
      "name": "Risikofaktor Mittel",
      "variableName": "riskFactorMedium",
      "value": 0.15,
      "unit": "Prozent",
      "category": "Risiko",
      "description": "15% Wahrscheinlichkeit pro Jahr"
    },
    {
      "id": "pv_risk_factor_low",
      "name": "Risikofaktor Niedrig",
      "variableName": "riskFactorLow",
      "value": 0.05,
      "unit": "Prozent",
      "category": "Risiko",
      "description": "5% Wahrscheinlichkeit pro Jahr"
    },
    {
      "id": "pv_remediation_rate",
      "name": "Risikoreduktion durch Audit",
      "variableName": "remediationRate",
      "value": 0.70,
      "unit": "Prozent",
      "category": "Wert",
      "description": "70% Risikoreduktion bei Umsetzung"
    }
  ],
  "calculations": [
    {
      "id": "audit_base_cost",
      "formula": "CASE(auditType, basic, auditBasicBase, standard, auditStandardBase, premium, auditPremiumBase, 0)",
      "label": "Audit Grundkosten",
      "dependsOn": ["auditType"]
    },
    {
      "id": "audit_user_cost",
      "formula": "CASE(auditType, basic, auditBasicUser, standard, auditStandardUser, premium, auditPremiumUser, 0) * users",
      "label": "Audit User-Kosten",
      "dependsOn": ["auditType", "users"]
    },
    {
      "id": "audit_total",
      "formula": "audit_base_cost + audit_user_cost",
      "label": "Audit Gesamtkosten",
      "dependsOn": ["audit_base_cost", "audit_user_cost"]
    },
    {
      "id": "addons_total",
      "formula": "(needsPentest * pentestPrice) + (needsSocialEng * socialEngPrice) + (needsCompliance * compliancePrice)",
      "label": "Add-On Kosten",
      "dependsOn": ["needsPentest", "pentestPrice", "needsSocialEng", "socialEngPrice", "needsCompliance", "compliancePrice"]
    },
    {
      "id": "investment_total",
      "formula": "audit_total + addons_total",
      "label": "Gesamtinvestition",
      "dependsOn": ["audit_total", "addons_total"]
    },
    {
      "id": "risk_factor_current",
      "formula": "CASE(currentRisk, high, riskFactorHigh, medium, riskFactorMedium, low, riskFactorLow, 0)",
      "label": "Aktueller Risikofaktor",
      "dependsOn": ["currentRisk"]
    },
    {
      "id": "potential_loss_annual",
      "formula": "avgBreachCost * risk_factor_current",
      "label": "Erwarteter Verlust (jährlich)",
      "dependsOn": ["avgBreachCost", "risk_factor_current"]
    },
    {
      "id": "risk_reduction",
      "formula": "potential_loss_annual * remediationRate",
      "label": "Risikoreduktion durch Audit",
      "dependsOn": ["potential_loss_annual", "remediationRate"]
    },
    {
      "id": "net_value_year1",
      "formula": "risk_reduction - investment_total",
      "label": "Netto-Wert Jahr 1",
      "dependsOn": ["risk_reduction", "investment_total"]
    },
    {
      "id": "net_value_3years",
      "formula": "(risk_reduction * 3) - investment_total",
      "label": "Netto-Wert 3 Jahre",
      "dependsOn": ["risk_reduction", "investment_total"]
    },
    {
      "id": "roi_percentage",
      "formula": "((risk_reduction - investment_total) / investment_total) * 100",
      "label": "ROI Prozent",
      "dependsOn": ["risk_reduction", "investment_total"]
    },
    {
      "id": "risk_score_before",
      "formula": "CASE(currentRisk, high, 85, medium, 50, low, 25, 0)",
      "label": "Risiko-Score vorher",
      "dependsOn": ["currentRisk"]
    },
    {
      "id": "risk_score_after",
      "formula": "risk_score_before * (1 - remediationRate)",
      "label": "Risiko-Score nachher",
      "dependsOn": ["risk_score_before", "remediationRate"]
    }
  ],
  "outputs": [
    {
      "id": "out_investment",
      "label": "Ihre Investition",
      "formula": "investment_total",
      "format": "currency"
    },
    {
      "id": "out_potential_loss",
      "label": "Erwarteter Schaden (ohne Audit)",
      "formula": "potential_loss_annual",
      "format": "currency",
      "color": "red"
    },
    {
      "id": "out_risk_reduction",
      "label": "Jährliche Risikoreduktion",
      "formula": "risk_reduction",
      "format": "currency",
      "color": "green"
    },
    {
      "id": "out_roi",
      "label": "ROI",
      "formula": "roi_percentage",
      "format": "percentage",
      "highlight": true
    },
    {
      "id": "out_net_3y",
      "label": "Netto-Wert über 3 Jahre",
      "formula": "net_value_3years",
      "format": "currency"
    },
    {
      "id": "out_risk_before",
      "label": "Risiko-Score (vorher)",
      "formula": "risk_score_before",
      "format": "number",
      "color": "red"
    },
    {
      "id": "out_risk_after",
      "label": "Risiko-Score (nachher)",
      "formula": "risk_score_after",
      "format": "number",
      "color": "green"
    }
  ],
  "charts": [
    {
      "id": "chart_value",
      "type": "bar",
      "title": "Investition vs. Risikoreduktion",
      "dataSource": ["investment_total", "risk_reduction"],
      "labels": ["Investition", "Jährliche Risikoreduktion"],
      "colors": ["#ef4444", "#22c55e"]
    },
    {
      "id": "chart_risk",
      "type": "bar",
      "title": "Risiko-Score Vergleich",
      "dataSource": ["risk_score_before", "risk_score_after"],
      "labels": ["Vor Audit", "Nach Audit"],
      "colors": ["#ef4444", "#22c55e"]
    },
    {
      "id": "chart_breakdown",
      "type": "pie",
      "title": "Investitionsaufteilung",
      "dataSource": ["audit_total", "addons_total"],
      "labels": ["Audit", "Zusatz-Tests"],
      "colors": ["#3b82f6", "#8b5cf6"]
    }
  ]
}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000005';

-- IT-Security Audit Flow Steps - VOLLSTÄNDIG
DELETE FROM flow_steps WHERE lead_magnet_id = '10000000-0000-0000-0000-000000000005';

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
-- Schritt 1: Unternehmensgröße
(
  '10000000-0000-0000-0000-000000000005',
  1,
  'Ihr Unternehmen',
  'Grundlegende Informationen für die Kostenberechnung',
  'form',
  '{
    "fields": [
      {
        "id": "users",
        "label": "Anzahl Mitarbeiter mit IT-Zugang",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 100",
        "min": 1,
        "max": 10000,
        "variableName": "users",
        "helpText": "Alle Mitarbeiter, die Computer/E-Mail nutzen"
      },
      {
        "id": "servers",
        "label": "Anzahl Server",
        "type": "number",
        "required": true,
        "placeholder": "z.B. 10",
        "min": 1,
        "max": 500,
        "variableName": "servers",
        "helpText": "Physische und virtuelle Server"
      },
      {
        "id": "industry",
        "label": "Branche",
        "type": "select",
        "required": true,
        "variableName": "industry",
        "options": [
          {"value": "finance", "label": "Finanzen & Versicherung"},
          {"value": "healthcare", "label": "Gesundheitswesen"},
          {"value": "manufacturing", "label": "Produktion / Industrie"},
          {"value": "retail", "label": "Handel"},
          {"value": "services", "label": "Dienstleistungen"},
          {"value": "public", "label": "Öffentlicher Sektor"},
          {"value": "other", "label": "Sonstige"}
        ],
        "helpText": "Für branchenspezifische Compliance"
      }
    ]
  }'::jsonb
),
-- Schritt 2: Aktuelle Sicherheitslage
(
  '10000000-0000-0000-0000-000000000005',
  2,
  'Aktuelle Sicherheitslage',
  'Wie schätzen Sie Ihre IT-Sicherheit ein?',
  'radio_group',
  '{
    "id": "currentRisk",
    "variableName": "currentRisk",
    "options": [
      {
        "id": "high",
        "label": "Hohes Risiko",
        "description": "Wir haben bekannte Schwachstellen und/oder hatten bereits Vorfälle",
        "value": "high",
        "indicators": ["Keine regelmäßigen Updates", "Keine MFA", "Veraltete Software", "Kein Security Training"]
      },
      {
        "id": "medium",
        "label": "Mittleres Risiko",
        "description": "Basis-Schutz vorhanden, aber Verbesserungspotential",
        "value": "medium",
        "indicators": ["Updates teilweise automatisiert", "MFA nur für Admins", "Standard-Antivirus"]
      },
      {
        "id": "low",
        "label": "Niedriges Risiko",
        "description": "Wir haben bereits umfangreiche Sicherheitsmaßnahmen",
        "value": "low",
        "indicators": ["MFA für alle", "EDR/XDR Lösung", "Security Training", "SIEM vorhanden"]
      }
    ]
  }'::jsonb
),
-- Schritt 3: Audit-Typ
(
  '10000000-0000-0000-0000-000000000005',
  3,
  'Audit-Umfang wählen',
  'Welchen Audit-Umfang benötigen Sie?',
  'radio_group',
  '{
    "id": "auditType",
    "variableName": "auditType",
    "options": [
      {
        "id": "basic",
        "label": "Basis-Audit",
        "description": "Ab CHF 3500 + 5 CHF/User - Grundlegende Schwachstellenanalyse",
        "value": "basic",
        "includes": ["Vulnerability Scan", "Basis-Bericht", "Top 10 Empfehlungen"]
      },
      {
        "id": "standard",
        "label": "Standard-Audit",
        "description": "Ab CHF 8000 + 12 CHF/User - Umfassende Sicherheitsanalyse",
        "value": "standard",
        "recommended": true,
        "includes": ["Alles aus Basis", "Manuelle Prüfung", "Detaillierter Bericht", "Maßnahmenplan"]
      },
      {
        "id": "premium",
        "label": "Premium-Audit",
        "description": "Ab CHF 15000 + 25 CHF/User - Vollständige Sicherheitsüberprüfung",
        "value": "premium",
        "includes": ["Alles aus Standard", "Architektur-Review", "Red Team Assessment", "C-Level Präsentation"]
      }
    ]
  }'::jsonb
),
-- Schritt 4: Zusätzliche Tests
(
  '10000000-0000-0000-0000-000000000005',
  4,
  'Zusätzliche Sicherheitstests',
  'Empfohlene Erweiterungen für einen umfassenden Überblick',
  'multi_select',
  '{
    "id": "additionalTests",
    "options": [
      {
        "id": "pentest",
        "label": "Penetration Test (extern)",
        "description": "+CHF 5000 - Simulierter Hackerangriff von aussen",
        "variableName": "needsPentest",
        "value": 1,
        "recommended": true
      },
      {
        "id": "socialeng",
        "label": "Social Engineering Test",
        "description": "+CHF 3000 - Phishing-Simulation & Mitarbeiter-Awareness",
        "variableName": "needsSocialEng",
        "value": 1
      },
      {
        "id": "compliance",
        "label": "Compliance-Check",
        "description": "+CHF 2500 - DSGVO, ISO 27001 oder branchenspezifisch",
        "variableName": "needsCompliance",
        "value": 1
      }
    ]
  }'::jsonb
),
-- Schritt 5: Ergebnis
(
  '10000000-0000-0000-0000-000000000005',
  5,
  'Ihre Kosten-Nutzen-Analyse',
  'IT-Security Audit ROI Berechnung',
  'result',
  '{
    "showChart": true,
    "showRiskMatrix": true,
    "showBreakdown": true,
    "showRecommendation": true,
    "ctaText": "Audit-Termin vereinbaren",
    "ctaDescription": "Kostenlose Erstberatung mit unseren Security-Experten"
  }'::jsonb
);

-- ============================================================================
-- ENDE DER VOLLSTÄNDIGEN KALKULATOR-KONFIGURATIONEN
-- ============================================================================

