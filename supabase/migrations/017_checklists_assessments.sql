-- ============================================================================
-- CHECKLISTEN & ASSESSMENTS
-- Security, Cloud, Compliance, Business Continuity
-- ============================================================================

-- ============================================================================
-- 13. CYBER-SECURITY REIFEGRAD-CHECK
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'Cyber-Security Reifegrad-Check',
  'Bewerten Sie die Sicherheit Ihrer IT-Infrastruktur mit 30 kritischen Prüfpunkten',
  'security-reifegrad-check',
  '{"threshold": 70, "belowThresholdAction": "consultation", "aboveThresholdAction": "report"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000010', 1, 'Identitäts-Management', 'Wie sicher sind Ihre Zugänge?', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Multi-Faktor-Authentifizierung für alle Benutzer aktiviert?", "weight": 15},
    {"id": "q2", "text": "Passwort-Richtlinien (min. 12 Zeichen, Komplexität) implementiert?", "weight": 10},
    {"id": "q3", "text": "Single Sign-On (SSO) für Unternehmensanwendungen?", "weight": 8},
    {"id": "q4", "text": "Privileged Access Management für Admin-Accounts?", "weight": 12},
    {"id": "q5", "text": "Regelmässige Access-Reviews durchgeführt?", "weight": 8},
    {"id": "q6", "text": "Automatische Account-Sperrung bei Inaktivität?", "weight": 5}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000010', 2, 'Endpoint-Sicherheit', 'Sind Ihre Geräte geschützt?', 'checkbox_group', '{
  "questions": [
    {"id": "q7", "text": "Next-Gen Antivirus/EDR auf allen Endgeräten?", "weight": 15},
    {"id": "q8", "text": "Automatische Betriebssystem-Updates aktiviert?", "weight": 10},
    {"id": "q9", "text": "Festplattenverschlüsselung auf allen Geräten?", "weight": 10},
    {"id": "q10", "text": "Mobile Device Management (MDM) für Smartphones?", "weight": 8},
    {"id": "q11", "text": "USB-Port-Kontrolle implementiert?", "weight": 5},
    {"id": "q12", "text": "Application Whitelisting im Einsatz?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000010', 3, 'Netzwerk-Sicherheit', 'Wie sicher ist Ihr Netzwerk?', 'checkbox_group', '{
  "questions": [
    {"id": "q13", "text": "Next-Gen Firewall mit Intrusion Prevention?", "weight": 12},
    {"id": "q14", "text": "Netzwerk-Segmentierung implementiert?", "weight": 10},
    {"id": "q15", "text": "VPN mit MFA für Remote-Zugriff?", "weight": 10},
    {"id": "q16", "text": "DNS-Filtering aktiv?", "weight": 8},
    {"id": "q17", "text": "WiFi mit WPA3 oder Enterprise-Authentifizierung?", "weight": 8},
    {"id": "q18", "text": "Netzwerk-Traffic-Monitoring?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000010', 4, 'Datensicherheit', 'Wie schützen Sie Ihre Daten?', 'checkbox_group', '{
  "questions": [
    {"id": "q19", "text": "Regelmässige Backups mit 3-2-1 Regel?", "weight": 15},
    {"id": "q20", "text": "Backup-Wiederherstellung regelmässig getestet?", "weight": 10},
    {"id": "q21", "text": "Datenverschlüsselung at rest und in transit?", "weight": 10},
    {"id": "q22", "text": "Data Loss Prevention (DLP) Lösung?", "weight": 8},
    {"id": "q23", "text": "E-Mail-Verschlüsselung verfügbar?", "weight": 5},
    {"id": "q24", "text": "Sichere Datei-Freigabe-Lösung?", "weight": 5}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000010', 5, 'Awareness & Prozesse', 'Sind Ihre Mitarbeiter geschult?', 'checkbox_group', '{
  "questions": [
    {"id": "q25", "text": "Regelmässige Security Awareness Trainings?", "weight": 10},
    {"id": "q26", "text": "Phishing-Simulationen durchgeführt?", "weight": 8},
    {"id": "q27", "text": "Incident Response Plan dokumentiert?", "weight": 10},
    {"id": "q28", "text": "IT-Sicherheitsrichtlinien vorhanden?", "weight": 8},
    {"id": "q29", "text": "Regelmässige Vulnerability Scans?", "weight": 8},
    {"id": "q30", "text": "Jährliches Security Audit?", "weight": 10}
  ]
}'::jsonb);

-- ============================================================================
-- 14. KI-READINESS ASSESSMENT
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'KI-Readiness Assessment',
  'Ist Ihr Unternehmen bereit für künstliche Intelligenz? Finden Sie es heraus!',
  'ki-readiness-assessment',
  '{"threshold": 60, "belowThresholdAction": "workshop", "aboveThresholdAction": "implementation"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000011', 1, 'Datengrundlage', 'Haben Sie die Daten für KI?', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Strukturierte Daten in zentraler Datenbank vorhanden?", "weight": 15},
    {"id": "q2", "text": "Datenqualität wird regelmässig geprüft?", "weight": 12},
    {"id": "q3", "text": "Historische Daten (min. 2 Jahre) verfügbar?", "weight": 10},
    {"id": "q4", "text": "Daten-Governance-Prozesse definiert?", "weight": 10},
    {"id": "q5", "text": "Datenschutz-konforme Datenverarbeitung?", "weight": 15}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000011', 2, 'Technische Infrastruktur', 'Ist Ihre IT bereit?', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Cloud-Infrastruktur vorhanden oder geplant?", "weight": 12},
    {"id": "q7", "text": "APIs für Datenintegration verfügbar?", "weight": 10},
    {"id": "q8", "text": "Ausreichend Rechenkapazität vorhanden?", "weight": 8},
    {"id": "q9", "text": "Moderne Software-Landschaft (keine Legacy)?", "weight": 10},
    {"id": "q10", "text": "IT-Team mit Cloud/API-Erfahrung?", "weight": 12}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000011', 3, 'Organisation & Kultur', 'Ist Ihre Organisation bereit?', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Management-Support für KI-Initiativen?", "weight": 15},
    {"id": "q12", "text": "Budget für KI-Projekte eingeplant?", "weight": 12},
    {"id": "q13", "text": "Mitarbeiter offen für neue Technologien?", "weight": 10},
    {"id": "q14", "text": "Klare Use-Cases für KI identifiziert?", "weight": 15},
    {"id": "q15", "text": "Bereitschaft für Change-Management?", "weight": 10}
  ]
}'::jsonb);

-- ============================================================================
-- 15. DIGITALISIERUNGS-REIFEGRAD-CHECK
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'Digitalisierungs-Reifegrad Check',
  'Wo steht Ihr Unternehmen auf dem Weg zur Digitalisierung?',
  'digitalisierung-reifegrad',
  '{"threshold": 65, "belowThresholdAction": "roadmap", "aboveThresholdAction": "optimization"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000012', 1, 'Digitale Arbeitsplätze', 'Modern Workplace', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Cloud-basierte Office-Suite (M365, Google)?", "weight": 15},
    {"id": "q2", "text": "Collaboration-Tools (Teams, Slack) im Einsatz?", "weight": 12},
    {"id": "q3", "text": "Mobile Arbeit technisch möglich?", "weight": 12},
    {"id": "q4", "text": "Digitale Signatur-Lösung vorhanden?", "weight": 8},
    {"id": "q5", "text": "Intranet/Mitarbeiter-Portal?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000012', 2, 'Geschäftsprozesse', 'Wie digital sind Ihre Prozesse?', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "ERP-System im Einsatz?", "weight": 12},
    {"id": "q7", "text": "CRM für Kundenmanagement?", "weight": 12},
    {"id": "q8", "text": "Digitale Rechnungsstellung?", "weight": 10},
    {"id": "q9", "text": "Workflow-Automatisierung vorhanden?", "weight": 10},
    {"id": "q10", "text": "Dokumentenmanagement-System?", "weight": 10}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000012', 3, 'Kundeninteraktion', 'Digitale Kundenerfahrung', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Moderne, responsive Website?", "weight": 10},
    {"id": "q12", "text": "Online-Shop oder Self-Service Portal?", "weight": 12},
    {"id": "q13", "text": "Digitale Kommunikationskanäle (Chat, Social)?", "weight": 8},
    {"id": "q14", "text": "Online-Terminbuchung?", "weight": 8},
    {"id": "q15", "text": "Kundenfeedback digital erfasst?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000012', 4, 'Daten & Analytics', 'Datengetriebene Entscheidungen', 'checkbox_group', '{
  "questions": [
    {"id": "q16", "text": "Business Intelligence / Reporting-Tools?", "weight": 12},
    {"id": "q17", "text": "Dashboards für KPIs?", "weight": 10},
    {"id": "q18", "text": "Datenbasierte Entscheidungsfindung?", "weight": 10},
    {"id": "q19", "text": "Analytics für Website/Marketing?", "weight": 8},
    {"id": "q20", "text": "Automatisierte Reports?", "weight": 8}
  ]
}'::jsonb);

-- ============================================================================
-- 16. NIS2 COMPLIANCE CHECK
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'NIS2 Compliance Check',
  'Prüfen Sie, ob Ihr Unternehmen die neue EU-Cybersecurity-Richtlinie erfüllt',
  'nis2-compliance-check',
  '{"threshold": 80, "belowThresholdAction": "urgent_consultation", "aboveThresholdAction": "certification"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000013', 1, 'Betroffenheit', 'Fällt Ihr Unternehmen unter NIS2?', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Kritische Infrastruktur (Energie, Wasser, Gesundheit)?", "weight": 20},
    {"id": "q2", "text": "Mehr als 50 Mitarbeiter ODER > 10 Mio CHF Umsatz?", "weight": 15},
    {"id": "q3", "text": "IT-Dienstleister für kritische Sektoren?", "weight": 15},
    {"id": "q4", "text": "Teil einer grösseren Unternehmensgruppe?", "weight": 10}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000013', 2, 'Risikomanagement', 'Cybersecurity-Massnahmen', 'checkbox_group', '{
  "questions": [
    {"id": "q5", "text": "Cyber-Risiko-Analyse durchgeführt?", "weight": 15},
    {"id": "q6", "text": "Incident Response Plan vorhanden?", "weight": 15},
    {"id": "q7", "text": "Business Continuity Plan dokumentiert?", "weight": 12},
    {"id": "q8", "text": "Regelmässige Security-Audits?", "weight": 12},
    {"id": "q9", "text": "Supply Chain Security bewertet?", "weight": 10}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000013', 3, 'Meldepflichten', 'Sind Sie auf Vorfälle vorbereitet?', 'checkbox_group', '{
  "questions": [
    {"id": "q10", "text": "24-Stunden Meldefähigkeit für Incidents?", "weight": 15},
    {"id": "q11", "text": "Kontakt zu NCSC/Behörden etabliert?", "weight": 10},
    {"id": "q12", "text": "Incident-Dokumentation systematisch?", "weight": 10},
    {"id": "q13", "text": "Kommunikationsplan für Vorfälle?", "weight": 10},
    {"id": "q14", "text": "Regelmässige Incident-Übungen?", "weight": 10}
  ]
}'::jsonb);

-- ============================================================================
-- 17. HOME-OFFICE SECURITY CHECKLISTE
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'Home-Office Security Checkliste',
  'Ist Remote Work in Ihrem Unternehmen sicher eingerichtet?',
  'homeoffice-security-check',
  '{"threshold": 70, "belowThresholdAction": "security_package", "aboveThresholdAction": "audit"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000014', 1, 'Gerätesicherheit', 'Home-Office Geräte', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Firmengeräte für Home-Office bereitgestellt?", "weight": 15},
    {"id": "q2", "text": "Festplattenverschlüsselung aktiviert?", "weight": 12},
    {"id": "q3", "text": "Endpoint Protection auf allen Geräten?", "weight": 15},
    {"id": "q4", "text": "Automatische Updates aktiviert?", "weight": 10},
    {"id": "q5", "text": "Bildschirmsperre nach Inaktivität?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000014', 2, 'Netzwerk & Zugang', 'Sichere Verbindungen', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "VPN für Firmenzugriff obligatorisch?", "weight": 15},
    {"id": "q7", "text": "MFA für alle Remote-Zugänge?", "weight": 15},
    {"id": "q8", "text": "Richtlinien für WLAN-Sicherheit?", "weight": 8},
    {"id": "q9", "text": "Zero-Trust-Ansatz implementiert?", "weight": 12},
    {"id": "q10", "text": "Cloud-Dienste mit SSO integriert?", "weight": 10}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000014', 3, 'Richtlinien & Awareness', 'Schulung und Regeln', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Home-Office-Richtlinie vorhanden?", "weight": 10},
    {"id": "q12", "text": "Mitarbeiter zu Phishing geschult?", "weight": 12},
    {"id": "q13", "text": "Regeln für Datenspeicherung definiert?", "weight": 10},
    {"id": "q14", "text": "IT-Support für Home-Office verfügbar?", "weight": 8},
    {"id": "q15", "text": "Sichere Entsorgung von Dokumenten?", "weight": 5}
  ]
}'::jsonb);

-- ============================================================================
-- 18. BUSINESS CONTINUITY SELBST-AUDIT
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'Business Continuity Selbst-Audit',
  'Ist Ihr Unternehmen auf Krisen und Ausfälle vorbereitet?',
  'business-continuity-audit',
  '{"threshold": 65, "belowThresholdAction": "bcm_workshop", "aboveThresholdAction": "test_drill"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000015', 1, 'Planung', 'BC-Dokumentation', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Business Impact Analyse durchgeführt?", "weight": 15},
    {"id": "q2", "text": "Kritische Geschäftsprozesse identifiziert?", "weight": 12},
    {"id": "q3", "text": "Recovery Time Objectives (RTO) definiert?", "weight": 12},
    {"id": "q4", "text": "Recovery Point Objectives (RPO) definiert?", "weight": 12},
    {"id": "q5", "text": "BC-Plan dokumentiert und aktuell?", "weight": 15}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000015', 2, 'Technische Massnahmen', 'IT-Resilienz', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Redundante Systeme für kritische Anwendungen?", "weight": 15},
    {"id": "q7", "text": "Offsite-Backup vorhanden?", "weight": 15},
    {"id": "q8", "text": "Disaster Recovery Site verfügbar?", "weight": 12},
    {"id": "q9", "text": "Failover-Tests durchgeführt?", "weight": 10},
    {"id": "q10", "text": "Cloud-Backup-Lösung?", "weight": 10}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000015', 3, 'Organisation', 'Krisenorganisation', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Krisenteam definiert?", "weight": 12},
    {"id": "q12", "text": "Kontaktlisten aktuell und verfügbar?", "weight": 10},
    {"id": "q13", "text": "Kommunikationsplan für Krisen?", "weight": 10},
    {"id": "q14", "text": "Regelmässige BC-Übungen?", "weight": 12},
    {"id": "q15", "text": "Lessons Learned Prozess?", "weight": 8}
  ]
}'::jsonb);

-- ============================================================================
-- 19. GREEN IT CHECK
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000016',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'Green IT Nachhaltigkeits-Check',
  'Wie nachhaltig ist Ihre IT? Prüfen Sie Ihren ökologischen Fussabdruck',
  'green-it-check',
  '{"threshold": 60, "belowThresholdAction": "green_roadmap", "aboveThresholdAction": "certification"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000016', 1, 'Hardware', 'Nachhaltige Geräte', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Energieeffiziente Geräte (Energy Star)?", "weight": 12},
    {"id": "q2", "text": "Geräte-Lifecycle > 5 Jahre angestrebt?", "weight": 10},
    {"id": "q3", "text": "Refurbished-Geräte werden genutzt?", "weight": 10},
    {"id": "q4", "text": "Recycling-Programm für Altgeräte?", "weight": 12},
    {"id": "q5", "text": "Reparatur vor Ersatz priorisiert?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000016', 2, 'Rechenzentrum & Cloud', 'Infrastruktur', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Cloud-Provider mit grüner Energie?", "weight": 15},
    {"id": "q7", "text": "Server-Virtualisierung maximiert?", "weight": 12},
    {"id": "q8", "text": "Automatisches Herunterfahren inaktiver Systeme?", "weight": 10},
    {"id": "q9", "text": "Effiziente Kühlung im Serverraum?", "weight": 8},
    {"id": "q10", "text": "PUE-Wert gemessen und optimiert?", "weight": 8}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000016', 3, 'Arbeitsweise', 'Nachhaltiges Arbeiten', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Papierloses Büro angestrebt?", "weight": 10},
    {"id": "q12", "text": "Videokonferenzen statt Reisen?", "weight": 10},
    {"id": "q13", "text": "Home-Office zur CO2-Reduktion?", "weight": 8},
    {"id": "q14", "text": "Energiespar-Einstellungen auf Geräten?", "weight": 8},
    {"id": "q15", "text": "Mitarbeiter für Green IT sensibilisiert?", "weight": 8}
  ]
}'::jsonb);

-- ============================================================================
-- 20. ISO 27001 READINESS CHECK
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '20000000-0000-0000-0000-000000000017',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'ISO 27001 Readiness Check',
  'Wie bereit sind Sie für die ISO 27001 Zertifizierung?',
  'iso27001-readiness',
  '{"threshold": 75, "belowThresholdAction": "gap_analysis", "aboveThresholdAction": "certification_path"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('20000000-0000-0000-0000-000000000017', 1, 'ISMS Grundlagen', 'Informationssicherheits-Managementsystem', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Informationssicherheitspolitik dokumentiert?", "weight": 15},
    {"id": "q2", "text": "ISMS-Scope definiert?", "weight": 12},
    {"id": "q3", "text": "Risikobewertungsmethodik vorhanden?", "weight": 15},
    {"id": "q4", "text": "Statement of Applicability erstellt?", "weight": 12},
    {"id": "q5", "text": "Management-Commitment vorhanden?", "weight": 15}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000017', 2, 'Annex A Controls', 'Sicherheitskontrollen', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Asset-Inventar gepflegt?", "weight": 10},
    {"id": "q7", "text": "Zugriffskontrollen dokumentiert?", "weight": 12},
    {"id": "q8", "text": "Kryptografie-Richtlinien vorhanden?", "weight": 10},
    {"id": "q9", "text": "Physische Sicherheit geregelt?", "weight": 10},
    {"id": "q10", "text": "Incident Management Prozess?", "weight": 12}
  ]
}'::jsonb),
('20000000-0000-0000-0000-000000000017', 3, 'Kontinuierliche Verbesserung', 'PDCA-Zyklus', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Interne Audits durchgeführt?", "weight": 15},
    {"id": "q12", "text": "Management Reviews?", "weight": 12},
    {"id": "q13", "text": "Korrekturmassnahmen dokumentiert?", "weight": 10},
    {"id": "q14", "text": "KPIs für Informationssicherheit?", "weight": 10},
    {"id": "q15", "text": "Regelmässige Schulungen?", "weight": 10}
  ]
}'::jsonb);


