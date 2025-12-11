-- ============================================================================
-- WEITERE KALKULATOREN - Teil 2
-- Netzwerk, Cloud, Drucken, KI, Branchenspezifisch
-- ============================================================================

-- ============================================================================
-- 21. WIFI 6 UPGRADE ROI RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'WiFi 6 Upgrade ROI Rechner',
  'Lohnt sich das Upgrade auf WiFi 6/6E? Berechnen Sie die Vorteile',
  'wifi6-upgrade-roi',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_ap_wifi5", "name": "WiFi 5 Access Point", "variableName": "wifi5AP", "value": 300, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_ap_wifi6", "name": "WiFi 6 Access Point", "variableName": "wifi6AP", "value": 500, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_productivity", "name": "Produktivitätsgewinn", "variableName": "productivityGain", "value": 0.05, "unit": "Prozent", "category": "Nutzen"},
      {"id": "pv_hourly_cost", "name": "Stundenlohn", "variableName": "hourlyCost", "value": 50, "unit": "CHF", "category": "Personal"}
    ],
    "calculations": [
      {"id": "upgrade_cost", "formula": "accessPoints * (wifi6AP - wifi5AP)", "label": "Upgrade-Kosten"},
      {"id": "speed_improvement", "formula": "accessPoints * 3", "label": "Geschwindigkeitsfaktor"},
      {"id": "annual_productivity", "formula": "employees * hourlyCost * 2080 * productivityGain", "label": "Jährlicher Produktivitätsgewinn"},
      {"id": "payback_months", "formula": "upgrade_cost / (annual_productivity / 12)", "label": "Amortisation"},
      {"id": "roi_3years", "formula": "((annual_productivity * 3) - upgrade_cost) / upgrade_cost * 100", "label": "ROI 3 Jahre"}
    ],
    "outputs": [
      {"id": "out_cost", "label": "Investition", "formula": "upgrade_cost", "format": "currency"},
      {"id": "out_productivity", "label": "Jährliche Produktivitätssteigerung", "formula": "annual_productivity", "format": "currency", "color": "green"},
      {"id": "out_payback", "label": "Amortisation", "formula": "payback_months", "format": "number", "unit": "Monate"},
      {"id": "out_roi", "label": "ROI über 3 Jahre", "formula": "roi_3years", "format": "percentage", "highlight": true}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000021', 1, 'Aktuelle Infrastruktur', 'Ihre WLAN-Situation', 'form', '{
  "fields": [
    {"id": "accessPoints", "label": "Anzahl Access Points", "type": "number", "required": true, "variableName": "accessPoints"},
    {"id": "employees", "label": "Anzahl WLAN-Nutzer", "type": "number", "required": true, "variableName": "employees"},
    {"id": "currentStandard", "label": "Aktueller WLAN-Standard", "type": "select", "variableName": "currentStandard", "options": [{"value": "wifi4", "label": "WiFi 4 (802.11n)"}, {"value": "wifi5", "label": "WiFi 5 (802.11ac)"}, {"value": "mixed", "label": "Gemischt"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000021', 2, 'Ergebnis', 'Ihr WiFi 6 Upgrade ROI', 'result', '{"showChart": true, "ctaText": "WLAN-Beratung", "ctaDescription": "Kostenlose WLAN-Analyse vor Ort"}'::jsonb);

-- ============================================================================
-- 22. MANAGED PRINT SERVICES SPARRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Managed Print Services Sparrechner',
  'Wie viel können Sie durch optimiertes Drucken sparen?',
  'managed-print-sparrechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_page_cost", "name": "Kosten pro Seite (intern)", "variableName": "internalPageCost", "value": 0.08, "unit": "CHF", "category": "Drucken"},
      {"id": "pv_mps_cost", "name": "MPS Kosten pro Seite", "variableName": "mpsPageCost", "value": 0.04, "unit": "CHF", "category": "MPS"},
      {"id": "pv_printer_maint", "name": "Wartung pro Drucker/Jahr", "variableName": "printerMaint", "value": 200, "unit": "CHF", "category": "Wartung"},
      {"id": "pv_it_hours", "name": "IT-Stunden für Drucker/Jahr", "variableName": "itHoursPerPrinter", "value": 10, "unit": "Stunden", "category": "IT"},
      {"id": "pv_it_rate", "name": "IT-Stundensatz", "variableName": "itRate", "value": 120, "unit": "CHF", "category": "IT"}
    ],
    "calculations": [
      {"id": "current_print_cost", "formula": "monthlyPages * internalPageCost * 12", "label": "Aktuelle Druckkosten"},
      {"id": "current_maint_cost", "formula": "printers * printerMaint", "label": "Wartungskosten"},
      {"id": "current_it_cost", "formula": "printers * itHoursPerPrinter * itRate", "label": "IT-Kosten"},
      {"id": "current_total", "formula": "current_print_cost + current_maint_cost + current_it_cost", "label": "Aktuelle Gesamtkosten"},
      {"id": "mps_cost", "formula": "monthlyPages * mpsPageCost * 12", "label": "MPS Kosten"},
      {"id": "savings", "formula": "current_total - mps_cost", "label": "Jährliche Ersparnis"},
      {"id": "savings_percent", "formula": "(savings / current_total) * 100", "label": "Ersparnis in %"}
    ],
    "outputs": [
      {"id": "out_current", "label": "Aktuelle Druckkosten/Jahr", "formula": "current_total", "format": "currency"},
      {"id": "out_mps", "label": "MPS Kosten/Jahr", "formula": "mps_cost", "format": "currency"},
      {"id": "out_savings", "label": "Jährliche Ersparnis", "formula": "savings", "format": "currency", "highlight": true, "color": "green"},
      {"id": "out_percent", "label": "Ersparnis", "formula": "savings_percent", "format": "percentage"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000022', 1, 'Druckumgebung', 'Ihre aktuelle Situation', 'form', '{
  "fields": [
    {"id": "printers", "label": "Anzahl Drucker/Multifunktionsgeräte", "type": "number", "required": true, "variableName": "printers"},
    {"id": "monthlyPages", "label": "Gedruckte Seiten pro Monat", "type": "number", "required": true, "variableName": "monthlyPages", "placeholder": "z.B. 10000"},
    {"id": "colorRatio", "label": "Anteil Farbdrucke", "type": "select", "variableName": "colorRatio", "options": [{"value": "10", "label": "10%"}, {"value": "25", "label": "25%"}, {"value": "50", "label": "50%"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000022', 2, 'Ergebnis', 'Ihr MPS-Sparpotenzial', 'result', '{"showChart": true, "ctaText": "Druckkosten-Analyse", "ctaDescription": "Kostenlose Analyse Ihrer Druckumgebung"}'::jsonb);

-- ============================================================================
-- 23. KI-AUTOMATISIERUNG ROI RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000023',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'KI-Automatisierung ROI Rechner',
  'Berechnen Sie das Einsparpotenzial durch KI-gestützte Automatisierung',
  'ki-automatisierung-roi',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_copilot", "name": "Microsoft Copilot", "variableName": "copilotPrice", "value": 30, "unit": "CHF/User/Monat", "category": "KI-Tools"},
      {"id": "pv_chatgpt", "name": "ChatGPT Enterprise", "variableName": "chatgptPrice", "value": 25, "unit": "CHF/User/Monat", "category": "KI-Tools"},
      {"id": "pv_time_savings", "name": "Zeitersparnis", "variableName": "timeSavings", "value": 0.1, "unit": "Prozent", "category": "Produktivität"},
      {"id": "pv_hourly_rate", "name": "Durchschn. Stundenlohn", "variableName": "hourlyRate", "value": 60, "unit": "CHF", "category": "Personal"}
    ],
    "calculations": [
      {"id": "ai_cost_annual", "formula": "users * copilotPrice * 12", "label": "KI-Tool Kosten"},
      {"id": "hours_saved", "formula": "users * 2080 * timeSavings", "label": "Eingesparte Stunden"},
      {"id": "productivity_value", "formula": "hours_saved * hourlyRate", "label": "Produktivitätswert"},
      {"id": "net_benefit", "formula": "productivity_value - ai_cost_annual", "label": "Netto-Nutzen"},
      {"id": "roi", "formula": "(net_benefit / ai_cost_annual) * 100", "label": "ROI"}
    ],
    "outputs": [
      {"id": "out_cost", "label": "Jährliche KI-Tool Kosten", "formula": "ai_cost_annual", "format": "currency"},
      {"id": "out_hours", "label": "Eingesparte Stunden/Jahr", "formula": "hours_saved", "format": "number"},
      {"id": "out_value", "label": "Wert der Zeiteinsparung", "formula": "productivity_value", "format": "currency"},
      {"id": "out_net", "label": "Netto-Nutzen", "formula": "net_benefit", "format": "currency", "highlight": true, "color": "green"},
      {"id": "out_roi", "label": "ROI", "formula": "roi", "format": "percentage"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000023', 1, 'Team-Grösse', 'Wer soll KI nutzen?', 'form', '{
  "fields": [
    {"id": "users", "label": "Anzahl KI-Nutzer", "type": "number", "required": true, "variableName": "users"},
    {"id": "department", "label": "Hauptabteilung", "type": "select", "variableName": "department", "options": [{"value": "admin", "label": "Administration"}, {"value": "sales", "label": "Vertrieb"}, {"value": "marketing", "label": "Marketing"}, {"value": "support", "label": "Kundendienst"}, {"value": "dev", "label": "Entwicklung"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000023', 2, 'KI-Tool wählen', 'Welches KI-Tool?', 'radio_group', '{
  "id": "aiTool",
  "variableName": "aiTool",
  "options": [
    {"id": "copilot", "label": "Microsoft Copilot", "description": "CHF 30/User/Monat - Integriert in M365", "value": 30},
    {"id": "chatgpt", "label": "ChatGPT Enterprise", "description": "CHF 25/User/Monat - Vielseitig", "value": 25},
    {"id": "both", "label": "Kombination", "description": "Beide Tools für maximale Produktivität", "value": 55}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000023', 3, 'Ergebnis', 'Ihr KI-Automatisierung ROI', 'result', '{"showChart": true, "ctaText": "KI-Workshop buchen", "ctaDescription": "Entdecken Sie das KI-Potenzial für Ihr Unternehmen"}'::jsonb);

-- ============================================================================
-- 24. SD-WAN VS MPLS KOSTENVERGLEICH
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000024',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'SD-WAN vs. MPLS Kostenvergleich',
  'Vergleichen Sie moderne SD-WAN Lösungen mit traditionellem MPLS',
  'sdwan-mpls-vergleich',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_mpls_small", "name": "MPLS klein", "variableName": "mplsSmall", "value": 500, "unit": "CHF/Standort/Monat", "category": "MPLS"},
      {"id": "pv_mpls_medium", "name": "MPLS mittel", "variableName": "mplsMedium", "value": 1200, "unit": "CHF/Standort/Monat", "category": "MPLS"},
      {"id": "pv_sdwan_license", "name": "SD-WAN Lizenz", "variableName": "sdwanLicense", "value": 150, "unit": "CHF/Standort/Monat", "category": "SD-WAN"},
      {"id": "pv_internet", "name": "Internet pro Standort", "variableName": "internetCost", "value": 100, "unit": "CHF/Monat", "category": "Internet"}
    ],
    "calculations": [
      {"id": "mpls_monthly", "formula": "locations * mplsMedium", "label": "MPLS monatlich"},
      {"id": "mpls_annual", "formula": "mpls_monthly * 12", "label": "MPLS jährlich"},
      {"id": "sdwan_monthly", "formula": "locations * (sdwanLicense + internetCost * 2)", "label": "SD-WAN monatlich"},
      {"id": "sdwan_annual", "formula": "sdwan_monthly * 12", "label": "SD-WAN jährlich"},
      {"id": "savings_annual", "formula": "mpls_annual - sdwan_annual", "label": "Jährliche Ersparnis"},
      {"id": "savings_percent", "formula": "(savings_annual / mpls_annual) * 100", "label": "Ersparnis %"}
    ],
    "outputs": [
      {"id": "out_mpls", "label": "MPLS Kosten/Jahr", "formula": "mpls_annual", "format": "currency"},
      {"id": "out_sdwan", "label": "SD-WAN Kosten/Jahr", "formula": "sdwan_annual", "format": "currency"},
      {"id": "out_savings", "label": "Jährliche Ersparnis", "formula": "savings_annual", "format": "currency", "highlight": true, "color": "green"},
      {"id": "out_percent", "label": "Kostenreduktion", "formula": "savings_percent", "format": "percentage"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000024', 1, 'Netzwerk-Struktur', 'Ihre Standorte', 'form', '{
  "fields": [
    {"id": "locations", "label": "Anzahl Standorte", "type": "number", "required": true, "variableName": "locations"},
    {"id": "bandwidth", "label": "Benötigte Bandbreite", "type": "select", "variableName": "bandwidth", "options": [{"value": "small", "label": "10-50 Mbit/s"}, {"value": "medium", "label": "50-200 Mbit/s"}, {"value": "large", "label": "200+ Mbit/s"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000024', 2, 'Ergebnis', 'Ihr WAN-Kostenvergleich', 'result', '{"showChart": true, "ctaText": "WAN-Beratung", "ctaDescription": "Kostenlose Netzwerk-Analyse"}'::jsonb);

-- ============================================================================
-- 25. CHATBOT KOSTENERSPARNISRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000025',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Chatbot Kostenersparnisrechner',
  'Wie viel können Sie durch einen KI-Chatbot im Kundenservice sparen?',
  'chatbot-ersparnis-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_agent_cost", "name": "Kosten pro Agent/Jahr", "variableName": "agentCost", "value": 65000, "unit": "CHF", "category": "Personal"},
      {"id": "pv_chatbot_setup", "name": "Chatbot Setup", "variableName": "chatbotSetup", "value": 15000, "unit": "CHF", "category": "Chatbot"},
      {"id": "pv_chatbot_monthly", "name": "Chatbot Betrieb", "variableName": "chatbotMonthly", "value": 500, "unit": "CHF/Monat", "category": "Chatbot"},
      {"id": "pv_automation_rate", "name": "Automatisierungsrate", "variableName": "automationRate", "value": 0.4, "unit": "Prozent", "category": "Effizienz"}
    ],
    "calculations": [
      {"id": "current_cost", "formula": "supportAgents * agentCost", "label": "Aktuelle Supportkosten"},
      {"id": "automated_queries", "formula": "monthlyQueries * automationRate", "label": "Automatisierte Anfragen"},
      {"id": "agent_savings", "formula": "automated_queries / (monthlyQueries / supportAgents) * agentCost", "label": "Personaleinsparung"},
      {"id": "chatbot_cost", "formula": "chatbotSetup + (chatbotMonthly * 12)", "label": "Chatbot Kosten Jahr 1"},
      {"id": "net_savings", "formula": "agent_savings - chatbot_cost", "label": "Netto-Ersparnis Jahr 1"},
      {"id": "roi", "formula": "(net_savings / chatbot_cost) * 100", "label": "ROI Jahr 1"}
    ],
    "outputs": [
      {"id": "out_current", "label": "Aktuelle Supportkosten", "formula": "current_cost", "format": "currency"},
      {"id": "out_automated", "label": "Automatisierte Anfragen/Monat", "formula": "automated_queries", "format": "number"},
      {"id": "out_savings", "label": "Personaleinsparung/Jahr", "formula": "agent_savings", "format": "currency"},
      {"id": "out_net", "label": "Netto-Ersparnis Jahr 1", "formula": "net_savings", "format": "currency", "highlight": true, "color": "green"},
      {"id": "out_roi", "label": "ROI Jahr 1", "formula": "roi", "format": "percentage"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000025', 1, 'Support-Situation', 'Ihr aktueller Kundenservice', 'form', '{
  "fields": [
    {"id": "supportAgents", "label": "Anzahl Support-Mitarbeiter", "type": "number", "required": true, "variableName": "supportAgents"},
    {"id": "monthlyQueries", "label": "Support-Anfragen pro Monat", "type": "number", "required": true, "variableName": "monthlyQueries"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000025', 2, 'Ergebnis', 'Ihr Chatbot-Einsparpotenzial', 'result', '{"showChart": true, "ctaText": "Chatbot-Demo", "ctaDescription": "Sehen Sie einen KI-Chatbot in Aktion"}'::jsonb);

-- ============================================================================
-- 26. BYOD VS FIRMENGERÄTE VERGLEICH
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000026',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'BYOD vs. Firmengeräte Vergleich',
  'Bring Your Own Device oder Firmengeräte? Kosten und Risiken im Vergleich',
  'byod-firmengeraete-vergleich',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_device_cost", "name": "Firmengerät (Laptop)", "variableName": "deviceCost", "value": 1500, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_byod_stipend", "name": "BYOD Zulage", "variableName": "byodStipend", "value": 50, "unit": "CHF/Monat", "category": "BYOD"},
      {"id": "pv_mdm_cost", "name": "MDM-Lösung", "variableName": "mdmCost", "value": 8, "unit": "CHF/Gerät/Monat", "category": "Verwaltung"},
      {"id": "pv_support_byod", "name": "Support BYOD", "variableName": "supportByod", "value": 200, "unit": "CHF/Gerät/Jahr", "category": "Support"},
      {"id": "pv_support_corp", "name": "Support Firmengerät", "variableName": "supportCorp", "value": 100, "unit": "CHF/Gerät/Jahr", "category": "Support"},
      {"id": "pv_security_risk", "name": "Security-Risiko BYOD", "variableName": "securityRisk", "value": 500, "unit": "CHF/Gerät/Jahr", "category": "Risiko"}
    ],
    "calculations": [
      {"id": "corp_hardware", "formula": "employees * deviceCost / 4", "label": "Hardware (amortisiert)"},
      {"id": "corp_support", "formula": "employees * supportCorp", "label": "Support Firmengeräte"},
      {"id": "corp_mdm", "formula": "employees * mdmCost * 12", "label": "MDM Kosten"},
      {"id": "corp_total", "formula": "corp_hardware + corp_support + corp_mdm", "label": "Firmengeräte Total"},
      {"id": "byod_stipend_annual", "formula": "employees * byodStipend * 12", "label": "BYOD Zulagen"},
      {"id": "byod_support", "formula": "employees * supportByod", "label": "Support BYOD"},
      {"id": "byod_risk", "formula": "employees * securityRisk", "label": "Security-Risiko"},
      {"id": "byod_total", "formula": "byod_stipend_annual + byod_support + byod_risk + (employees * mdmCost * 12)", "label": "BYOD Total"},
      {"id": "difference", "formula": "byod_total - corp_total", "label": "Differenz"}
    ],
    "outputs": [
      {"id": "out_corp", "label": "Firmengeräte Kosten/Jahr", "formula": "corp_total", "format": "currency"},
      {"id": "out_byod", "label": "BYOD Kosten/Jahr (inkl. Risiko)", "formula": "byod_total", "format": "currency"},
      {"id": "out_diff", "label": "Differenz", "formula": "difference", "format": "currency", "highlight": true}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000026', 1, 'Mitarbeiter', 'Wie viele Geräte?', 'form', '{
  "fields": [
    {"id": "employees", "label": "Anzahl Mitarbeiter mit mobilem Arbeitsplatz", "type": "number", "required": true, "variableName": "employees"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000026', 2, 'Aktuelle Situation', 'Was nutzen Sie heute?', 'radio_group', '{
  "id": "currentPolicy",
  "variableName": "currentPolicy",
  "options": [
    {"id": "corp", "label": "Nur Firmengeräte", "value": "corp"},
    {"id": "byod", "label": "Nur BYOD", "value": "byod"},
    {"id": "mixed", "label": "Gemischt", "value": "mixed"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000026', 3, 'Ergebnis', 'Ihr Gerätestrategie-Vergleich', 'result', '{"showChart": true, "ctaText": "Workplace-Beratung", "ctaDescription": "Optimieren Sie Ihre Gerätestrategie"}'::jsonb);

-- ============================================================================
-- 27. SERVER-KONSOLIDIERUNG SPARRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000027',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Server-Konsolidierung Sparrechner',
  'Berechnen Sie die Einsparungen durch Server-Virtualisierung und Konsolidierung',
  'server-konsolidierung-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_physical_cost", "name": "Physischer Server", "variableName": "physicalCost", "value": 8000, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_power_server", "name": "Stromkosten/Server/Jahr", "variableName": "powerCost", "value": 1500, "unit": "CHF", "category": "Betrieb"},
      {"id": "pv_maint_server", "name": "Wartung/Server/Jahr", "variableName": "maintCost", "value": 500, "unit": "CHF", "category": "Wartung"},
      {"id": "pv_consolidation_ratio", "name": "Konsolidierungsrate", "variableName": "consolidationRatio", "value": 5, "unit": "VMs pro Host", "category": "Virtualisierung"},
      {"id": "pv_host_cost", "name": "Virtualisierungs-Host", "variableName": "hostCost", "value": 15000, "unit": "CHF", "category": "Hardware"}
    ],
    "calculations": [
      {"id": "current_hardware", "formula": "physicalServers * physicalCost / 5", "label": "Aktuelle Hardware (amortisiert)"},
      {"id": "current_power", "formula": "physicalServers * powerCost", "label": "Aktuelle Stromkosten"},
      {"id": "current_maint", "formula": "physicalServers * maintCost", "label": "Aktuelle Wartung"},
      {"id": "current_total", "formula": "current_hardware + current_power + current_maint", "label": "Aktuelle Kosten/Jahr"},
      {"id": "hosts_needed", "formula": "CEILING(physicalServers / consolidationRatio)", "label": "Benötigte Hosts"},
      {"id": "new_hardware", "formula": "hosts_needed * hostCost / 5", "label": "Neue Hardware (amortisiert)"},
      {"id": "new_power", "formula": "hosts_needed * powerCost * 1.5", "label": "Neue Stromkosten"},
      {"id": "new_maint", "formula": "hosts_needed * maintCost * 2", "label": "Neue Wartung"},
      {"id": "new_total", "formula": "new_hardware + new_power + new_maint", "label": "Neue Kosten/Jahr"},
      {"id": "savings", "formula": "current_total - new_total", "label": "Jährliche Ersparnis"},
      {"id": "savings_percent", "formula": "(savings / current_total) * 100", "label": "Ersparnis %"}
    ],
    "outputs": [
      {"id": "out_current", "label": "Aktuelle jährliche Kosten", "formula": "current_total", "format": "currency"},
      {"id": "out_hosts", "label": "Benötigte Virtualisierungs-Hosts", "formula": "hosts_needed", "format": "number"},
      {"id": "out_new", "label": "Neue jährliche Kosten", "formula": "new_total", "format": "currency"},
      {"id": "out_savings", "label": "Jährliche Ersparnis", "formula": "savings", "format": "currency", "highlight": true, "color": "green"},
      {"id": "out_percent", "label": "Kostenreduktion", "formula": "savings_percent", "format": "percentage"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000027', 1, 'Aktuelle Server', 'Ihre Server-Landschaft', 'form', '{
  "fields": [
    {"id": "physicalServers", "label": "Anzahl physischer Server", "type": "number", "required": true, "variableName": "physicalServers"},
    {"id": "avgAge", "label": "Durchschnittsalter der Server", "type": "select", "variableName": "avgAge", "options": [{"value": "2", "label": "< 3 Jahre"}, {"value": "4", "label": "3-5 Jahre"}, {"value": "6", "label": "> 5 Jahre"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000027', 2, 'Ergebnis', 'Ihr Konsolidierungs-Potenzial', 'result', '{"showChart": true, "ctaText": "Server-Assessment", "ctaDescription": "Kostenlose Analyse Ihrer Server-Infrastruktur"}'::jsonb);

-- ============================================================================
-- 28. INTERNET-BANDBREITEN RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000028',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Internet-Bandbreiten Rechner',
  'Wie viel Bandbreite braucht Ihr Unternehmen wirklich?',
  'internet-bandbreiten-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_user_basic", "name": "Basis-User", "variableName": "userBasic", "value": 2, "unit": "Mbit/s", "category": "Bandbreite"},
      {"id": "pv_user_heavy", "name": "Power-User", "variableName": "userHeavy", "value": 5, "unit": "Mbit/s", "category": "Bandbreite"},
      {"id": "pv_video_conf", "name": "Video-Konferenz", "variableName": "videoConf", "value": 4, "unit": "Mbit/s", "category": "Bandbreite"},
      {"id": "pv_cloud_sync", "name": "Cloud-Sync", "variableName": "cloudSync", "value": 3, "unit": "Mbit/s pro 10 User", "category": "Bandbreite"}
    ],
    "calculations": [
      {"id": "basic_bandwidth", "formula": "employees * 0.7 * userBasic", "label": "Basis-User Bedarf"},
      {"id": "heavy_bandwidth", "formula": "employees * 0.3 * userHeavy", "label": "Power-User Bedarf"},
      {"id": "video_bandwidth", "formula": "concurrentVideoCalls * videoConf", "label": "Video-Konferenz Bedarf"},
      {"id": "cloud_bandwidth", "formula": "(employees / 10) * cloudSync", "label": "Cloud-Sync Bedarf"},
      {"id": "total_bandwidth", "formula": "basic_bandwidth + heavy_bandwidth + video_bandwidth + cloud_bandwidth", "label": "Gesamtbedarf"},
      {"id": "recommended", "formula": "total_bandwidth * 1.3", "label": "Empfohlen (+30% Reserve)"}
    ],
    "outputs": [
      {"id": "out_basic", "label": "Basis-Bedarf", "formula": "total_bandwidth", "format": "number", "unit": "Mbit/s"},
      {"id": "out_recommended", "label": "Empfohlene Bandbreite", "formula": "recommended", "format": "number", "unit": "Mbit/s", "highlight": true}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000028', 1, 'Nutzung', 'Wie wird das Internet genutzt?', 'form', '{
  "fields": [
    {"id": "employees", "label": "Anzahl Mitarbeiter", "type": "number", "required": true, "variableName": "employees"},
    {"id": "concurrentVideoCalls", "label": "Gleichzeitige Video-Calls (max.)", "type": "number", "required": true, "variableName": "concurrentVideoCalls"},
    {"id": "cloudUsage", "label": "Cloud-Nutzung", "type": "select", "variableName": "cloudUsage", "options": [{"value": "low", "label": "Niedrig (wenig Cloud)"}, {"value": "medium", "label": "Mittel (M365, CRM)"}, {"value": "high", "label": "Hoch (Cloud-First)"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000028', 2, 'Ergebnis', 'Ihre Bandbreiten-Empfehlung', 'result', '{"showChart": false, "ctaText": "Internet-Beratung", "ctaDescription": "Wir finden den optimalen Anbieter für Sie"}'::jsonb);


