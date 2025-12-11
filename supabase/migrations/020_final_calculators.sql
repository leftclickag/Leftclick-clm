-- ============================================================================
-- ABSCHLIESSENDE KALKULATOREN & TOOLS
-- E-Commerce, Disaster Recovery, Workplace Konfigurator, Templates
-- ============================================================================

-- ============================================================================
-- 37. E-COMMERCE PLATTFORM VERGLEICHSRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000037',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'E-Commerce Plattform Vergleichsrechner',
  'Shopify vs. WooCommerce vs. Custom - welche Lösung passt zu Ihrem Budget?',
  'ecommerce-plattform-vergleich',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_shopify_basic", "name": "Shopify Basic", "variableName": "shopifyBasic", "value": 29, "unit": "CHF/Monat", "category": "Shopify"},
      {"id": "pv_shopify_fee", "name": "Shopify Transaktionsgebühr", "variableName": "shopifyFee", "value": 0.02, "unit": "Prozent", "category": "Shopify"},
      {"id": "pv_woo_hosting", "name": "WooCommerce Hosting", "variableName": "wooHosting", "value": 30, "unit": "CHF/Monat", "category": "WooCommerce"},
      {"id": "pv_woo_plugins", "name": "WooCommerce Plugins", "variableName": "wooPlugins", "value": 100, "unit": "CHF/Monat", "category": "WooCommerce"},
      {"id": "pv_custom_dev", "name": "Custom Entwicklung", "variableName": "customDev", "value": 50000, "unit": "CHF", "category": "Custom"},
      {"id": "pv_custom_maint", "name": "Custom Wartung", "variableName": "customMaint", "value": 500, "unit": "CHF/Monat", "category": "Custom"}
    ],
    "calculations": [
      {"id": "shopify_fixed", "formula": "shopifyBasic * 12", "label": "Shopify Fixkosten"},
      {"id": "shopify_variable", "formula": "monthlyRevenue * 12 * shopifyFee", "label": "Shopify Transaktionen"},
      {"id": "shopify_total", "formula": "shopify_fixed + shopify_variable", "label": "Shopify Total"},
      {"id": "woo_total", "formula": "(wooHosting + wooPlugins) * 12", "label": "WooCommerce Total"},
      {"id": "custom_year1", "formula": "customDev + (customMaint * 12)", "label": "Custom Jahr 1"},
      {"id": "custom_year2plus", "formula": "customMaint * 12", "label": "Custom ab Jahr 2"}
    ],
    "outputs": [
      {"id": "out_shopify", "label": "Shopify Kosten/Jahr", "formula": "shopify_total", "format": "currency"},
      {"id": "out_woo", "label": "WooCommerce Kosten/Jahr", "formula": "woo_total", "format": "currency"},
      {"id": "out_custom1", "label": "Custom Shop (Jahr 1)", "formula": "custom_year1", "format": "currency"},
      {"id": "out_custom2", "label": "Custom Shop (ab Jahr 2)", "formula": "custom_year2plus", "format": "currency"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000037', 1, 'Geschäftsdaten', 'Umsatz und Anforderungen', 'form', '{
  "fields": [
    {"id": "monthlyRevenue", "label": "Erwarteter monatlicher Umsatz (CHF)", "type": "number", "required": true, "variableName": "monthlyRevenue"},
    {"id": "products", "label": "Anzahl Produkte", "type": "select", "variableName": "products", "options": [{"value": "small", "label": "< 100"}, {"value": "medium", "label": "100-1000"}, {"value": "large", "label": "> 1000"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000037', 2, 'Ergebnis', 'Ihr Plattform-Vergleich', 'result', '{"showChart": true, "ctaText": "E-Commerce Beratung", "ctaDescription": "Wir helfen bei der Plattformwahl"}'::jsonb);

-- ============================================================================
-- 38. DISASTER RECOVERY ROI RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000038',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Disaster Recovery ROI Rechner',
  'Berechnen Sie den ROI einer professionellen Disaster Recovery Lösung',
  'disaster-recovery-roi',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_downtime_hour", "name": "Ausfallkosten pro Stunde", "variableName": "downtimeHour", "value": 10000, "unit": "CHF", "category": "Ausfall"},
      {"id": "pv_dr_basic", "name": "DR Basic (24h RTO)", "variableName": "drBasic", "value": 500, "unit": "CHF/Monat", "category": "DR-Lösung"},
      {"id": "pv_dr_standard", "name": "DR Standard (4h RTO)", "variableName": "drStandard", "value": 1500, "unit": "CHF/Monat", "category": "DR-Lösung"},
      {"id": "pv_dr_premium", "name": "DR Premium (15min RTO)", "variableName": "drPremium", "value": 3000, "unit": "CHF/Monat", "category": "DR-Lösung"}
    ],
    "calculations": [
      {"id": "no_dr_loss", "formula": "downtimeHour * expectedDowntimeHours", "label": "Verlust ohne DR"},
      {"id": "basic_dr_loss", "formula": "downtimeHour * 24", "label": "Verlust mit Basic DR"},
      {"id": "basic_dr_cost", "formula": "drBasic * 12", "label": "Basic DR Kosten"},
      {"id": "basic_savings", "formula": "no_dr_loss - basic_dr_loss - basic_dr_cost", "label": "Ersparnis Basic"},
      {"id": "standard_dr_loss", "formula": "downtimeHour * 4", "label": "Verlust mit Standard DR"},
      {"id": "standard_dr_cost", "formula": "drStandard * 12", "label": "Standard DR Kosten"},
      {"id": "standard_savings", "formula": "no_dr_loss - standard_dr_loss - standard_dr_cost", "label": "Ersparnis Standard"},
      {"id": "premium_dr_loss", "formula": "downtimeHour * 0.25", "label": "Verlust mit Premium DR"},
      {"id": "premium_dr_cost", "formula": "drPremium * 12", "label": "Premium DR Kosten"},
      {"id": "premium_savings", "formula": "no_dr_loss - premium_dr_loss - premium_dr_cost", "label": "Ersparnis Premium"}
    ],
    "outputs": [
      {"id": "out_no_dr", "label": "Verlust OHNE Disaster Recovery", "formula": "no_dr_loss", "format": "currency", "color": "red"},
      {"id": "out_basic", "label": "Ersparnis mit Basic DR", "formula": "basic_savings", "format": "currency"},
      {"id": "out_standard", "label": "Ersparnis mit Standard DR", "formula": "standard_savings", "format": "currency"},
      {"id": "out_premium", "label": "Ersparnis mit Premium DR", "formula": "premium_savings", "format": "currency", "highlight": true, "color": "green"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000038', 1, 'Ausfallrisiko', 'Ihre aktuelle Situation', 'form', '{
  "fields": [
    {"id": "downtimeHour", "label": "Kosten pro Stunde Ausfall (CHF)", "type": "number", "required": true, "variableName": "downtimeHour", "helpText": "Umsatzverlust + Produktivität"},
    {"id": "expectedDowntimeHours", "label": "Erwartete Ausfallzeit ohne DR (Stunden)", "type": "number", "required": true, "variableName": "expectedDowntimeHours", "helpText": "Bei einem Totalausfall"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000038', 2, 'Ergebnis', 'Ihr DR ROI', 'result', '{"showChart": true, "ctaText": "DR-Assessment", "ctaDescription": "Kostenlose Analyse Ihrer DR-Situation"}'::jsonb);

-- ============================================================================
-- 39. CYBER-SECURITY RISIKO-RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000039',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Cyber-Security Risiko-Rechner',
  'Berechnen Sie Ihr finanzielles Cyber-Risiko in Schweizer Franken',
  'cybersecurity-risiko-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_breach_prob", "name": "Breach-Wahrscheinlichkeit/Jahr", "variableName": "breachProb", "value": 0.28, "unit": "Prozent", "category": "Risiko"},
      {"id": "pv_cost_per_record", "name": "Kosten pro Datensatz", "variableName": "costPerRecord", "value": 150, "unit": "CHF", "category": "Schaden"},
      {"id": "pv_notification_cost", "name": "Benachrichtigungskosten", "variableName": "notificationCost", "value": 50000, "unit": "CHF", "category": "Compliance"},
      {"id": "pv_legal_cost", "name": "Rechtskosten", "variableName": "legalCost", "value": 30000, "unit": "CHF", "category": "Recht"}
    ],
    "calculations": [
      {"id": "record_breach_cost", "formula": "records * costPerRecord", "label": "Datensatz-Kosten"},
      {"id": "fixed_costs", "formula": "notificationCost + legalCost", "label": "Fixe Kosten"},
      {"id": "total_breach_cost", "formula": "record_breach_cost + fixed_costs", "label": "Gesamtkosten Breach"},
      {"id": "annual_risk", "formula": "total_breach_cost * breachProb", "label": "Jährliches Risiko"},
      {"id": "recommended_security_budget", "formula": "annual_risk * 0.3", "label": "Empfohlenes Security-Budget"}
    ],
    "outputs": [
      {"id": "out_breach", "label": "Kosten bei Datenpanne", "formula": "total_breach_cost", "format": "currency", "color": "red"},
      {"id": "out_risk", "label": "Jährliches Risiko (28% Wahrsch.)", "formula": "annual_risk", "format": "currency", "highlight": true},
      {"id": "out_budget", "label": "Empfohlenes Security-Budget", "formula": "recommended_security_budget", "format": "currency", "color": "green"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000039', 1, 'Datenbestand', 'Welche Daten verwalten Sie?', 'form', '{
  "fields": [
    {"id": "records", "label": "Anzahl Datensätze (Kunden, Mitarbeiter)", "type": "number", "required": true, "variableName": "records", "placeholder": "z.B. 5000"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000039', 2, 'Datentypen', 'Welche Daten speichern Sie?', 'multi_select', '{
  "id": "dataTypes",
  "options": [
    {"id": "personal", "label": "Personenbezogene Daten", "multiplier": 1},
    {"id": "financial", "label": "Finanzdaten", "multiplier": 1.5},
    {"id": "health", "label": "Gesundheitsdaten", "multiplier": 2},
    {"id": "credentials", "label": "Login-Daten", "multiplier": 1.3}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000039', 3, 'Ergebnis', 'Ihr Cyber-Risiko', 'result', '{"showChart": true, "ctaText": "Security-Assessment", "ctaDescription": "Kostenlose Risikoanalyse"}'::jsonb);

-- ============================================================================
-- 40. PAPIERLOS-BÜRO ROI RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Papierloses Büro ROI Rechner',
  'Berechnen Sie die Einsparungen durch Digitalisierung Ihrer Dokumente',
  'papierlos-buero-roi',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_paper_page", "name": "Kosten pro Seite (Druck)", "variableName": "paperPage", "value": 0.05, "unit": "CHF", "category": "Papier"},
      {"id": "pv_storage_sqm", "name": "Lagerkosten pro m²/Jahr", "variableName": "storageSqm", "value": 200, "unit": "CHF", "category": "Lager"},
      {"id": "pv_filing_time", "name": "Ablagezeit pro Dokument", "variableName": "filingTime", "value": 2, "unit": "Minuten", "category": "Zeit"},
      {"id": "pv_search_time", "name": "Suchzeit pro Dokument", "variableName": "searchTime", "value": 5, "unit": "Minuten", "category": "Zeit"},
      {"id": "pv_hourly_rate", "name": "Stundenlohn", "variableName": "hourlyRate", "value": 50, "unit": "CHF", "category": "Personal"},
      {"id": "pv_dms_cost", "name": "DMS-Lösung", "variableName": "dmsCost", "value": 30, "unit": "CHF/User/Monat", "category": "Software"}
    ],
    "calculations": [
      {"id": "paper_cost", "formula": "monthlyPages * 12 * paperPage", "label": "Papierkosten"},
      {"id": "storage_cost", "formula": "archiveSqm * storageSqm", "label": "Lagerkosten"},
      {"id": "filing_cost", "formula": "(monthlyDocs * filingTime / 60 * hourlyRate) * 12", "label": "Ablagekosten"},
      {"id": "search_cost", "formula": "(monthlySearches * searchTime / 60 * hourlyRate) * 12", "label": "Suchkosten"},
      {"id": "total_current", "formula": "paper_cost + storage_cost + filing_cost + search_cost", "label": "Aktuelle Kosten"},
      {"id": "dms_cost_annual", "formula": "users * dmsCost * 12", "label": "DMS Kosten"},
      {"id": "savings_paper", "formula": "paper_cost * 0.8", "label": "Papier-Ersparnis"},
      {"id": "savings_time", "formula": "(filing_cost + search_cost) * 0.7", "label": "Zeit-Ersparnis"},
      {"id": "total_savings", "formula": "savings_paper + savings_time + (storage_cost * 0.5)", "label": "Gesamtersparnis"},
      {"id": "net_benefit", "formula": "total_savings - dms_cost_annual", "label": "Netto-Nutzen"}
    ],
    "outputs": [
      {"id": "out_current", "label": "Aktuelle Kosten/Jahr", "formula": "total_current", "format": "currency"},
      {"id": "out_savings", "label": "Mögliche Ersparnis", "formula": "total_savings", "format": "currency"},
      {"id": "out_dms", "label": "DMS-Investition", "formula": "dms_cost_annual", "format": "currency"},
      {"id": "out_net", "label": "Netto-Ersparnis/Jahr", "formula": "net_benefit", "format": "currency", "highlight": true, "color": "green"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000040', 1, 'Aktuelle Situation', 'Ihr Papierverbrauch', 'form', '{
  "fields": [
    {"id": "users", "label": "Anzahl Mitarbeiter", "type": "number", "required": true, "variableName": "users"},
    {"id": "monthlyPages", "label": "Gedruckte Seiten pro Monat", "type": "number", "required": true, "variableName": "monthlyPages"},
    {"id": "monthlyDocs", "label": "Abgelegte Dokumente pro Monat", "type": "number", "required": true, "variableName": "monthlyDocs"},
    {"id": "monthlySearches", "label": "Dokumenten-Suchen pro Monat", "type": "number", "required": true, "variableName": "monthlySearches"},
    {"id": "archiveSqm", "label": "Archivfläche in m²", "type": "number", "required": true, "variableName": "archiveSqm"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000040', 2, 'Ergebnis', 'Ihr Digitalisierungs-ROI', 'result', '{"showChart": true, "ctaText": "DMS-Beratung", "ctaDescription": "Kostenlose Analyse Ihrer Dokumentenprozesse"}'::jsonb);

-- ============================================================================
-- 41. MDM ROI RECHNER (Mobile Device Management)
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Mobile Device Management ROI',
  'Berechnen Sie den ROI einer MDM-Lösung für Ihre mobilen Geräte',
  'mdm-roi-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_mdm_license", "name": "MDM Lizenz", "variableName": "mdmLicense", "value": 5, "unit": "CHF/Gerät/Monat", "category": "MDM"},
      {"id": "pv_manual_setup", "name": "Manuelles Setup", "variableName": "manualSetup", "value": 60, "unit": "Minuten", "category": "Zeit"},
      {"id": "pv_mdm_setup", "name": "MDM Setup", "variableName": "mdmSetup", "value": 10, "unit": "Minuten", "category": "Zeit"},
      {"id": "pv_support_manual", "name": "Support-Tickets/Gerät/Jahr", "variableName": "supportManual", "value": 6, "unit": "Tickets", "category": "Support"},
      {"id": "pv_support_mdm", "name": "Support mit MDM", "variableName": "supportMdm", "value": 2, "unit": "Tickets", "category": "Support"},
      {"id": "pv_ticket_cost", "name": "Kosten pro Ticket", "variableName": "ticketCost", "value": 50, "unit": "CHF", "category": "Support"},
      {"id": "pv_it_rate", "name": "IT-Stundensatz", "variableName": "itRate", "value": 100, "unit": "CHF", "category": "IT"},
      {"id": "pv_breach_risk", "name": "Breach-Risiko ohne MDM", "variableName": "breachRisk", "value": 5000, "unit": "CHF/Jahr", "category": "Sicherheit"}
    ],
    "calculations": [
      {"id": "mdm_cost", "formula": "devices * mdmLicense * 12", "label": "MDM-Kosten/Jahr"},
      {"id": "setup_savings", "formula": "newDevicesYear * ((manualSetup - mdmSetup) / 60) * itRate", "label": "Setup-Ersparnis"},
      {"id": "support_savings", "formula": "devices * (supportManual - supportMdm) * ticketCost", "label": "Support-Ersparnis"},
      {"id": "security_savings", "formula": "breachRisk * 0.7", "label": "Sicherheits-Ersparnis"},
      {"id": "total_savings", "formula": "setup_savings + support_savings + security_savings", "label": "Gesamtersparnis"},
      {"id": "net_benefit", "formula": "total_savings - mdm_cost", "label": "Netto-Nutzen"},
      {"id": "roi", "formula": "(net_benefit / mdm_cost) * 100", "label": "ROI"}
    ],
    "outputs": [
      {"id": "out_cost", "label": "MDM-Kosten/Jahr", "formula": "mdm_cost", "format": "currency"},
      {"id": "out_savings", "label": "Einsparungen/Jahr", "formula": "total_savings", "format": "currency"},
      {"id": "out_net", "label": "Netto-Nutzen/Jahr", "formula": "net_benefit", "format": "currency", "highlight": true, "color": "green"},
      {"id": "out_roi", "label": "ROI", "formula": "roi", "format": "percentage"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000041', 1, 'Gerätebestand', 'Ihre mobilen Geräte', 'form', '{
  "fields": [
    {"id": "devices", "label": "Anzahl mobile Geräte (Smartphones, Tablets)", "type": "number", "required": true, "variableName": "devices"},
    {"id": "newDevicesYear", "label": "Neue Geräte pro Jahr", "type": "number", "required": true, "variableName": "newDevicesYear"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000041', 2, 'Ergebnis', 'Ihr MDM ROI', 'result', '{"showChart": true, "ctaText": "MDM-Demo", "ctaDescription": "Kostenlose MDM-Demonstration"}'::jsonb);

-- ============================================================================
-- 42. VOIP ROI RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000042',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'VoIP vs. ISDN Kostenvergleich',
  'Berechnen Sie die Einsparungen durch den Wechsel zu VoIP-Telefonie',
  'voip-isdn-vergleich',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_isdn_base", "name": "ISDN Grundgebühr", "variableName": "isdnBase", "value": 50, "unit": "CHF/Anschluss/Monat", "category": "ISDN"},
      {"id": "pv_isdn_minute", "name": "ISDN Gesprächskosten", "variableName": "isdnMinute", "value": 0.05, "unit": "CHF/Minute", "category": "ISDN"},
      {"id": "pv_voip_user", "name": "VoIP pro User", "variableName": "voipUser", "value": 15, "unit": "CHF/Monat", "category": "VoIP"},
      {"id": "pv_voip_flat", "name": "VoIP Flatrate", "variableName": "voipFlat", "value": 0, "unit": "CHF", "category": "VoIP"}
    ],
    "calculations": [
      {"id": "isdn_fixed", "formula": "isdnLines * isdnBase * 12", "label": "ISDN Grundgebühren"},
      {"id": "isdn_calls", "formula": "monthlyMinutes * 12 * isdnMinute", "label": "ISDN Gesprächskosten"},
      {"id": "isdn_total", "formula": "isdn_fixed + isdn_calls", "label": "ISDN Gesamtkosten"},
      {"id": "voip_total", "formula": "users * voipUser * 12", "label": "VoIP Gesamtkosten"},
      {"id": "savings", "formula": "isdn_total - voip_total", "label": "Jährliche Ersparnis"},
      {"id": "savings_percent", "formula": "(savings / isdn_total) * 100", "label": "Ersparnis in %"}
    ],
    "outputs": [
      {"id": "out_isdn", "label": "ISDN Kosten/Jahr", "formula": "isdn_total", "format": "currency"},
      {"id": "out_voip", "label": "VoIP Kosten/Jahr", "formula": "voip_total", "format": "currency"},
      {"id": "out_savings", "label": "Jährliche Ersparnis", "formula": "savings", "format": "currency", "highlight": true, "color": "green"},
      {"id": "out_percent", "label": "Kostenreduktion", "formula": "savings_percent", "format": "percentage"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000042', 1, 'Telefonie-Situation', 'Aktuelle Telefonanlage', 'form', '{
  "fields": [
    {"id": "users", "label": "Anzahl Telefonnutzer", "type": "number", "required": true, "variableName": "users"},
    {"id": "isdnLines", "label": "Anzahl ISDN-Leitungen", "type": "number", "required": true, "variableName": "isdnLines"},
    {"id": "monthlyMinutes", "label": "Gesprächsminuten pro Monat", "type": "number", "required": true, "variableName": "monthlyMinutes"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000042', 2, 'Ergebnis', 'Ihr VoIP-Sparpotenzial', 'result', '{"showChart": true, "ctaText": "VoIP-Beratung", "ctaDescription": "Kostenlose Telefonie-Analyse"}'::jsonb);

-- ============================================================================
-- 43. SEO VS ADS BUDGET-OPTIMIERER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000043',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'SEO vs. Google Ads Budget-Optimierer',
  'Wie sollten Sie Ihr Marketing-Budget zwischen SEO und Ads aufteilen?',
  'seo-vs-ads-budget',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_ads_cpc", "name": "Durchschn. CPC", "variableName": "adsCPC", "value": 2, "unit": "CHF", "category": "Ads"},
      {"id": "pv_ads_conv", "name": "Ads Conversion Rate", "variableName": "adsConv", "value": 0.03, "unit": "Prozent", "category": "Ads"},
      {"id": "pv_seo_monthly", "name": "SEO Kosten/Monat", "variableName": "seoMonthly", "value": 2000, "unit": "CHF", "category": "SEO"},
      {"id": "pv_seo_time", "name": "SEO Anlaufzeit", "variableName": "seoTime", "value": 6, "unit": "Monate", "category": "SEO"},
      {"id": "pv_organic_conv", "name": "Organic Conversion Rate", "variableName": "organicConv", "value": 0.05, "unit": "Prozent", "category": "SEO"}
    ],
    "calculations": [
      {"id": "ads_clicks", "formula": "adsBudget / adsCPC", "label": "Ads Klicks/Monat"},
      {"id": "ads_conversions", "formula": "ads_clicks * adsConv", "label": "Ads Conversions"},
      {"id": "ads_cpa", "formula": "adsBudget / ads_conversions", "label": "Cost per Acquisition"},
      {"id": "seo_roi_year1", "formula": "((estimatedOrganic * organicConv * customerValue * 6) - (seoMonthly * 12)) / (seoMonthly * 12) * 100", "label": "SEO ROI Jahr 1"},
      {"id": "optimal_seo", "formula": "totalBudget * 0.4", "label": "Empfohlenes SEO-Budget"},
      {"id": "optimal_ads", "formula": "totalBudget * 0.6", "label": "Empfohlenes Ads-Budget"}
    ],
    "outputs": [
      {"id": "out_cpa", "label": "Google Ads CPA", "formula": "ads_cpa", "format": "currency"},
      {"id": "out_seo", "label": "Empfohlen: SEO Budget/Monat", "formula": "optimal_seo", "format": "currency"},
      {"id": "out_ads", "label": "Empfohlen: Ads Budget/Monat", "formula": "optimal_ads", "format": "currency", "highlight": true}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000043', 1, 'Budget', 'Ihr Marketing-Budget', 'form', '{
  "fields": [
    {"id": "totalBudget", "label": "Gesamtes Marketing-Budget/Monat (CHF)", "type": "number", "required": true, "variableName": "totalBudget"},
    {"id": "adsBudget", "label": "Aktuelles Ads-Budget/Monat (CHF)", "type": "number", "required": true, "variableName": "adsBudget"},
    {"id": "customerValue", "label": "Durchschn. Kundenwert (CHF)", "type": "number", "required": true, "variableName": "customerValue"},
    {"id": "estimatedOrganic", "label": "Erwartete organische Besucher/Monat nach SEO", "type": "number", "required": true, "variableName": "estimatedOrganic"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000043', 2, 'Ergebnis', 'Ihre optimale Budget-Aufteilung', 'result', '{"showChart": true, "ctaText": "Marketing-Beratung", "ctaDescription": "Kostenlose Analyse Ihrer Marketing-Strategie"}'::jsonb);

-- ============================================================================
-- 44. CLOUD VS ON-PREMISE TCO
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000044',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Cloud vs. On-Premise TCO Vergleich',
  'Total Cost of Ownership: Lohnt sich die Cloud für Sie?',
  'cloud-vs-onpremise-tco',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_server_cost", "name": "Server-Hardware", "variableName": "serverCost", "value": 15000, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_storage_cost", "name": "Storage pro TB", "variableName": "storageCost", "value": 500, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_power_server", "name": "Strom pro Server/Jahr", "variableName": "powerServer", "value": 1500, "unit": "CHF", "category": "Betrieb"},
      {"id": "pv_it_admin", "name": "IT-Admin Anteil", "variableName": "itAdmin", "value": 0.2, "unit": "FTE", "category": "Personal"},
      {"id": "pv_admin_salary", "name": "Admin Jahresgehalt", "variableName": "adminSalary", "value": 90000, "unit": "CHF", "category": "Personal"},
      {"id": "pv_cloud_vm", "name": "Cloud VM/Monat", "variableName": "cloudVM", "value": 200, "unit": "CHF", "category": "Cloud"},
      {"id": "pv_cloud_storage_gb", "name": "Cloud Storage/GB/Monat", "variableName": "cloudStorageGB", "value": 0.02, "unit": "CHF", "category": "Cloud"}
    ],
    "calculations": [
      {"id": "onprem_hardware", "formula": "(servers * serverCost + storageNeeded * storageCost) / 5", "label": "Hardware (amortisiert)"},
      {"id": "onprem_power", "formula": "servers * powerServer", "label": "Stromkosten"},
      {"id": "onprem_admin", "formula": "itAdmin * adminSalary", "label": "Admin-Kosten"},
      {"id": "onprem_total", "formula": "onprem_hardware + onprem_power + onprem_admin", "label": "On-Premise Total"},
      {"id": "cloud_compute", "formula": "servers * cloudVM * 12", "label": "Cloud Compute"},
      {"id": "cloud_storage", "formula": "storageNeeded * 1000 * cloudStorageGB * 12", "label": "Cloud Storage"},
      {"id": "cloud_total", "formula": "cloud_compute + cloud_storage", "label": "Cloud Total"},
      {"id": "difference", "formula": "onprem_total - cloud_total", "label": "Differenz"}
    ],
    "outputs": [
      {"id": "out_onprem", "label": "On-Premise TCO/Jahr", "formula": "onprem_total", "format": "currency"},
      {"id": "out_cloud", "label": "Cloud TCO/Jahr", "formula": "cloud_total", "format": "currency"},
      {"id": "out_diff", "label": "Differenz (positiv = Cloud günstiger)", "formula": "difference", "format": "currency", "highlight": true}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000044', 1, 'Infrastruktur', 'Ihre aktuelle/geplante Infrastruktur', 'form', '{
  "fields": [
    {"id": "servers", "label": "Anzahl Server", "type": "number", "required": true, "variableName": "servers"},
    {"id": "storageNeeded", "label": "Benötigter Speicher (TB)", "type": "number", "required": true, "variableName": "storageNeeded"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000044', 2, 'Ergebnis', 'Ihr TCO-Vergleich', 'result', '{"showChart": true, "ctaText": "Cloud-Beratung", "ctaDescription": "Kostenlose Cloud-Readiness Analyse"}'::jsonb);

-- ============================================================================
-- 45. IT-BUDGET PLANUNGSVORLAGE (Download)
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '51000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'ebook',
  'IT-Budget Planungsvorlage',
  'Professionelle Excel-Vorlage zur Planung Ihres IT-Budgets - kostenlos zum Download',
  'it-budget-vorlage',
  '{
    "downloadUrl": "/downloads/it-budget-vorlage.xlsx",
    "fileType": "Excel",
    "fileSize": "250 KB",
    "previewImage": "/images/it-budget-preview.png"
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('51000000-0000-0000-0000-000000000001', 1, 'Download', 'Ihre IT-Budget Vorlage', 'download', '{
  "title": "IT-Budget Planungsvorlage 2024",
  "description": "Enthält: Jahresbudget-Planung, Investitions-Tracking, Lizenz-Übersicht, Wartungsverträge",
  "benefits": [
    "Strukturierte Budget-Kategorien",
    "Automatische Berechnungen",
    "Grafische Auswertungen",
    "Anpassbar an Ihre Bedürfnisse"
  ]
}'::jsonb);

-- ============================================================================
-- 46. PHISHING ANFÄLLIGKEIT TEST
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '31000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'quiz',
  'Phishing-Anfälligkeits-Test',
  'Würden Sie auf diese Phishing-Mails hereinfallen? Testen Sie sich!',
  'phishing-test',
  '{"showResults": true, "showCorrectAnswers": true}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('31000000-0000-0000-0000-000000000005', 1, 'E-Mail 1/5', 'Ist diese E-Mail echt oder Phishing?', 'radio_group', '{
  "id": "email1",
  "emailPreview": {
    "from": "support@paypa1.com",
    "subject": "Ihr Konto wurde eingeschränkt",
    "body": "Sehr geehrter Kunde, wir haben ungewöhnliche Aktivitäten festgestellt. Klicken Sie hier, um Ihr Konto zu bestätigen."
  },
  "options": [
    {"id": "real", "label": "Echte E-Mail von PayPal", "correct": false},
    {"id": "phishing", "label": "Phishing-Versuch", "correct": true}
  ],
  "explanation": "Phishing! Achten Sie auf paypa1.com (mit 1 statt l). Echte Unternehmen fordern nie per E-Mail zur Kontobestätigung auf."
}'::jsonb),
('31000000-0000-0000-0000-000000000005', 2, 'E-Mail 2/5', 'Ist diese E-Mail echt oder Phishing?', 'radio_group', '{
  "id": "email2",
  "emailPreview": {
    "from": "noreply@swisscom.com",
    "subject": "Ihre Rechnung ist verfügbar",
    "body": "Guten Tag, Ihre aktuelle Rechnung ist im Kundencenter verfügbar. Loggen Sie sich unter swisscom.ch ein."
  },
  "options": [
    {"id": "real", "label": "Echte E-Mail", "correct": true},
    {"id": "phishing", "label": "Phishing-Versuch", "correct": false}
  ],
  "explanation": "Echt! Die Domain ist korrekt und es wird auf die offizielle Website verwiesen, nicht auf einen direkten Link."
}'::jsonb),
('31000000-0000-0000-0000-000000000005', 3, 'E-Mail 3/5', 'Ist diese E-Mail echt oder Phishing?', 'radio_group', '{
  "id": "email3",
  "emailPreview": {
    "from": "ceo@firma.com",
    "subject": "DRINGEND: Überweisung benötigt",
    "body": "Hallo, ich brauche dringend eine Überweisung von CHF 15000. Ich bin im Meeting und kann nicht telefonieren. Bitte schnell erledigen!"
  },
  "options": [
    {"id": "real", "label": "Echte E-Mail vom CEO", "correct": false},
    {"id": "phishing", "label": "CEO-Fraud / Phishing", "correct": true}
  ],
  "explanation": "CEO-Fraud! Typische Merkmale: Dringlichkeit, nicht erreichbar, ungewöhnliche Anfrage. Immer telefonisch bestätigen!"
}'::jsonb),
('31000000-0000-0000-0000-000000000005', 4, 'E-Mail 4/5', 'Ist diese E-Mail echt oder Phishing?', 'radio_group', '{
  "id": "email4",
  "emailPreview": {
    "from": "hr@firma.com",
    "subject": "Aktualisierung Ihrer Bankdaten erforderlich",
    "body": "Liebe Mitarbeitende, bitte aktualisieren Sie Ihre Bankdaten über diesen Link für die Lohnauszahlung."
  },
  "options": [
    {"id": "real", "label": "Echte HR-E-Mail", "correct": false},
    {"id": "phishing", "label": "Phishing-Versuch", "correct": true}
  ],
  "explanation": "Phishing! HR würde nie per E-Mail-Link nach Bankdaten fragen. Solche Änderungen erfolgen persönlich oder über interne Systeme."
}'::jsonb),
('31000000-0000-0000-0000-000000000005', 5, 'E-Mail 5/5', 'Ist diese E-Mail echt oder Phishing?', 'radio_group', '{
  "id": "email5",
  "emailPreview": {
    "from": "microsoft365@microsoft.com",
    "subject": "Ihr Speicherplatz ist voll",
    "body": "Ihr OneDrive-Speicher ist zu 95% voll. Melden Sie sich im Microsoft 365 Admin Center an, um Speicher zu verwalten."
  },
  "options": [
    {"id": "real", "label": "Echte Microsoft-E-Mail", "correct": true},
    {"id": "phishing", "label": "Phishing-Versuch", "correct": false}
  ],
  "explanation": "Echt! Die Domain ist korrekt (microsoft.com) und es wird auf das offizielle Admin Center verwiesen, nicht auf einen externen Link."
}'::jsonb),
('31000000-0000-0000-0000-000000000005', 6, 'Ergebnis', 'Ihr Phishing-Awareness Score', 'quiz_result', '{
  "scoreRanges": [
    {"min": 0, "max": 2, "title": "Vorsicht geboten!", "description": "Sie sollten dringend ein Security Awareness Training absolvieren.", "icon": "⚠️"},
    {"min": 3, "max": 3, "title": "Ausbaufähig", "description": "Grundlegendes Wissen vorhanden, aber Vertiefung empfohlen.", "icon": "📚"},
    {"min": 4, "max": 4, "title": "Gut aufgestellt", "description": "Sie haben ein gutes Gespür für Phishing!", "icon": "👍"},
    {"min": 5, "max": 5, "title": "Phishing-Profi!", "description": "Exzellent! Sie lassen sich nicht täuschen.", "icon": "🏆"}
  ],
  "ctaText": "Security Training buchen"
}'::jsonb);

-- ============================================================================
-- 47. CLOUD READINESS ASSESSMENT
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000018',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'Cloud-Readiness Assessment',
  'Ist Ihr Unternehmen bereit für die Cloud? 20 Punkte zur Selbsteinschätzung',
  'cloud-readiness-check',
  '{"threshold": 70, "belowThresholdAction": "roadmap", "aboveThresholdAction": "migration"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000018', 1, 'Infrastruktur', 'Technische Voraussetzungen', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Stabile Internet-Verbindung mit ausreichend Bandbreite?", "weight": 15},
    {"id": "q2", "text": "Keine Legacy-Anwendungen, die Cloud-Migration verhindern?", "weight": 12},
    {"id": "q3", "text": "Dokumentierte IT-Infrastruktur?", "weight": 10},
    {"id": "q4", "text": "Virtualisierung bereits im Einsatz?", "weight": 10},
    {"id": "q5", "text": "APIs für Integrationen verfügbar?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000018', 2, 'Sicherheit & Compliance', 'Rechtliche und Sicherheitsaspekte', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Datenschutz-Anforderungen bekannt?", "weight": 15},
    {"id": "q7", "text": "Keine regulatorischen Hindernisse für Cloud?", "weight": 12},
    {"id": "q8", "text": "Security-Richtlinien für Cloud definiert?", "weight": 10},
    {"id": "q9", "text": "Identity Management vorbereitet (SSO, MFA)?", "weight": 12},
    {"id": "q10", "text": "Backup-Strategie für Cloud geplant?", "weight": 10}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000018', 3, 'Organisation', 'Bereitschaft des Teams', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Management-Unterstützung für Cloud-Projekt?", "weight": 15},
    {"id": "q12", "text": "IT-Team mit Cloud-Kenntnissen?", "weight": 12},
    {"id": "q13", "text": "Budget für Cloud-Migration eingeplant?", "weight": 12},
    {"id": "q14", "text": "Mitarbeiter offen für Veränderung?", "weight": 8},
    {"id": "q15", "text": "Klare Cloud-Strategie definiert?", "weight": 15}
  ]
}'::jsonb);

-- ============================================================================
-- 48. DSGVO SCHNELL-CHECK
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000019',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'DSGVO Schnell-Check',
  'Erfüllen Sie die wichtigsten DSGVO-Anforderungen? 15 kritische Prüfpunkte',
  'dsgvo-schnellcheck',
  '{"threshold": 80, "belowThresholdAction": "urgent", "aboveThresholdAction": "audit"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000019', 1, 'Dokumentation', 'Pflichtdokumente', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Verarbeitungsverzeichnis vorhanden?", "weight": 15},
    {"id": "q2", "text": "Datenschutzerklärung aktuell?", "weight": 12},
    {"id": "q3", "text": "Auftragsverarbeitungsverträge mit Dienstleistern?", "weight": 15},
    {"id": "q4", "text": "Technisch-organisatorische Massnahmen dokumentiert?", "weight": 12},
    {"id": "q5", "text": "Datenschutzfolgenabschätzung (falls erforderlich)?", "weight": 10}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000019', 2, 'Betroffenenrechte', 'Rechte der Betroffenen', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Prozess für Auskunftsanfragen definiert?", "weight": 12},
    {"id": "q7", "text": "Löschroutinen implementiert?", "weight": 12},
    {"id": "q8", "text": "Datenportabilität möglich?", "weight": 8},
    {"id": "q9", "text": "Widerspruchsrecht umsetzbar?", "weight": 8},
    {"id": "q10", "text": "Einwilligungen dokumentiert?", "weight": 12}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000019', 3, 'Sicherheit', 'Datensicherheit', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Verschlüsselung personenbezogener Daten?", "weight": 12},
    {"id": "q12", "text": "Zugriffskontrolle implementiert?", "weight": 12},
    {"id": "q13", "text": "Datenschutzbeauftragter benannt (falls Pflicht)?", "weight": 10},
    {"id": "q14", "text": "Mitarbeiter zum Datenschutz geschult?", "weight": 10},
    {"id": "q15", "text": "Data Breach Prozess definiert?", "weight": 15}
  ]
}'::jsonb);

-- ============================================================================
-- 49. IT-NOTFALLPLAN CHECKLISTE
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'IT-Notfallplan Checkliste',
  'Was fehlt in Ihrem IT-Notfallkonzept? Prüfen Sie Ihre Vorbereitung',
  'it-notfallplan-check',
  '{"threshold": 70, "belowThresholdAction": "workshop", "aboveThresholdAction": "test"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000020', 1, 'Notfall-Dokumentation', 'Haben Sie alles dokumentiert?', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "IT-Notfallplan dokumentiert und aktuell?", "weight": 15},
    {"id": "q2", "text": "Kritische Systeme identifiziert und priorisiert?", "weight": 12},
    {"id": "q3", "text": "RTO (Recovery Time Objective) definiert?", "weight": 12},
    {"id": "q4", "text": "RPO (Recovery Point Objective) definiert?", "weight": 12},
    {"id": "q5", "text": "Wiederherstellungs-Prozeduren dokumentiert?", "weight": 15}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000020', 2, 'Kontakte & Kommunikation', 'Krisenorganisation', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Notfall-Kontaktliste gepflegt?", "weight": 12},
    {"id": "q7", "text": "Eskalationspfade definiert?", "weight": 10},
    {"id": "q8", "text": "Kommunikationsplan für Krisen?", "weight": 10},
    {"id": "q9", "text": "Externe Notfall-Kontakte (IT-Partner)?", "weight": 10},
    {"id": "q10", "text": "Notfall-Kontakte offline verfügbar?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000020', 3, 'Tests & Training', 'Übung macht den Meister', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Jährliche Notfall-Übung durchgeführt?", "weight": 15},
    {"id": "q12", "text": "Backup-Wiederherstellung getestet?", "weight": 15},
    {"id": "q13", "text": "Mitarbeiter in Notfall-Prozessen geschult?", "weight": 10},
    {"id": "q14", "text": "Lessons Learned aus Tests dokumentiert?", "weight": 8},
    {"id": "q15", "text": "Plan nach Tests aktualisiert?", "weight": 10}
  ]
}'::jsonb);

-- ============================================================================
-- 50. WORKPLACE KONFIGURATOR
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Modern Workplace Konfigurator',
  'Konfigurieren Sie den optimalen digitalen Arbeitsplatz für Ihre Mitarbeiter',
  'workplace-konfigurator',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_laptop_basic", "name": "Laptop Standard", "variableName": "laptopBasic", "value": 1200, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_laptop_power", "name": "Laptop Power User", "variableName": "laptopPower", "value": 2000, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_monitor", "name": "Monitor 27 Zoll", "variableName": "monitor", "value": 400, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_docking", "name": "Docking Station", "variableName": "docking", "value": 250, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_headset", "name": "Profi-Headset", "variableName": "headset", "value": 150, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_m365_e3", "name": "M365 E3", "variableName": "m365E3", "value": 36, "unit": "CHF/User/Monat", "category": "Software"},
      {"id": "pv_m365_e5", "name": "M365 E5", "variableName": "m365E5", "value": 57, "unit": "CHF/User/Monat", "category": "Software"}
    ],
    "calculations": [
      {"id": "hardware_standard", "formula": "standardUsers * (laptopBasic + monitor + docking + headset)", "label": "Hardware Standard-User"},
      {"id": "hardware_power", "formula": "powerUsers * (laptopPower + monitor * 2 + docking + headset)", "label": "Hardware Power-User"},
      {"id": "hardware_total", "formula": "hardware_standard + hardware_power", "label": "Hardware Gesamt"},
      {"id": "software_annual", "formula": "(standardUsers * m365E3 + powerUsers * m365E5) * 12", "label": "Software jährlich"},
      {"id": "total_investment", "formula": "hardware_total", "label": "Einmalige Investition"},
      {"id": "annual_cost", "formula": "software_annual + (hardware_total / 4)", "label": "Jährliche Kosten"},
      {"id": "cost_per_user", "formula": "annual_cost / (standardUsers + powerUsers)", "label": "Kosten pro User"}
    ],
    "outputs": [
      {"id": "out_hardware", "label": "Hardware-Investition (einmalig)", "formula": "hardware_total", "format": "currency"},
      {"id": "out_software", "label": "Software-Kosten/Jahr", "formula": "software_annual", "format": "currency"},
      {"id": "out_annual", "label": "Gesamtkosten/Jahr (inkl. Amort.)", "formula": "annual_cost", "format": "currency", "highlight": true},
      {"id": "out_per_user", "label": "Kosten pro Arbeitsplatz/Jahr", "formula": "cost_per_user", "format": "currency"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000050', 1, 'Mitarbeiter-Typen', 'Wer arbeitet wie?', 'form', '{
  "fields": [
    {"id": "standardUsers", "label": "Standard-User (Office, E-Mail, Web)", "type": "number", "required": true, "variableName": "standardUsers", "helpText": "Normale Büroarbeit"},
    {"id": "powerUsers", "label": "Power-User (Entwickler, Designer, Analysten)", "type": "number", "required": true, "variableName": "powerUsers", "helpText": "Leistungsintensive Aufgaben"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000050', 2, 'Arbeitsweise', 'Wie wird gearbeitet?', 'multi_select', '{
  "id": "workStyle",
  "options": [
    {"id": "hybrid", "label": "Hybrid (Büro + Home-Office)", "value": 1},
    {"id": "mobile", "label": "Viel unterwegs", "value": 1},
    {"id": "video", "label": "Häufig Video-Konferenzen", "value": 1},
    {"id": "collab", "label": "Intensive Zusammenarbeit", "value": 1}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000050', 3, 'Ergebnis', 'Ihre Workplace-Konfiguration', 'result', '{"showChart": true, "ctaText": "Workplace-Beratung", "ctaDescription": "Wir konfigurieren Ihren Modern Workplace"}'::jsonb);


