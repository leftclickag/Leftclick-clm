-- ============================================================================
-- ZUSÄTZLICHE KALKULATOREN - Teil 1
-- Geräte, Server, Backup, Security
-- ============================================================================

-- ============================================================================
-- 6. GERÄTE-LIFECYCLE-KOSTENRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Geräte-Lifecycle Kostenrechner',
  'Berechnen Sie die Total Cost of Ownership (TCO) Ihrer IT-Geräte und finden Sie den optimalen Austauschzeitpunkt',
  'geraete-lifecycle-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "expertModeEnabled": true,
    "priceVariables": [
      {"id": "pv_pc_price", "name": "Durchschn. PC-Preis", "variableName": "pcPrice", "value": 1200, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_laptop_price", "name": "Durchschn. Laptop-Preis", "variableName": "laptopPrice", "value": 1500, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_support_hour", "name": "Support-Stunde", "variableName": "supportHour", "value": 120, "unit": "CHF/Stunde", "category": "Support"},
      {"id": "pv_old_support", "name": "Support alte Geräte", "variableName": "oldDeviceSupport", "value": 4, "unit": "Stunden/Jahr", "category": "Support"},
      {"id": "pv_new_support", "name": "Support neue Geräte", "variableName": "newDeviceSupport", "value": 1, "unit": "Stunden/Jahr", "category": "Support"},
      {"id": "pv_productivity_loss", "name": "Produktivitätsverlust alt", "variableName": "productivityLoss", "value": 0.15, "unit": "Prozent", "category": "Produktivität"},
      {"id": "pv_avg_salary", "name": "Durchschn. Stundenlohn", "variableName": "avgHourlyRate", "value": 50, "unit": "CHF/Stunde", "category": "Personal"},
      {"id": "pv_energy_old", "name": "Stromkosten alte Geräte", "variableName": "energyOld", "value": 80, "unit": "CHF/Jahr", "category": "Betrieb"},
      {"id": "pv_energy_new", "name": "Stromkosten neue Geräte", "variableName": "energyNew", "value": 40, "unit": "CHF/Jahr", "category": "Betrieb"}
    ],
    "calculations": [
      {"id": "device_price", "formula": "CASE(deviceType, pc, pcPrice, laptop, laptopPrice, pcPrice)", "label": "Gerätepreis"},
      {"id": "current_support_cost", "formula": "devices * oldDeviceSupport * supportHour", "label": "Aktuelle Supportkosten"},
      {"id": "new_support_cost", "formula": "devices * newDeviceSupport * supportHour", "label": "Supportkosten nach Austausch"},
      {"id": "productivity_cost", "formula": "devices * avgHourlyRate * 2080 * productivityLoss", "label": "Produktivitätsverlust"},
      {"id": "energy_savings", "formula": "devices * (energyOld - energyNew)", "label": "Energieeinsparung"},
      {"id": "total_current_cost", "formula": "current_support_cost + productivity_cost + (devices * energyOld)", "label": "Aktuelle Jahreskosten"},
      {"id": "investment", "formula": "devices * device_price", "label": "Investition"},
      {"id": "annual_savings", "formula": "(current_support_cost - new_support_cost) + productivity_cost + energy_savings", "label": "Jährliche Einsparung"},
      {"id": "payback_months", "formula": "investment / (annual_savings / 12)", "label": "Amortisation"},
      {"id": "roi_3years", "formula": "((annual_savings * 3) - investment) / investment * 100", "label": "ROI 3 Jahre"}
    ],
    "outputs": [
      {"id": "out_current", "label": "Aktuelle jährliche Kosten", "formula": "total_current_cost", "format": "currency"},
      {"id": "out_investment", "label": "Investition für Austausch", "formula": "investment", "format": "currency"},
      {"id": "out_savings", "label": "Jährliche Einsparung", "formula": "annual_savings", "format": "currency", "highlight": true},
      {"id": "out_payback", "label": "Amortisation", "formula": "payback_months", "format": "number", "unit": "Monate"},
      {"id": "out_roi", "label": "ROI über 3 Jahre", "formula": "roi_3years", "format": "percentage"}
    ],
    "charts": [
      {"id": "chart_compare", "type": "bar", "title": "Kostenvergleich", "dataSource": ["total_current_cost", "annual_savings"], "labels": ["Aktuelle Kosten", "Einsparung"], "colors": ["#ef4444", "#22c55e"]}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000006', 1, 'Gerätebestand', 'Informationen zu Ihren aktuellen Geräten', 'form', '{
  "fields": [
    {"id": "devices", "label": "Anzahl Geräte", "type": "number", "required": true, "min": 1, "variableName": "devices", "helpText": "Wie viele Geräte sollen analysiert werden?"},
    {"id": "deviceType", "label": "Gerätetyp", "type": "select", "required": true, "variableName": "deviceType", "options": [{"value": "pc", "label": "Desktop-PCs"}, {"value": "laptop", "label": "Laptops"}, {"value": "mixed", "label": "Gemischt"}]},
    {"id": "avgAge", "label": "Durchschnittliches Alter", "type": "select", "required": true, "variableName": "avgAge", "options": [{"value": "3", "label": "3 Jahre"}, {"value": "4", "label": "4 Jahre"}, {"value": "5", "label": "5+ Jahre"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000006', 2, 'Aktuelle Probleme', 'Welche Probleme haben Sie mit den alten Geräten?', 'multi_select', '{
  "id": "problems",
  "options": [
    {"id": "slow", "label": "Langsame Performance", "description": "Geräte brauchen lange zum Starten", "value": 1},
    {"id": "crashes", "label": "Häufige Abstürze", "description": "Regelmässige Bluescreens oder Freezes", "value": 1},
    {"id": "compatibility", "label": "Software-Kompatibilität", "description": "Neue Software läuft nicht", "value": 1},
    {"id": "security", "label": "Sicherheitsbedenken", "description": "Keine Updates mehr verfügbar", "value": 1}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000006', 3, 'Ergebnis', 'Ihre Geräte-Lifecycle Analyse', 'result', '{"showChart": true, "showBreakdown": true, "ctaText": "Kostenlose Beratung", "ctaDescription": "Wir analysieren Ihren Gerätepark"}'::jsonb);

-- ============================================================================
-- 7. AUSFALLKOSTEN-RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'IT-Ausfallkosten Rechner',
  'Was kostet Sie eine Stunde IT-Ausfall? Berechnen Sie die wahren Kosten von Downtime',
  'ausfallkosten-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_revenue_hour", "name": "Umsatz pro Stunde", "variableName": "revenuePerHour", "value": 0, "unit": "CHF", "category": "Umsatz"},
      {"id": "pv_employees", "name": "Betroffene Mitarbeiter", "variableName": "affectedEmployees", "value": 0, "unit": "Anzahl", "category": "Personal"},
      {"id": "pv_hourly_cost", "name": "Stundenlohn Mitarbeiter", "variableName": "hourlyCost", "value": 50, "unit": "CHF", "category": "Personal"},
      {"id": "pv_reputation", "name": "Reputationsschaden", "variableName": "reputationFactor", "value": 1.5, "unit": "Faktor", "category": "Risiko"},
      {"id": "pv_recovery", "name": "Recovery-Kosten", "variableName": "recoveryCost", "value": 500, "unit": "CHF/Stunde", "category": "IT"}
    ],
    "calculations": [
      {"id": "lost_revenue", "formula": "revenuePerHour * downtimeHours", "label": "Entgangener Umsatz"},
      {"id": "productivity_loss", "formula": "affectedEmployees * hourlyCost * downtimeHours", "label": "Produktivitätsverlust"},
      {"id": "recovery_costs", "formula": "recoveryCost * downtimeHours", "label": "Wiederherstellungskosten"},
      {"id": "direct_costs", "formula": "lost_revenue + productivity_loss + recovery_costs", "label": "Direkte Kosten"},
      {"id": "total_impact", "formula": "direct_costs * reputationFactor", "label": "Gesamtschaden inkl. Reputation"},
      {"id": "cost_per_hour", "formula": "total_impact / downtimeHours", "label": "Kosten pro Stunde"},
      {"id": "annual_risk", "formula": "total_impact * expectedOutages", "label": "Jährliches Risiko"}
    ],
    "outputs": [
      {"id": "out_hourly", "label": "Kosten pro Stunde Ausfall", "formula": "cost_per_hour", "format": "currency", "highlight": true},
      {"id": "out_direct", "label": "Direkte Kosten", "formula": "direct_costs", "format": "currency"},
      {"id": "out_total", "label": "Gesamtschaden (inkl. Reputation)", "formula": "total_impact", "format": "currency"},
      {"id": "out_annual", "label": "Jährliches Ausfallrisiko", "formula": "annual_risk", "format": "currency", "color": "red"}
    ],
    "charts": [
      {"id": "chart_breakdown", "type": "pie", "title": "Kostenverteilung", "dataSource": ["lost_revenue", "productivity_loss", "recovery_costs"], "labels": ["Entgangener Umsatz", "Produktivität", "Recovery"], "colors": ["#ef4444", "#f59e0b", "#3b82f6"]}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000007', 1, 'Unternehmensdaten', 'Grundlegende Informationen', 'form', '{
  "fields": [
    {"id": "revenuePerHour", "label": "Durchschnittlicher Umsatz pro Stunde (CHF)", "type": "number", "required": true, "variableName": "revenuePerHour", "helpText": "Jahresumsatz / 2080 Arbeitsstunden"},
    {"id": "affectedEmployees", "label": "Von IT abhängige Mitarbeiter", "type": "number", "required": true, "variableName": "affectedEmployees"},
    {"id": "downtimeHours", "label": "Typische Ausfalldauer (Stunden)", "type": "number", "required": true, "variableName": "downtimeHours", "min": 1}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000007', 2, 'Ausfallhäufigkeit', 'Wie oft fallen Ihre Systeme aus?', 'radio_group', '{
  "id": "expectedOutages",
  "variableName": "expectedOutages",
  "options": [
    {"id": "rare", "label": "Selten (1x pro Jahr)", "value": 1},
    {"id": "occasional", "label": "Gelegentlich (2-3x pro Jahr)", "value": 2.5},
    {"id": "frequent", "label": "Häufig (4-6x pro Jahr)", "value": 5},
    {"id": "very_frequent", "label": "Sehr häufig (monatlich)", "value": 12}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000007', 3, 'Ergebnis', 'Ihre Ausfallkosten-Analyse', 'result', '{"showChart": true, "showBreakdown": true, "ctaText": "Ausfallrisiko minimieren", "ctaDescription": "Wir zeigen Ihnen, wie Sie Ausfälle verhindern"}'::jsonb);

-- ============================================================================
-- 8. RANSOMWARE-SCHADENSRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Ransomware Schadensrechner',
  'Was kostet Sie ein Ransomware-Angriff wirklich? Berechnen Sie das finanzielle Risiko',
  'ransomware-schadensrechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_ransom_avg", "name": "Durchschn. Lösegeld KMU", "variableName": "avgRansom", "value": 50000, "unit": "CHF", "category": "Lösegeld"},
      {"id": "pv_downtime_days", "name": "Durchschn. Ausfallzeit", "variableName": "avgDowntime", "value": 21, "unit": "Tage", "category": "Ausfall"},
      {"id": "pv_recovery_cost", "name": "Recovery pro Gerät", "variableName": "recoveryCostPerDevice", "value": 500, "unit": "CHF", "category": "Wiederherstellung"},
      {"id": "pv_forensic", "name": "Forensik-Kosten", "variableName": "forensicCost", "value": 15000, "unit": "CHF", "category": "Forensik"},
      {"id": "pv_legal", "name": "Rechtliche Kosten", "variableName": "legalCost", "value": 10000, "unit": "CHF", "category": "Recht"},
      {"id": "pv_reputation", "name": "Reputationsschaden", "variableName": "reputationDamage", "value": 0.1, "unit": "% Jahresumsatz", "category": "Reputation"}
    ],
    "calculations": [
      {"id": "ransom_cost", "formula": "avgRansom", "label": "Lösegeld"},
      {"id": "downtime_cost", "formula": "(annualRevenue / 365) * avgDowntime", "label": "Ausfallkosten"},
      {"id": "recovery_cost", "formula": "devices * recoveryCostPerDevice", "label": "Wiederherstellungskosten"},
      {"id": "professional_cost", "formula": "forensicCost + legalCost", "label": "Professionelle Hilfe"},
      {"id": "reputation_cost", "formula": "annualRevenue * reputationDamage", "label": "Reputationsschaden"},
      {"id": "total_damage", "formula": "ransom_cost + downtime_cost + recovery_cost + professional_cost + reputation_cost", "label": "Gesamtschaden"},
      {"id": "prevention_budget", "formula": "total_damage * 0.1", "label": "Empfohlenes Security-Budget"}
    ],
    "outputs": [
      {"id": "out_total", "label": "Geschätzter Gesamtschaden", "formula": "total_damage", "format": "currency", "highlight": true, "color": "red"},
      {"id": "out_downtime", "label": "Ausfallkosten", "formula": "downtime_cost", "format": "currency"},
      {"id": "out_recovery", "label": "Wiederherstellung", "formula": "recovery_cost", "format": "currency"},
      {"id": "out_reputation", "label": "Reputationsschaden", "formula": "reputation_cost", "format": "currency"},
      {"id": "out_budget", "label": "Empfohlenes Prevention-Budget", "formula": "prevention_budget", "format": "currency", "color": "green"}
    ],
    "charts": [
      {"id": "chart_damage", "type": "pie", "title": "Schadensverteilung", "dataSource": ["ransom_cost", "downtime_cost", "recovery_cost", "professional_cost", "reputation_cost"], "labels": ["Lösegeld", "Ausfall", "Recovery", "Forensik/Recht", "Reputation"], "colors": ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"]}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000008', 1, 'Unternehmensgrösse', 'Für die Schadensberechnung', 'form', '{
  "fields": [
    {"id": "annualRevenue", "label": "Jahresumsatz (CHF)", "type": "number", "required": true, "variableName": "annualRevenue", "placeholder": "z.B. 5000000"},
    {"id": "employees", "label": "Anzahl Mitarbeiter", "type": "number", "required": true, "variableName": "employees"},
    {"id": "devices", "label": "Anzahl IT-Geräte (PCs, Server)", "type": "number", "required": true, "variableName": "devices"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000008', 2, 'Aktuelle Schutzmassnahmen', 'Was haben Sie bereits im Einsatz?', 'multi_select', '{
  "id": "currentProtection",
  "options": [
    {"id": "antivirus", "label": "Antivirus/Endpoint Protection", "value": 0.9},
    {"id": "backup", "label": "Regelmässige Backups", "value": 0.8},
    {"id": "training", "label": "Security Awareness Training", "value": 0.85},
    {"id": "mfa", "label": "Multi-Faktor-Authentifizierung", "value": 0.9},
    {"id": "firewall", "label": "Next-Gen Firewall", "value": 0.85}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000008', 3, 'Ergebnis', 'Ihr Ransomware-Risiko', 'result', '{"showChart": true, "showBreakdown": true, "ctaText": "Jetzt schützen", "ctaDescription": "Kostenlose Security-Analyse Ihrer Infrastruktur"}'::jsonb);

-- ============================================================================
-- 9. BACKUP-KOSTEN-KALKULATOR
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Backup-Kosten Kalkulator',
  'Vergleichen Sie On-Premise vs. Cloud Backup und finden Sie die optimale Lösung',
  'backup-kosten-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_nas_small", "name": "NAS klein (4TB)", "variableName": "nasSmall", "value": 800, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_nas_medium", "name": "NAS mittel (12TB)", "variableName": "nasMedium", "value": 2000, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_nas_large", "name": "NAS gross (24TB+)", "variableName": "nasLarge", "value": 5000, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_cloud_gb", "name": "Cloud Backup pro GB", "variableName": "cloudPerGB", "value": 0.05, "unit": "CHF/GB/Monat", "category": "Cloud"},
      {"id": "pv_cloud_base", "name": "Cloud Grundgebühr", "variableName": "cloudBase", "value": 50, "unit": "CHF/Monat", "category": "Cloud"},
      {"id": "pv_tape_drive", "name": "Tape Drive", "variableName": "tapeDrive", "value": 3000, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_tape_media", "name": "Tape pro Stück", "variableName": "tapeMedia", "value": 50, "unit": "CHF", "category": "Medien"}
    ],
    "calculations": [
      {"id": "onprem_hardware", "formula": "CASE(dataSize, small, nasSmall, medium, nasMedium, large, nasLarge, nasLarge)", "label": "Hardware-Kosten"},
      {"id": "onprem_annual", "formula": "onprem_hardware / 5 + (onprem_hardware * 0.1)", "label": "On-Prem jährlich"},
      {"id": "cloud_monthly", "formula": "cloudBase + (dataGB * cloudPerGB)", "label": "Cloud monatlich"},
      {"id": "cloud_annual", "formula": "cloud_monthly * 12", "label": "Cloud jährlich"},
      {"id": "hybrid_cost", "formula": "(onprem_annual * 0.5) + (cloud_annual * 0.5)", "label": "Hybrid-Kosten"},
      {"id": "savings", "formula": "onprem_annual - cloud_annual", "label": "Ersparnis Cloud vs. On-Prem"},
      {"id": "best_option", "formula": "MIN(onprem_annual, cloud_annual, hybrid_cost)", "label": "Günstigste Option"}
    ],
    "outputs": [
      {"id": "out_onprem", "label": "On-Premise (jährlich)", "formula": "onprem_annual", "format": "currency"},
      {"id": "out_cloud", "label": "Cloud Backup (jährlich)", "formula": "cloud_annual", "format": "currency"},
      {"id": "out_hybrid", "label": "Hybrid-Lösung (jährlich)", "formula": "hybrid_cost", "format": "currency"},
      {"id": "out_best", "label": "Empfohlene Option", "formula": "best_option", "format": "currency", "highlight": true}
    ],
    "charts": [
      {"id": "chart_compare", "type": "bar", "title": "Kostenvergleich", "dataSource": ["onprem_annual", "cloud_annual", "hybrid_cost"], "labels": ["On-Premise", "Cloud", "Hybrid"], "colors": ["#3b82f6", "#22c55e", "#8b5cf6"]}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000009', 1, 'Datenmenge', 'Wie viel Daten müssen gesichert werden?', 'form', '{
  "fields": [
    {"id": "dataGB", "label": "Datenmenge in GB", "type": "number", "required": true, "variableName": "dataGB", "placeholder": "z.B. 500"},
    {"id": "dataSize", "label": "Grössenklasse", "type": "select", "required": true, "variableName": "dataSize", "options": [{"value": "small", "label": "Klein (bis 4 TB)"}, {"value": "medium", "label": "Mittel (4-12 TB)"}, {"value": "large", "label": "Gross (12+ TB)"}]},
    {"id": "growthRate", "label": "Jährliches Datenwachstum", "type": "select", "variableName": "growthRate", "options": [{"value": "10", "label": "10%"}, {"value": "20", "label": "20%"}, {"value": "30", "label": "30%"}]}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000009', 2, 'Anforderungen', 'Welche Backup-Anforderungen haben Sie?', 'multi_select', '{
  "id": "requirements",
  "options": [
    {"id": "offsite", "label": "Offsite-Backup erforderlich", "description": "Backup an zweitem Standort", "value": 1},
    {"id": "encryption", "label": "Verschlüsselung", "description": "Daten müssen verschlüsselt sein", "value": 1},
    {"id": "instant", "label": "Instant Recovery", "description": "Schnelle Wiederherstellung nötig", "value": 1},
    {"id": "retention", "label": "Lange Aufbewahrung", "description": "Compliance-Anforderungen", "value": 1}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000009', 3, 'Ergebnis', 'Ihre Backup-Kostenanalyse', 'result', '{"showChart": true, "showComparison": true, "ctaText": "Backup-Beratung", "ctaDescription": "Wir finden die optimale Backup-Strategie für Sie"}'::jsonb);

-- ============================================================================
-- 10. DATENVERLUST-SCHADENSRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Datenverlust Schadensrechner',
  'Was kostet der Verlust Ihrer Unternehmensdaten? Berechnen Sie den finanziellen Impact',
  'datenverlust-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_recreate_hour", "name": "Daten-Rekonstruktion", "variableName": "recreateHour", "value": 100, "unit": "CHF/Stunde", "category": "Wiederherstellung"},
      {"id": "pv_downtime_hour", "name": "Ausfallkosten", "variableName": "downtimeHour", "value": 500, "unit": "CHF/Stunde", "category": "Ausfall"},
      {"id": "pv_legal_penalty", "name": "DSGVO-Busse", "variableName": "legalPenalty", "value": 50000, "unit": "CHF", "category": "Compliance"},
      {"id": "pv_customer_value", "name": "Kundenwert", "variableName": "customerValue", "value": 1000, "unit": "CHF", "category": "Kunden"}
    ],
    "calculations": [
      {"id": "recreation_cost", "formula": "dataRecreationHours * recreateHour", "label": "Rekonstruktionskosten"},
      {"id": "downtime_cost", "formula": "estimatedDowntime * downtimeHour", "label": "Ausfallkosten"},
      {"id": "customer_loss", "formula": "affectedCustomers * customerValue * 0.1", "label": "Kundenabwanderung"},
      {"id": "compliance_risk", "formula": "hasPersonalData * legalPenalty", "label": "Compliance-Risiko"},
      {"id": "total_damage", "formula": "recreation_cost + downtime_cost + customer_loss + compliance_risk", "label": "Gesamtschaden"},
      {"id": "backup_investment", "formula": "total_damage * 0.05", "label": "Empfohlene Backup-Investition"}
    ],
    "outputs": [
      {"id": "out_total", "label": "Potenzieller Gesamtschaden", "formula": "total_damage", "format": "currency", "highlight": true, "color": "red"},
      {"id": "out_recreation", "label": "Daten-Rekonstruktion", "formula": "recreation_cost", "format": "currency"},
      {"id": "out_downtime", "label": "Produktivitätsverlust", "formula": "downtime_cost", "format": "currency"},
      {"id": "out_customers", "label": "Kundenabwanderung", "formula": "customer_loss", "format": "currency"},
      {"id": "out_investment", "label": "Empfohlene Backup-Investition", "formula": "backup_investment", "format": "currency", "color": "green"}
    ],
    "charts": [
      {"id": "chart_damage", "type": "pie", "title": "Schadensverteilung", "dataSource": ["recreation_cost", "downtime_cost", "customer_loss", "compliance_risk"], "labels": ["Rekonstruktion", "Ausfall", "Kunden", "Compliance"], "colors": ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000010', 1, 'Datenbestand', 'Welche Daten sind gefährdet?', 'form', '{
  "fields": [
    {"id": "dataRecreationHours", "label": "Geschätzte Rekonstruktionszeit (Stunden)", "type": "number", "required": true, "variableName": "dataRecreationHours", "helpText": "Wie lange würde es dauern, die Daten neu zu erstellen?"},
    {"id": "estimatedDowntime", "label": "Geschätzte Ausfallzeit (Stunden)", "type": "number", "required": true, "variableName": "estimatedDowntime"},
    {"id": "affectedCustomers", "label": "Betroffene Kunden", "type": "number", "required": true, "variableName": "affectedCustomers"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000010', 2, 'Datentyp', 'Welche Daten sind betroffen?', 'multi_select', '{
  "id": "dataTypes",
  "options": [
    {"id": "personal", "label": "Personenbezogene Daten", "description": "DSGVO-relevant", "variableName": "hasPersonalData", "value": 1},
    {"id": "financial", "label": "Finanzdaten", "description": "Buchhaltung, Rechnungen", "value": 1},
    {"id": "contracts", "label": "Verträge", "description": "Kunden- und Lieferantenverträge", "value": 1},
    {"id": "ip", "label": "Geistiges Eigentum", "description": "Entwicklung, Patente", "value": 1}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000010', 3, 'Ergebnis', 'Ihr Datenverlust-Risiko', 'result', '{"showChart": true, "showBreakdown": true, "ctaText": "Datenverlust verhindern", "ctaDescription": "Kostenlose Backup-Analyse"}'::jsonb);

-- ============================================================================
-- 11. ENDPOINT SECURITY ROI RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Endpoint Security ROI Rechner',
  'Berechnen Sie den Return on Investment für moderne Endpoint-Sicherheit',
  'endpoint-security-roi',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_basic_av", "name": "Basis Antivirus", "variableName": "basicAV", "value": 3, "unit": "CHF/Gerät/Monat", "category": "Lizenzen"},
      {"id": "pv_edr", "name": "EDR-Lösung", "variableName": "edrPrice", "value": 8, "unit": "CHF/Gerät/Monat", "category": "Lizenzen"},
      {"id": "pv_xdr", "name": "XDR-Lösung", "variableName": "xdrPrice", "value": 15, "unit": "CHF/Gerät/Monat", "category": "Lizenzen"},
      {"id": "pv_incident_cost", "name": "Kosten pro Incident", "variableName": "incidentCost", "value": 5000, "unit": "CHF", "category": "Incidents"},
      {"id": "pv_incident_reduction", "name": "Incident-Reduktion EDR", "variableName": "incidentReduction", "value": 0.7, "unit": "Prozent", "category": "Wirkung"}
    ],
    "calculations": [
      {"id": "basic_cost", "formula": "endpoints * basicAV * 12", "label": "Basis AV jährlich"},
      {"id": "edr_cost", "formula": "endpoints * edrPrice * 12", "label": "EDR jährlich"},
      {"id": "xdr_cost", "formula": "endpoints * xdrPrice * 12", "label": "XDR jährlich"},
      {"id": "current_incident_cost", "formula": "incidentsPerYear * incidentCost", "label": "Aktuelle Incident-Kosten"},
      {"id": "prevented_incidents", "formula": "incidentsPerYear * incidentReduction", "label": "Verhinderte Incidents"},
      {"id": "savings", "formula": "prevented_incidents * incidentCost", "label": "Einsparung"},
      {"id": "investment", "formula": "edr_cost - basic_cost", "label": "Zusätzliche Investition"},
      {"id": "roi", "formula": "((savings - investment) / investment) * 100", "label": "ROI"}
    ],
    "outputs": [
      {"id": "out_current", "label": "Aktuelle Security-Kosten", "formula": "basic_cost", "format": "currency"},
      {"id": "out_edr", "label": "EDR-Lösung Kosten", "formula": "edr_cost", "format": "currency"},
      {"id": "out_savings", "label": "Geschätzte Einsparung", "formula": "savings", "format": "currency", "color": "green"},
      {"id": "out_roi", "label": "ROI", "formula": "roi", "format": "percentage", "highlight": true}
    ],
    "charts": [
      {"id": "chart_compare", "type": "bar", "title": "Kostenvergleich", "dataSource": ["basic_cost", "edr_cost", "xdr_cost"], "labels": ["Basis AV", "EDR", "XDR"], "colors": ["#ef4444", "#f59e0b", "#22c55e"]}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000011', 1, 'IT-Umgebung', 'Ihre aktuelle Situation', 'form', '{
  "fields": [
    {"id": "endpoints", "label": "Anzahl Endgeräte", "type": "number", "required": true, "variableName": "endpoints"},
    {"id": "incidentsPerYear", "label": "Security-Incidents pro Jahr", "type": "number", "required": true, "variableName": "incidentsPerYear", "helpText": "Malware, Phishing, etc."}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000011', 2, 'Aktuelle Lösung', 'Was nutzen Sie heute?', 'radio_group', '{
  "id": "currentSolution",
  "variableName": "currentSolution",
  "options": [
    {"id": "none", "label": "Keine Lösung", "value": 0},
    {"id": "free", "label": "Kostenlose Lösung", "value": 0},
    {"id": "basic", "label": "Basis Antivirus", "value": 1},
    {"id": "edr", "label": "Bereits EDR im Einsatz", "value": 2}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000011', 3, 'Ergebnis', 'Ihr Endpoint Security ROI', 'result', '{"showChart": true, "ctaText": "Security-Beratung", "ctaDescription": "Kostenlose Analyse Ihrer Endpoint-Sicherheit"}'::jsonb);

-- ============================================================================
-- 12. WEBSITE-PERFORMANCE KOSTENRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '10000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Website-Performance Kostenrechner',
  'Eine langsame Website kostet Sie Kunden und Umsatz. Berechnen Sie den Impact.',
  'website-performance-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_bounce_rate", "name": "Absprungrate pro Sekunde", "variableName": "bouncePerSecond", "value": 0.07, "unit": "Prozent", "category": "Conversion"},
      {"id": "pv_conversion_rate", "name": "Durchschn. Conversion Rate", "variableName": "conversionRate", "value": 0.03, "unit": "Prozent", "category": "Conversion"},
      {"id": "pv_order_value", "name": "Durchschn. Bestellwert", "variableName": "avgOrderValue", "value": 150, "unit": "CHF", "category": "Umsatz"}
    ],
    "calculations": [
      {"id": "lost_visitors", "formula": "monthlyVisitors * (loadTime - 2) * bouncePerSecond", "label": "Verlorene Besucher"},
      {"id": "lost_conversions", "formula": "lost_visitors * conversionRate", "label": "Verlorene Conversions"},
      {"id": "lost_revenue_monthly", "formula": "lost_conversions * avgOrderValue", "label": "Entgangener Umsatz/Monat"},
      {"id": "lost_revenue_annual", "formula": "lost_revenue_monthly * 12", "label": "Entgangener Umsatz/Jahr"},
      {"id": "optimization_roi", "formula": "lost_revenue_annual / optimizationCost", "label": "ROI Optimierung"}
    ],
    "outputs": [
      {"id": "out_visitors", "label": "Verlorene Besucher/Monat", "formula": "lost_visitors", "format": "number"},
      {"id": "out_conversions", "label": "Verlorene Verkäufe/Monat", "formula": "lost_conversions", "format": "number"},
      {"id": "out_monthly", "label": "Entgangener Umsatz/Monat", "formula": "lost_revenue_monthly", "format": "currency", "color": "red"},
      {"id": "out_annual", "label": "Entgangener Umsatz/Jahr", "formula": "lost_revenue_annual", "format": "currency", "highlight": true, "color": "red"}
    ],
    "charts": [
      {"id": "chart_impact", "type": "bar", "title": "Umsatzverlust", "dataSource": ["lost_revenue_monthly", "lost_revenue_annual"], "labels": ["Monatlich", "Jährlich"], "colors": ["#f59e0b", "#ef4444"]}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('10000000-0000-0000-0000-000000000012', 1, 'Website-Daten', 'Ihre aktuellen Website-Kennzahlen', 'form', '{
  "fields": [
    {"id": "monthlyVisitors", "label": "Monatliche Besucher", "type": "number", "required": true, "variableName": "monthlyVisitors"},
    {"id": "loadTime", "label": "Aktuelle Ladezeit (Sekunden)", "type": "number", "required": true, "variableName": "loadTime", "min": 1, "max": 20},
    {"id": "avgOrderValue", "label": "Durchschn. Bestellwert (CHF)", "type": "number", "required": true, "variableName": "avgOrderValue"}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000012', 2, 'Optimierung', 'Was würde eine Optimierung kosten?', 'radio_group', '{
  "id": "optimizationCost",
  "variableName": "optimizationCost",
  "options": [
    {"id": "small", "label": "Kleine Optimierung", "description": "CHF 2000 - Caching, Bilder", "value": 2000},
    {"id": "medium", "label": "Mittlere Optimierung", "description": "CHF 5000 - Server, CDN", "value": 5000},
    {"id": "large", "label": "Komplette Überarbeitung", "description": "CHF 15000 - Neues Hosting", "value": 15000}
  ]
}'::jsonb),
('10000000-0000-0000-0000-000000000012', 3, 'Ergebnis', 'Ihr Website-Performance Impact', 'result', '{"showChart": true, "ctaText": "Website analysieren", "ctaDescription": "Kostenloser Performance-Check"}'::jsonb);


