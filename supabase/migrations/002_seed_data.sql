-- ============================================================================
-- CLEANUP: Lösche bestehende Demo-Daten (für Idempotenz)
-- ============================================================================

-- Lösche Demo-Submissions
DELETE FROM submissions WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Lösche Flow Steps (CASCADE löscht automatisch abhängige Daten)
DELETE FROM flow_steps WHERE lead_magnet_id IN (
  SELECT id FROM lead_magnets WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
);

-- Lösche Lead Magnets
DELETE FROM lead_magnets WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Lösche Email Templates
DELETE FROM email_templates WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Lösche Tenant (wird am Ende neu erstellt)
DELETE FROM tenants WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed initial tenant
INSERT INTO tenants (id, name, slug, branding) VALUES
  ('00000000-0000-0000-0000-000000000001', 'LeftClick', 'leftclick', '{"primaryColor": "#3b82f6", "secondaryColor": "#8b5cf6", "logo": null}'::jsonb);

-- ============================================================================
-- KALKULATOREN
-- ============================================================================

-- 1. Teams Telephony Kalkulator
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'calculator',
    'Microsoft Teams Telephony Kostenrechner',
    'Berechnen Sie die Gesamtkosten für die Einführung von Microsoft Teams Telefonie in Ihrem Unternehmen',
    'teams-telephony-calculator',
    '{
      "wizardMode": true,
      "showProgress": true,
      "calculations": [
        {
          "id": "phone_system_cost",
          "formula": "users * phoneSystemPrice",
          "dependsOn": ["users", "phoneSystemPrice"]
        },
        {
          "id": "calling_plan_cost",
          "formula": "users * callingPlanPrice",
          "dependsOn": ["users", "callingPlanPrice"]
        },
        {
          "id": "direct_routing_cost",
          "formula": "directRoutingSbcCost",
          "dependsOn": ["directRoutingSbcCost"]
        },
        {
          "id": "total_monthly_cost",
          "formula": "phone_system_cost + calling_plan_cost + direct_routing_cost",
          "dependsOn": ["phone_system_cost", "calling_plan_cost", "direct_routing_cost"]
        },
        {
          "id": "annual_cost",
          "formula": "total_monthly_cost * 12",
          "dependsOn": ["total_monthly_cost"]
        },
        {
          "id": "savings_vs_traditional",
          "formula": "(users * 50) - total_monthly_cost",
          "dependsOn": ["users", "total_monthly_cost"]
        },
        {
          "id": "roi_percentage",
          "formula": "(savings_vs_traditional / (users * 50)) * 100",
          "dependsOn": ["savings_vs_traditional", "users"]
        }
      ],
      "outputs": [
        {
          "id": "monthly_cost",
          "label": "Monatliche Kosten",
          "formula": "total_monthly_cost",
          "format": "currency"
        },
        {
          "id": "annual_cost",
          "label": "Jährliche Kosten",
          "formula": "annual_cost",
          "format": "currency"
        },
        {
          "id": "savings",
          "label": "Ersparnis vs. traditionelle Telefonie",
          "formula": "savings_vs_traditional",
          "format": "currency"
        },
        {
          "id": "roi",
          "label": "ROI",
          "formula": "roi_percentage",
          "format": "percentage"
        }
      ]
    }'::jsonb
  );

-- Teams Telephony Flow Steps
INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    1,
    'Unternehmensprofil',
    'Geben Sie uns einige grundlegende Informationen über Ihr Unternehmen',
    'form',
    '{
      "fields": [
        {
          "id": "users",
          "label": "Anzahl der Benutzer",
          "type": "number",
          "required": true,
          "placeholder": "z.B. 50",
          "description": "Wie viele Mitarbeiter benötigen Teams Telefonie?"
        },
        {
          "id": "locations",
          "label": "Anzahl der Standorte",
          "type": "number",
          "required": true,
          "placeholder": "z.B. 3",
          "description": "Wie viele Bürostandorte haben Sie?"
        },
        {
          "id": "existing_licenses",
          "label": "Bestehende Microsoft 365 Lizenzen",
          "type": "select",
          "required": true,
          "options": [
            {"value": "none", "label": "Keine"},
            {"value": "basic", "label": "Business Basic"},
            {"value": "standard", "label": "Business Standard"},
            {"value": "premium", "label": "Business Premium"},
            {"value": "e3", "label": "Microsoft 365 E3"},
            {"value": "e5", "label": "Microsoft 365 E5"}
          ],
          "description": "Welche Microsoft 365 Lizenzen nutzen Sie bereits?"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    2,
    'Telefonie-Anforderungen',
    'Welche Telefonie-Funktionen benötigen Sie?',
    'multi_select',
    '{
      "id": "telephony_requirements",
      "options": [
        {
          "id": "internal_calls",
          "label": "Interne Anrufe",
          "description": "Anrufe zwischen Mitarbeitern",
          "value": 0
        },
        {
          "id": "domestic_calls",
          "label": "Nationale Anrufe",
          "description": "Anrufe innerhalb Deutschlands",
          "value": 12
        },
        {
          "id": "international_calls",
          "label": "Internationale Anrufe",
          "description": "Anrufe ins Ausland",
          "value": 24
        },
        {
          "id": "conference_calls",
          "label": "Konferenz-Anrufe",
          "description": "Mehrere Teilnehmer gleichzeitig",
          "value": 0
        },
        {
          "id": "call_recording",
          "label": "Anrufaufzeichnung",
          "description": "Automatische Aufzeichnung von Anrufen",
          "value": 5
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    3,
    'Bestehende Infrastruktur',
    'Was haben Sie bereits im Einsatz?',
    'form',
    '{
      "fields": [
        {
          "id": "current_phone_system",
          "label": "Aktuelles Telefonsystem",
          "type": "select",
          "required": true,
          "options": [
            {"value": "traditional", "label": "Traditionelle Telefonanlage"},
            {"value": "voip", "label": "VoIP-System"},
            {"value": "none", "label": "Keines"},
            {"value": "other", "label": "Anderes"}
          ]
        },
        {
          "id": "current_monthly_cost",
          "label": "Aktuelle monatliche Telefonkosten (CHF)",
          "type": "number",
          "required": true,
          "placeholder": "z.B. 2500",
          "description": "Was zahlen Sie aktuell für Telefonie?"
        },
        {
          "id": "has_sbc",
          "label": "Session Border Controller vorhanden?",
          "type": "select",
          "required": true,
          "options": [
            {"value": "yes", "label": "Ja"},
            {"value": "no", "label": "Nein"}
          ]
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    4,
    'Gewünschte Lösung',
    'Welche Teams Telefonie-Lösung passt zu Ihnen?',
    'radio_group',
    '{
      "id": "solution_type",
      "options": [
        {
          "id": "calling_plan_domestic",
          "label": "Calling Plan (National)",
          "description": "Microsoft verwaltet die Telefonie-Infrastruktur. Ideal für nationale Anrufe.",
          "value": "domestic"
        },
        {
          "id": "calling_plan_international",
          "label": "Calling Plan (International)",
          "description": "Microsoft verwaltet die Telefonie-Infrastruktur. Ideal für internationale Anrufe.",
          "value": "international"
        },
        {
          "id": "direct_routing",
          "label": "Direct Routing",
          "description": "Sie nutzen Ihren eigenen Telefonie-Anbieter. Mehr Kontrolle, benötigt SBC.",
          "value": "direct_routing"
        },
        {
          "id": "operator_connect",
          "label": "Operator Connect",
          "description": "Partnerschaft mit einem Telefonie-Operator. Beste Balance aus Kontrolle und Verwaltung.",
          "value": "operator_connect"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    5,
    'Berechnung',
    'Ihre Teams Telefonie Kostenanalyse',
    'result',
    '{
      "showChart": true,
      "showBreakdown": true
    }'::jsonb
  );

-- 2. Microsoft 365 Lizenz-Vergleichsrechner
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'calculator',
    'Microsoft 365 Lizenz-Vergleichsrechner',
    'Vergleichen Sie verschiedene Microsoft 365 Lizenz-Optionen und finden Sie die beste Lösung für Ihr Unternehmen',
    'm365-license-comparison',
    '{
      "wizardMode": true,
      "calculations": [
        {
          "id": "license_cost",
          "formula": "users * licensePrice",
          "dependsOn": ["users", "licensePrice"]
        },
        {
          "id": "volume_discount",
          "formula": "license_cost * volumeDiscountRate",
          "dependsOn": ["license_cost", "volumeDiscountRate"]
        },
        {
          "id": "total_monthly",
          "formula": "license_cost - volume_discount",
          "dependsOn": ["license_cost", "volume_discount"]
        },
        {
          "id": "total_annual",
          "formula": "total_monthly * 12",
          "dependsOn": ["total_monthly"]
        }
      ],
      "outputs": [
        {
          "id": "monthly",
          "label": "Monatliche Kosten",
          "formula": "total_monthly",
          "format": "currency"
        },
        {
          "id": "annual",
          "label": "Jährliche Kosten",
          "formula": "total_annual",
          "format": "currency"
        },
        {
          "id": "per_user",
          "label": "Kosten pro Benutzer/Monat",
          "formula": "total_monthly / users",
          "format": "currency"
        }
      ]
    }'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '10000000-0000-0000-0000-000000000002',
    1,
    'Anzahl Benutzer',
    'Wie viele Lizenzen benötigen Sie?',
    'form',
    '{
      "fields": [
        {
          "id": "users",
          "label": "Anzahl der Benutzer",
          "type": "number",
          "required": true,
          "min": 1,
          "max": 10000,
          "description": "Geben Sie die Anzahl der Mitarbeiter ein, die Microsoft 365 benötigen"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    2,
    'Lizenz-Typ',
    'Welche Microsoft 365 Lizenz möchten Sie vergleichen?',
    'radio_group',
    '{
      "id": "license_type",
      "options": [
        {
          "id": "business_basic",
          "label": "Microsoft 365 Business Basic",
          "description": "5,00 CHF/User/Monat - Exchange, OneDrive, Teams",
          "value": 5.0
        },
        {
          "id": "business_standard",
          "label": "Microsoft 365 Business Standard",
          "description": "10,50 CHF/User/Monat - Alle Basic Features + Office Apps",
          "value": 10.5
        },
        {
          "id": "business_premium",
          "label": "Microsoft 365 Business Premium",
          "description": "20,00 CHF/User/Monat - Alle Standard Features + Security + Device Management",
          "value": 20.0
        },
        {
          "id": "e3",
          "label": "Microsoft 365 E3",
          "description": "32,00 CHF/User/Monat - Enterprise Features + Advanced Security + Compliance",
          "value": 32.0
        },
        {
          "id": "e5",
          "label": "Microsoft 365 E5",
          "description": "52,00 CHF/User/Monat - Alle E3 Features + Advanced Threat Protection + Power BI Pro",
          "value": 52.0
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    3,
    'Zusätzliche Optionen',
    'Benötigen Sie zusätzliche Features?',
    'multi_select',
    '{
      "id": "additional_features",
      "options": [
        {
          "id": "phone_system",
          "label": "Phone System",
          "description": "Teams Telefonie",
          "value": 8.0
        },
        {
          "id": "power_bi",
          "label": "Power BI Pro",
          "description": "Business Intelligence",
          "value": 10.0
        },
        {
          "id": "advanced_security",
          "label": "Advanced Security",
          "description": "Erweiterte Sicherheitsfeatures",
          "value": 5.0
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    4,
    'Ergebnis',
    'Ihre Microsoft 365 Kostenübersicht',
    'result',
    '{
      "showChart": true,
      "showComparison": true
    }'::jsonb
  );

-- 3. IT-Outsourcing ROI Rechner
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'calculator',
    'IT-Outsourcing ROI Rechner',
    'Berechnen Sie den Return on Investment für IT-Outsourcing in Ihrem Unternehmen',
    'it-outsourcing-roi',
    '{
      "wizardMode": true,
      "calculations": [
        {
          "id": "current_internal_cost",
          "formula": "internal_it_staff * avg_salary * 12",
          "dependsOn": ["internal_it_staff", "avg_salary"]
        },
        {
          "id": "current_infrastructure_cost",
          "formula": "infrastructure_monthly * 12",
          "dependsOn": ["infrastructure_monthly"]
        },
        {
          "id": "current_total_cost",
          "formula": "current_internal_cost + current_infrastructure_cost",
          "dependsOn": ["current_internal_cost", "current_infrastructure_cost"]
        },
        {
          "id": "outsourcing_cost",
          "formula": "users * support_tier_price * 12",
          "dependsOn": ["users", "support_tier_price"]
        },
        {
          "id": "savings",
          "formula": "current_total_cost - outsourcing_cost",
          "dependsOn": ["current_total_cost", "outsourcing_cost"]
        },
        {
          "id": "roi",
          "formula": "(savings / current_total_cost) * 100",
          "dependsOn": ["savings", "current_total_cost"]
        },
        {
          "id": "break_even_months",
          "formula": "(migration_cost / savings) * 12",
          "dependsOn": ["migration_cost", "savings"]
        }
      ],
      "outputs": [
        {
          "id": "current_cost",
          "label": "Aktuelle jährliche IT-Kosten",
          "formula": "current_total_cost",
          "format": "currency"
        },
        {
          "id": "outsourcing_cost",
          "label": "Jährliche Outsourcing-Kosten",
          "formula": "outsourcing_cost",
          "format": "currency"
        },
        {
          "id": "savings",
          "label": "Jährliche Ersparnis",
          "formula": "savings",
          "format": "currency"
        },
        {
          "id": "roi",
          "label": "ROI",
          "formula": "roi",
          "format": "percentage"
        },
        {
          "id": "break_even",
          "label": "Break-Even (Monate)",
          "formula": "break_even_months",
          "format": "number",
          "unit": "Monate"
        }
      ]
    }'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '10000000-0000-0000-0000-000000000003',
    1,
    'Aktuelle IT-Situation',
    'Beschreiben Sie Ihre aktuelle IT-Organisation',
    'form',
    '{
      "fields": [
        {
          "id": "users",
          "label": "Anzahl der IT-Benutzer",
          "type": "number",
          "required": true,
          "description": "Wie viele Mitarbeiter nutzen IT-Services?"
        },
        {
          "id": "internal_it_staff",
          "label": "Anzahl interner IT-Mitarbeiter",
          "type": "number",
          "required": true,
          "description": "Wie viele IT-Mitarbeiter beschäftigen Sie intern?"
        },
        {
          "id": "avg_salary",
          "label": "Durchschnittliches Jahresgehalt IT-Mitarbeiter (CHF)",
          "type": "number",
          "required": true,
          "description": "Inkl. Lohnnebenkosten"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    2,
    'Infrastruktur-Kosten',
    'Was zahlen Sie aktuell für IT-Infrastruktur?',
    'form',
    '{
      "fields": [
        {
          "id": "infrastructure_monthly",
          "label": "Monatliche Infrastruktur-Kosten (CHF)",
          "type": "number",
          "required": true,
          "description": "Server, Cloud, Software-Lizenzen, etc."
        },
        {
          "id": "migration_cost",
          "label": "Einmalige Migrationskosten (CHF)",
          "type": "number",
          "required": true,
          "description": "Kosten für den Wechsel zum Outsourcing"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    3,
    'Outsourcing-Anforderungen',
    'Welche Services benötigen Sie?',
    'multi_select',
    '{
      "id": "services",
      "options": [
        {
          "id": "support_tier1",
          "label": "Basis-Support (8x5)",
          "description": "50 CHF/User/Monat",
          "value": 50
        },
        {
          "id": "support_tier2",
          "label": "Erweiterter Support (24x7)",
          "description": "100 CHF/User/Monat",
          "value": 100
        },
        {
          "id": "support_tier3",
          "label": "Premium Support",
          "description": "150 CHF/User/Monat",
          "value": 150
        },
        {
          "id": "security",
          "label": "IT-Security Services",
          "description": "30 CHF/User/Monat",
          "value": 30
        },
        {
          "id": "cloud",
          "label": "Cloud-Management",
          "description": "40 CHF/User/Monat",
          "value": 40
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    4,
    'Service-Level',
    'Welches Service-Level benötigen Sie?',
    'radio_group',
    '{
      "id": "support_tier",
      "options": [
        {
          "id": "tier1",
          "label": "Tier 1: Basis-Support",
          "description": "8x5 Support, Standard-SLA",
          "value": 50
        },
        {
          "id": "tier2",
          "label": "Tier 2: Erweiterter Support",
          "description": "24x7 Support, Premium-SLA",
          "value": 100
        },
        {
          "id": "tier3",
          "label": "Tier 3: Premium Support",
          "description": "24x7 Support, Proaktive Überwachung, Dedicated Account Manager",
          "value": 150
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    5,
    'Ergebnis',
    'Ihr IT-Outsourcing ROI',
    'result',
    '{
      "showChart": true,
      "showTimeline": true
    }'::jsonb
  );

-- 4. Cloud Migration Kostenrechner
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'calculator',
    'Cloud Migration Kostenrechner',
    'Vergleichen Sie On-Premise vs. Cloud-Kosten und berechnen Sie die Einsparungen',
    'cloud-migration-calculator',
    '{
      "wizardMode": true,
      "calculations": [
        {
          "id": "onprem_hardware_cost",
          "formula": "servers * server_cost_per_year",
          "dependsOn": ["servers", "server_cost_per_year"]
        },
        {
          "id": "onprem_maintenance_cost",
          "formula": "onprem_hardware_cost * 0.2",
          "dependsOn": ["onprem_hardware_cost"]
        },
        {
          "id": "onprem_power_cost",
          "formula": "servers * power_cost_per_server * 12",
          "dependsOn": ["servers", "power_cost_per_server"]
        },
        {
          "id": "onprem_total",
          "formula": "onprem_hardware_cost + onprem_maintenance_cost + onprem_power_cost",
          "dependsOn": ["onprem_hardware_cost", "onprem_maintenance_cost", "onprem_power_cost"]
        },
        {
          "id": "cloud_monthly_cost",
          "formula": "servers * cloud_vm_cost",
          "dependsOn": ["servers", "cloud_vm_cost"]
        },
        {
          "id": "cloud_annual_cost",
          "formula": "cloud_monthly_cost * 12",
          "dependsOn": ["cloud_monthly_cost"]
        },
        {
          "id": "migration_cost",
          "formula": "servers * migration_service_cost",
          "dependsOn": ["servers", "migration_service_cost"]
        },
        {
          "id": "first_year_total",
          "formula": "cloud_annual_cost + migration_cost",
          "dependsOn": ["cloud_annual_cost", "migration_cost"]
        },
        {
          "id": "savings_year1",
          "formula": "onprem_total - first_year_total",
          "dependsOn": ["onprem_total", "first_year_total"]
        },
        {
          "id": "savings_year3",
          "formula": "(onprem_total - cloud_annual_cost) * 3 - migration_cost",
          "dependsOn": ["onprem_total", "cloud_annual_cost", "migration_cost"]
        }
      ],
      "outputs": [
        {
          "id": "onprem_cost",
          "label": "Jährliche On-Premise Kosten",
          "formula": "onprem_total",
          "format": "currency"
        },
        {
          "id": "cloud_cost",
          "label": "Jährliche Cloud-Kosten",
          "formula": "cloud_annual_cost",
          "format": "currency"
        },
        {
          "id": "migration",
          "label": "Einmalige Migrationskosten",
          "formula": "migration_cost",
          "format": "currency"
        },
        {
          "id": "savings_y1",
          "label": "Ersparnis Jahr 1",
          "formula": "savings_year1",
          "format": "currency"
        },
        {
          "id": "savings_y3",
          "label": "Ersparnis über 3 Jahre",
          "formula": "savings_year3",
          "format": "currency"
        }
      ]
    }'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '10000000-0000-0000-0000-000000000004',
    1,
    'Server-Infrastruktur',
    'Beschreiben Sie Ihre aktuelle Server-Infrastruktur',
    'form',
    '{
      "fields": [
        {
          "id": "servers",
          "label": "Anzahl der Server",
          "type": "number",
          "required": true,
          "min": 1,
          "max": 1000,
          "description": "Wie viele Server haben Sie aktuell?"
        },
        {
          "id": "server_cost_per_year",
          "label": "Durchschnittliche Server-Kosten pro Jahr (CHF)",
          "type": "number",
          "required": true,
          "description": "Hardware-Kosten amortisiert über 3-5 Jahre"
        },
        {
          "id": "power_cost_per_server",
          "label": "Stromkosten pro Server/Monat (CHF)",
          "type": "number",
          "required": true,
          "description": "Durchschnittliche monatliche Stromkosten"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    2,
    'Cloud-Anbieter',
    'Welchen Cloud-Anbieter möchten Sie nutzen?',
    'radio_group',
    '{
      "id": "cloud_provider",
      "options": [
        {
          "id": "azure",
          "label": "Microsoft Azure",
          "description": "Ab 100 CHF/Server/Monat",
          "value": 100
        },
        {
          "id": "aws",
          "label": "Amazon Web Services (AWS)",
          "description": "Ab 80 CHF/Server/Monat",
          "value": 80
        },
        {
          "id": "google",
          "label": "Google Cloud Platform",
          "description": "Ab 90 CHF/Server/Monat",
          "value": 90
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    3,
    'Server-Größe',
    'Welche Server-Größe benötigen Sie in der Cloud?',
    'radio_group',
    '{
      "id": "server_size",
      "options": [
        {
          "id": "small",
          "label": "Klein (1-4 vCPU)",
          "description": "Für kleine Workloads",
          "value": 1.0
        },
        {
          "id": "medium",
          "label": "Mittel (5-8 vCPU)",
          "description": "Für mittlere Workloads",
          "value": 1.5
        },
        {
          "id": "large",
          "label": "Groß (9-16 vCPU)",
          "description": "Für große Workloads",
          "value": 2.0
        },
        {
          "id": "xlarge",
          "label": "Sehr groß (17+ vCPU)",
          "description": "Für sehr große Workloads",
          "value": 3.0
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    4,
    'Migrations-Services',
    'Benötigen Sie Unterstützung bei der Migration?',
    'form',
    '{
      "fields": [
        {
          "id": "migration_service",
          "label": "Migrations-Service",
          "type": "select",
          "required": true,
          "options": [
            {"value": "self", "label": "Selbst durchführen (CHF 0)"},
            {"value": "basic", "label": "Basis-Support (300 CHF/Server)"},
            {"value": "full", "label": "Vollständiger Service (500 CHF/Server)"}
          ],
          "description": "Wie viel Unterstützung benötigen Sie?"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    5,
    'Zusätzliche Cloud-Services',
    'Welche zusätzlichen Cloud-Services benötigen Sie?',
    'multi_select',
    '{
      "id": "additional_services",
      "options": [
        {
          "id": "backup",
          "label": "Backup & Disaster Recovery",
          "description": "20 CHF/Server/Monat",
          "value": 20
        },
        {
          "id": "monitoring",
          "label": "Monitoring & Logging",
          "description": "15 CHF/Server/Monat",
          "value": 15
        },
        {
          "id": "security",
          "label": "Security Services",
          "description": "25 CHF/Server/Monat",
          "value": 25
        },
        {
          "id": "cdn",
          "label": "Content Delivery Network",
          "description": "10 CHF/Server/Monat",
          "value": 10
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    6,
    'Ergebnis',
    'Ihre Cloud Migration Kostenanalyse',
    'result',
    '{
      "showChart": true,
      "showComparison": true,
      "showTimeline": true
    }'::jsonb
  );

-- 5. IT-Security Audit Kosten/Nutzen Rechner
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'calculator',
    'IT-Security Audit Kosten/Nutzen Rechner',
    'Berechnen Sie die Kosten und den Nutzen eines IT-Security Audits',
    'security-audit-calculator',
    '{
      "wizardMode": true,
      "calculations": [
        {
          "id": "audit_cost",
          "formula": "base_audit_cost + (users * per_user_cost)",
          "dependsOn": ["base_audit_cost", "users", "per_user_cost"]
        },
        {
          "id": "risk_score",
          "formula": "vulnerabilities * 10 + compliance_issues * 5",
          "dependsOn": ["vulnerabilities", "compliance_issues"]
        },
        {
          "id": "potential_loss",
          "formula": "risk_score * 1000",
          "dependsOn": ["risk_score"]
        },
        {
          "id": "roi",
          "formula": "((potential_loss - audit_cost) / audit_cost) * 100",
          "dependsOn": ["potential_loss", "audit_cost"]
        }
      ],
      "outputs": [
        {
          "id": "audit_cost",
          "label": "Audit-Kosten",
          "formula": "audit_cost",
          "format": "currency"
        },
        {
          "id": "risk",
          "label": "Risiko-Score",
          "formula": "risk_score",
          "format": "number"
        },
        {
          "id": "potential_loss",
          "label": "Potentieller Schaden",
          "formula": "potential_loss",
          "format": "currency"
        },
        {
          "id": "roi",
          "label": "ROI",
          "formula": "roi",
          "format": "percentage"
        }
      ]
    }'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '10000000-0000-0000-0000-000000000005',
    1,
    'Unternehmensgröße',
    'Geben Sie uns Informationen über Ihr Unternehmen',
    'form',
    '{
      "fields": [
        {
          "id": "users",
          "label": "Anzahl der Benutzer",
          "type": "number",
          "required": true,
          "description": "Wie viele Mitarbeiter haben Zugriff auf IT-Systeme?"
        },
        {
          "id": "servers",
          "label": "Anzahl der Server",
          "type": "number",
          "required": true,
          "description": "Wie viele Server betreiben Sie?"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    2,
    'Aktuelle Sicherheitslage',
    'Wie schätzen Sie Ihre aktuelle IT-Sicherheit ein?',
    'form',
    '{
      "fields": [
        {
          "id": "vulnerabilities",
          "label": "Bekannte Sicherheitslücken",
          "type": "slider",
          "min": 0,
          "max": 50,
          "step": 1,
          "description": "Wie viele bekannte Sicherheitslücken haben Sie?"
        },
        {
          "id": "compliance_issues",
          "label": "Compliance-Probleme",
          "type": "slider",
          "min": 0,
          "max": 20,
          "step": 1,
          "description": "Wie viele Compliance-Probleme sind bekannt?"
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    3,
    'Audit-Typ',
    'Welches Audit benötigen Sie?',
    'radio_group',
    '{
      "id": "audit_type",
      "options": [
        {
          "id": "basic",
          "label": "Basis-Audit",
          "description": "CHF 5000 + 10 CHF/User",
          "baseCost": 5000,
          "perUserCost": 10
        },
        {
          "id": "standard",
          "label": "Standard-Audit",
          "description": "CHF 10000 + 20 CHF/User",
          "baseCost": 10000,
          "perUserCost": 20
        },
        {
          "id": "premium",
          "label": "Premium-Audit",
          "description": "CHF 20000 + 30 CHF/User",
          "baseCost": 20000,
          "perUserCost": 30
        }
      ]
    }'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    4,
    'Ergebnis',
    'Ihre Security Audit Analyse',
    'result',
    '{
      "showChart": true,
      "showRiskMatrix": true
    }'::jsonb
  );

-- ============================================================================
-- CHECKLISTEN
-- ============================================================================

-- 1. Teams Telefonie Readiness Checkliste (erweitert)
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'checklist',
    'Teams-Telefonie Readiness Checkliste',
    'Prüfen Sie, ob Sie bereit für Microsoft Teams Telefonie sind',
    'teams-telefonie-checkliste',
    '{"threshold": 70, "belowThresholdAction": "ebook", "aboveThresholdAction": "contact"}'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    1,
    'Infrastruktur',
    'Haben Sie die notwendige Infrastruktur?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q1", "text": "Stabile Internetverbindung mit mindestens 1 Mbit/s pro Benutzer vorhanden?", "weight": 15},
        {"id": "q2", "text": "Moderne Endgeräte (Windows 10/11, macOS, iOS, Android) vorhanden?", "weight": 10},
        {"id": "q3", "text": "Firewall für SIP-Traffic konfiguriert?", "weight": 10},
        {"id": "q4", "text": "QoS (Quality of Service) für Voice-Traffic eingerichtet?", "weight": 10},
        {"id": "q5", "text": "Redundante Internetverbindung vorhanden?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000001',
    2,
    'Lizenzen',
    'Sind die notwendigen Lizenzen vorhanden?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q6", "text": "Microsoft 365 Lizenzen vorhanden?", "weight": 15},
        {"id": "q7", "text": "Phone System Lizenzen geplant oder vorhanden?", "weight": 15},
        {"id": "q8", "text": "Calling Plan oder Direct Routing geplant?", "weight": 10},
        {"id": "q9", "text": "Audio Conferencing Lizenzen für Konferenzen vorhanden?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000001',
    3,
    'Organisation',
    'Ist Ihre Organisation bereit?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q10", "text": "IT-Team ist mit Teams vertraut?", "weight": 10},
        {"id": "q11", "text": "Schulungsplan für Endbenutzer vorhanden?", "weight": 10},
        {"id": "q12", "text": "Change Management Prozess definiert?", "weight": 5},
        {"id": "q13", "text": "Support-Struktur für Teams Telefonie eingerichtet?", "weight": 5}
      ]
    }'::jsonb
  );

-- 2. IT-Security Audit Checkliste
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'checklist',
    'IT-Security Audit Checkliste',
    'Prüfen Sie Ihre IT-Sicherheit anhand von 20 kritischen Punkten',
    'it-security-audit-checklist',
    '{"threshold": 75, "belowThresholdAction": "ebook", "aboveThresholdAction": "contact"}'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '20000000-0000-0000-0000-000000000002',
    1,
    'Zugriffskontrolle',
    'Wie sicher ist Ihr Zugriffsschutz?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q1", "text": "Multi-Faktor-Authentifizierung (MFA) für alle Benutzer aktiviert?", "weight": 15},
        {"id": "q2", "text": "Passwort-Richtlinien (Komplexität, Länge, Ablauf) implementiert?", "weight": 10},
        {"id": "q3", "text": "Privileged Access Management (PAM) für Admin-Accounts?", "weight": 10},
        {"id": "q4", "text": "Regelmäßige Zugriffsreviews durchgeführt?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    2,
    'Netzwerk-Sicherheit',
    'Ist Ihr Netzwerk geschützt?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q5", "text": "Firewall-Regeln aktuell und dokumentiert?", "weight": 10},
        {"id": "q6", "text": "VPN für Remote-Zugriff mit MFA?", "weight": 10},
        {"id": "q7", "text": "Netzwerk-Segmentierung implementiert?", "weight": 10},
        {"id": "q8", "text": "Intrusion Detection/Prevention System (IDS/IPS) aktiv?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    3,
    'Endpoint-Sicherheit',
    'Sind Ihre Endgeräte geschützt?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q9", "text": "Antivirus/Anti-Malware auf allen Endgeräten?", "weight": 10},
        {"id": "q10", "text": "Endpoint Detection and Response (EDR) Lösung?", "weight": 10},
        {"id": "q11", "text": "Device Encryption aktiviert?", "weight": 5},
        {"id": "q12", "text": "Mobile Device Management (MDM) für mobile Geräte?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    4,
    'Daten-Sicherheit',
    'Wie schützen Sie Ihre Daten?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q13", "text": "Regelmäßige Backups mit Test-Wiederherstellung?", "weight": 10},
        {"id": "q14", "text": "Datenverschlüsselung (at rest und in transit)?", "weight": 10},
        {"id": "q15", "text": "Data Loss Prevention (DLP) Lösung?", "weight": 5},
        {"id": "q16", "text": "Klassifizierung sensibler Daten?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    5,
    'Compliance & Governance',
    'Erfüllen Sie Compliance-Anforderungen?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q17", "text": "DSGVO-konforme Datenverarbeitung?", "weight": 10},
        {"id": "q18", "text": "Security Awareness Training für Mitarbeiter?", "weight": 5},
        {"id": "q19", "text": "Incident Response Plan vorhanden und getestet?", "weight": 5},
        {"id": "q20", "text": "Regelmäßige Security Audits durchgeführt?", "weight": 5}
      ]
    }'::jsonb
  );

-- 3. DSGVO-Compliance Check
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'checklist',
    'DSGVO-Compliance Check',
    'Prüfen Sie Ihre DSGVO-Compliance in 15 kritischen Bereichen',
    'dsgvo-compliance-check',
    '{"threshold": 80, "belowThresholdAction": "ebook", "aboveThresholdAction": "contact"}'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '20000000-0000-0000-0000-000000000003',
    1,
    'Datenverarbeitung',
    'Wie verarbeiten Sie personenbezogene Daten?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q1", "text": "Verzeichnis der Verarbeitungstätigkeiten (Art. 30 DSGVO) geführt?", "weight": 15},
        {"id": "q2", "text": "Rechtmäßigkeit der Datenverarbeitung dokumentiert?", "weight": 15},
        {"id": "q3", "text": "Zweckbindung der Datenverarbeitung definiert?", "weight": 10},
        {"id": "q4", "text": "Datenminimierung praktiziert?", "weight": 10}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    2,
    'Betroffenenrechte',
    'Können Betroffene ihre Rechte wahrnehmen?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q5", "text": "Prozess für Auskunftsersuchen (Art. 15 DSGVO) etabliert?", "weight": 10},
        {"id": "q6", "text": "Löschungsprozess (Art. 17 DSGVO) implementiert?", "weight": 10},
        {"id": "q7", "text": "Widerspruchsrecht (Art. 21 DSGVO) umgesetzt?", "weight": 5},
        {"id": "q8", "text": "Datenübertragbarkeit (Art. 20 DSGVO) gewährleistet?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    3,
    'Technische Maßnahmen',
    'Welche technischen Maßnahmen haben Sie implementiert?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q9", "text": "Verschlüsselung personenbezogener Daten?", "weight": 10},
        {"id": "q10", "text": "Zugriffskontrollen und Berechtigungskonzept?", "weight": 10},
        {"id": "q11", "text": "Pseudonymisierung wo möglich?", "weight": 5},
        {"id": "q12", "text": "Regelmäßige Sicherheitstests?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    4,
    'Organisatorische Maßnahmen',
    'Welche organisatorischen Maßnahmen haben Sie?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q13", "text": "Datenschutzbeauftragter benannt (falls erforderlich)?", "weight": 10},
        {"id": "q14", "text": "Mitarbeiterschulungen zum Datenschutz?", "weight": 5},
        {"id": "q15", "text": "Verträge zur Auftragsverarbeitung (Art. 28 DSGVO) vorhanden?", "weight": 5}
      ]
    }'::jsonb
  );

-- 4. Cloud-Readiness Assessment
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'checklist',
    'Cloud-Readiness Assessment',
    'Prüfen Sie, ob Ihr Unternehmen bereit für die Cloud-Migration ist',
    'cloud-readiness-assessment',
    '{"threshold": 70, "belowThresholdAction": "ebook", "aboveThresholdAction": "contact"}'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '20000000-0000-0000-0000-000000000004',
    1,
    'Technische Voraussetzungen',
    'Sind Sie technisch bereit für die Cloud?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q1", "text": "Stabile Internetverbindung mit ausreichender Bandbreite?", "weight": 15},
        {"id": "q2", "text": "Virtualisierte oder containerisierte Anwendungen?", "weight": 10},
        {"id": "q3", "text": "Moderne, cloud-fähige Anwendungen?", "weight": 10},
        {"id": "q4", "text": "API-fähige Systeme?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    2,
    'Sicherheit & Compliance',
    'Erfüllen Sie Cloud-Sicherheitsanforderungen?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q5", "text": "Datenverschlüsselung implementiert?", "weight": 15},
        {"id": "q6", "text": "Compliance-Anforderungen für Cloud definiert?", "weight": 10},
        {"id": "q7", "text": "Identity & Access Management (IAM) Lösung?", "weight": 10},
        {"id": "q8", "text": "Security Monitoring und Logging?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    3,
    'Organisation & Prozesse',
    'Ist Ihre Organisation cloud-ready?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q9", "text": "Cloud-Strategie definiert?", "weight": 10},
        {"id": "q10", "text": "IT-Team mit Cloud-Expertise?", "weight": 10},
        {"id": "q11", "text": "Change Management Prozess?", "weight": 5},
        {"id": "q12", "text": "Budget für Cloud-Migration vorhanden?", "weight": 5}
      ]
    }'::jsonb
  );

-- 5. Microsoft 365 Einführung Checkliste
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '20000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'checklist',
    'Microsoft 365 Einführung Checkliste',
    'Sicherstellen einer erfolgreichen Microsoft 365 Einführung',
    'm365-rollout-checklist',
    '{"threshold": 75, "belowThresholdAction": "ebook", "aboveThresholdAction": "contact"}'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '20000000-0000-0000-0000-000000000005',
    1,
    'Planung',
    'Haben Sie alles geplant?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q1", "text": "Microsoft 365 Tenant eingerichtet?", "weight": 15},
        {"id": "q2", "text": "Lizenz-Bedarf ermittelt?", "weight": 10},
        {"id": "q3", "text": "Migrations-Strategie definiert?", "weight": 10},
        {"id": "q4", "text": "Projekt-Timeline erstellt?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    2,
    'Konfiguration',
    'Ist alles konfiguriert?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q5", "text": "Benutzer und Gruppen synchronisiert?", "weight": 15},
        {"id": "q6", "text": "E-Mail-Migration geplant/durchgeführt?", "weight": 10},
        {"id": "q7", "text": "Sicherheitsrichtlinien konfiguriert?", "weight": 10},
        {"id": "q8", "text": "Compliance-Richtlinien eingerichtet?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    3,
    'Schulung & Support',
    'Sind Benutzer vorbereitet?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q9", "text": "Schulungsplan für Endbenutzer?", "weight": 10},
        {"id": "q10", "text": "Support-Struktur eingerichtet?", "weight": 10},
        {"id": "q11", "text": "Dokumentation erstellt?", "weight": 5},
        {"id": "q12", "text": "Feedback-Mechanismus etabliert?", "weight": 5}
      ]
    }'::jsonb
  );

-- 6. Remote Work Readiness
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'checklist',
    'Remote Work Readiness Checkliste',
    'Prüfen Sie, ob Ihr Unternehmen bereit für Remote Work ist',
    'remote-work-readiness',
    '{"threshold": 70, "belowThresholdAction": "ebook", "aboveThresholdAction": "contact"}'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '20000000-0000-0000-0000-000000000006',
    1,
    'Technologie',
    'Haben Sie die notwendige Technologie?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q1", "text": "VPN oder Zero-Trust Lösung für Remote-Zugriff?", "weight": 15},
        {"id": "q2", "text": "Collaboration Tools (Teams, Zoom, etc.)?", "weight": 15},
        {"id": "q3", "text": "Cloud-basierte Datei-Freigabe?", "weight": 10},
        {"id": "q4", "text": "Mobile Device Management (MDM)?", "weight": 10}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    2,
    'Sicherheit',
    'Ist Remote Work sicher?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q5", "text": "Multi-Faktor-Authentifizierung (MFA)?", "weight": 15},
        {"id": "q6", "text": "Endpoint Security auf allen Geräten?", "weight": 10},
        {"id": "q7", "text": "Datenverschlüsselung?", "weight": 10},
        {"id": "q8", "text": "Security Awareness Training?", "weight": 5}
      ]
    }'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    3,
    'Prozesse',
    'Sind Ihre Prozesse remote-ready?',
    'checkbox_group',
    '{
      "questions": [
        {"id": "q9", "text": "Remote Work Policy definiert?", "weight": 10},
        {"id": "q10", "text": "Kommunikationsrichtlinien?", "weight": 10},
        {"id": "q11", "text": "Performance Management für Remote Teams?", "weight": 5},
        {"id": "q12", "text": "Work-Life-Balance Maßnahmen?", "weight": 5}
      ]
    }'::jsonb
  );

-- ============================================================================
-- QUIZZES
-- ============================================================================

-- 1. Digitalisierungsgrad Assessment
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'quiz',
    'Digitalisierungsgrad Assessment',
    'Ermitteln Sie den Digitalisierungsgrad Ihres Unternehmens',
    'digitalization-assessment',
    '{
      "scoring": {
        "low": {"min": 0, "max": 40, "message": "Ihr Unternehmen hat noch viel Potenzial für Digitalisierung"},
        "medium": {"min": 41, "max": 70, "message": "Sie sind auf einem guten Weg"},
        "high": {"min": 71, "max": 100, "message": "Ihr Unternehmen ist sehr digitalisiert"}
      }
    }'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    1,
    'IT-Infrastruktur',
    'Wie digitalisiert ist Ihre IT-Infrastruktur?',
    'radio_group',
    '{
      "id": "infrastructure",
      "options": [
        {"id": "low", "label": "Meist On-Premise, wenig Cloud", "value": 10},
        {"id": "medium", "label": "Hybrid (On-Premise + Cloud)", "value": 30},
        {"id": "high", "label": "Meist Cloud-basiert", "value": 50}
      ]
    }'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000001',
    2,
    'Prozess-Automatisierung',
    'Wie automatisiert sind Ihre Geschäftsprozesse?',
    'radio_group',
    '{
      "id": "automation",
      "options": [
        {"id": "low", "label": "Wenig automatisiert, viel manuell", "value": 10},
        {"id": "medium", "label": "Teilweise automatisiert", "value": 30},
        {"id": "high", "label": "Stark automatisiert", "value": 50}
      ]
    }'::jsonb
  );

-- 2. IT-Security Wissenstest
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'quiz',
    'IT-Security Wissenstest',
    'Testen Sie Ihr Wissen über IT-Sicherheit',
    'it-security-quiz',
    '{
      "scoring": {
        "low": {"min": 0, "max": 50, "message": "Es gibt noch viel zu lernen über IT-Sicherheit"},
        "medium": {"min": 51, "max": 80, "message": "Gutes Grundwissen vorhanden"},
        "high": {"min": 81, "max": 100, "message": "Exzellentes IT-Security Wissen"}
      }
    }'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '30000000-0000-0000-0000-000000000002',
    1,
    'Grundlagen',
    'Fragen zu IT-Security Grundlagen',
    'radio_group',
    '{
      "id": "basics",
      "options": [
        {"id": "correct1", "label": "MFA erhöht die Sicherheit erheblich", "value": 25},
        {"id": "wrong1", "label": "Ein starkes Passwort reicht aus", "value": 0}
      ]
    }'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    2,
    'Best Practices',
    'Was sind IT-Security Best Practices?',
    'multi_select',
    '{
      "id": "best_practices",
      "options": [
        {"id": "mfa", "label": "Multi-Faktor-Authentifizierung", "value": 25},
        {"id": "updates", "label": "Regelmäßige Updates", "value": 25},
        {"id": "training", "label": "Security Awareness Training", "value": 25},
        {"id": "monitoring", "label": "Security Monitoring", "value": 25}
      ]
    }'::jsonb
  );

-- 3. Cloud-Strategie Quiz
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'quiz',
    'Cloud-Strategie Quiz',
    'Finden Sie heraus, welche Cloud-Strategie zu Ihnen passt',
    'cloud-strategy-quiz',
    '{
      "scoring": {
        "iaas": {"message": "Infrastructure as a Service (IaaS) passt zu Ihnen"},
        "paas": {"message": "Platform as a Service (PaaS) passt zu Ihnen"},
        "saas": {"message": "Software as a Service (SaaS) passt zu Ihnen"}
      }
    }'::jsonb
  );

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
  (
    '30000000-0000-0000-0000-000000000003',
    1,
    'Anforderungen',
    'Was sind Ihre Hauptanforderungen?',
    'multi_select',
    '{
      "id": "requirements",
      "options": [
        {"id": "control", "label": "Vollständige Kontrolle", "value": "iaas"},
        {"id": "development", "label": "Anwendungsentwicklung", "value": "paas"},
        {"id": "simplicity", "label": "Einfachheit", "value": "saas"}
      ]
    }'::jsonb
  );

-- ============================================================================
-- EBOOKS
-- ============================================================================

-- 1. IT-Frust bei Dienstleisterwechsel (bestehend, erweitert)
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'ebook',
    'IT-Frust bei Dienstleisterwechsel',
    'Ein umfassender Guide zum erfolgreichen Wechsel des IT-Dienstleisters',
    'it-frust-dienstleisterwechsel',
    '{"requireContactInfo": true, "emailDelivery": true, "instantDownload": false}'::jsonb
  );

-- 2. Teams Telefonie Readiness Guide (bestehend)
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'ebook',
    'Teams-Telefonie Readiness Guide',
    'Alles was Sie über die Einführung von Teams Telefonie wissen müssen',
    'teams-telefonie-readiness-guide',
    '{"requireContactInfo": true, "emailDelivery": true, "instantDownload": false}'::jsonb
  );

-- 3. Teams Telephony Deep Dive Guide
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'ebook',
    'Teams Telephony Deep Dive Guide',
    'Der ultimative Guide für Microsoft Teams Telefonie - Von der Planung bis zur Implementierung',
    'teams-telephony-deep-dive',
    '{"requireContactInfo": true, "emailDelivery": true, "instantDownload": false}'::jsonb
  );

-- 4. IT-Security Leitfaden
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '40000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'ebook',
    'IT-Security Leitfaden',
    'Umfassender Leitfaden zur IT-Sicherheit für kleine und mittlere Unternehmen',
    'it-security-guide',
    '{"requireContactInfo": true, "emailDelivery": true, "instantDownload": false}'::jsonb
  );

-- 5. Cloud Migration Playbook
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '40000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'ebook',
    'Cloud Migration Playbook',
    'Schritt-für-Schritt Anleitung für eine erfolgreiche Cloud-Migration',
    'cloud-migration-playbook',
    '{"requireContactInfo": true, "emailDelivery": true, "instantDownload": false}'::jsonb
  );

-- 6. Microsoft 365 Best Practices
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
  (
    '40000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'ebook',
    'Microsoft 365 Best Practices',
    'Best Practices für die erfolgreiche Nutzung von Microsoft 365',
    'm365-best-practices',
    '{"requireContactInfo": true, "emailDelivery": true, "instantDownload": false}'::jsonb
  );

-- ============================================================================
-- E-MAIL TEMPLATES
-- ============================================================================

INSERT INTO email_templates (tenant_id, name, subject, body_html, body_text) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Kalkulator-Ergebnis Follow-up',
    'Ihr {{calculator_name}} Ergebnis - Nächste Schritte',
    '<h1>Vielen Dank für die Nutzung unseres {{calculator_name}}!</h1><p>Basierend auf Ihren Angaben haben wir folgende Ergebnisse berechnet:</p><ul>{{results}}</ul><p>Möchten Sie mehr erfahren? Kontaktieren Sie uns für eine individuelle Beratung.</p>',
    'Vielen Dank für die Nutzung unseres {{calculator_name}}! Basierend auf Ihren Angaben haben wir folgende Ergebnisse berechnet: {{results}} Möchten Sie mehr erfahren? Kontaktieren Sie uns für eine individuelle Beratung.'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Checklisten-Auswertung',
    'Ihre {{checklist_name}} Auswertung',
    '<h1>Ihre Checklisten-Auswertung</h1><p>Sie haben {{score}}% der Punkte erreicht.</p><p>{{message}}</p><p>Möchten Sie Ihre IT-Situation verbessern? Wir helfen Ihnen gerne!</p>',
    'Ihre Checklisten-Auswertung: Sie haben {{score}}% der Punkte erreicht. {{message}} Möchten Sie Ihre IT-Situation verbessern? Wir helfen Ihnen gerne!'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Lead-Nurturing 1',
    'Willkommen bei LeftClick',
    '<h1>Willkommen bei LeftClick!</h1><p>Vielen Dank für Ihr Interesse. Wir freuen uns, Ihnen bei Ihren IT-Herausforderungen zu helfen.</p>',
    'Willkommen bei LeftClick! Vielen Dank für Ihr Interesse.'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Lead-Nurturing 2',
    '5 Tipps für bessere IT-Sicherheit',
    '<h1>5 Tipps für bessere IT-Sicherheit</h1><ol><li>Multi-Faktor-Authentifizierung aktivieren</li><li>Regelmäßige Updates durchführen</li><li>Security Awareness Training</li><li>Backup-Strategie implementieren</li><li>Security Monitoring einrichten</li></ol>',
    '5 Tipps für bessere IT-Sicherheit: 1. Multi-Faktor-Authentifizierung aktivieren 2. Regelmäßige Updates durchführen 3. Security Awareness Training 4. Backup-Strategie implementieren 5. Security Monitoring einrichten'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Lead-Nurturing 3',
    'Microsoft Teams Telefonie - Was Sie wissen müssen',
    '<h1>Microsoft Teams Telefonie</h1><p>Erfahren Sie, wie Teams Telefonie Ihr Unternehmen transformieren kann.</p>',
    'Microsoft Teams Telefonie: Erfahren Sie, wie Teams Telefonie Ihr Unternehmen transformieren kann.'
  );

-- ============================================================================
-- DEMO SUBMISSIONS (für Analytics)
-- ============================================================================

-- Beispiel-Submissions für verschiedene Lead Magnets
-- Hinweis: In einer echten Anwendung würden diese über die Anwendung erstellt
-- Hier erstellen wir einige Demo-Daten für Analytics-Zwecke

-- Submission für Teams Telephony Calculator
INSERT INTO submissions (lead_magnet_id, tenant_id, session_id, status, data, result, contact_info) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'demo-session-001',
    'completed',
    '{"users": 50, "locations": 2, "solution_type": "calling_plan_domestic"}'::jsonb,
    '{"monthly_cost": 1000, "annual_cost": 12000, "savings": 1500, "roi": 15}'::jsonb,
    '{"email": "demo1@example.com", "name": "Max Mustermann"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'demo-session-002',
    'completed',
    '{"users": 100, "locations": 5, "solution_type": "direct_routing"}'::jsonb,
    '{"monthly_cost": 2000, "annual_cost": 24000, "savings": 3000, "roi": 12.5}'::jsonb,
    '{"email": "demo2@example.com", "name": "Anna Schmidt"}'::jsonb
  );

-- Weitere Demo-Submissions können hier hinzugefügt werden
-- Für 50+ Submissions würde man typischerweise ein Script verwenden
