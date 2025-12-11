-- ============================================================================
-- QUIZZES & BRANCHENSPEZIFISCHE LEAD MAGNETS
-- ============================================================================

-- ============================================================================
-- 29. WELCHER CLOUD-TYP SIND SIE?
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '31000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'quiz',
  'Welcher Cloud-Typ sind Sie?',
  'Finden Sie spielerisch heraus, welche Cloud-Strategie am besten zu Ihrem Unternehmen passt',
  'welcher-cloud-typ',
  '{"showResults": true, "shareResults": true}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('31000000-0000-0000-0000-000000000001', 1, 'Datenkontrolle', 'Wie wichtig ist Ihnen die Kontrolle über Ihre Daten?', 'radio_group', '{
  "id": "dataControl",
  "options": [
    {"id": "full", "label": "Volle Kontrolle - Daten bleiben im Haus", "points": {"private": 3, "hybrid": 1, "public": 0}},
    {"id": "some", "label": "Teilweise - Sensibles intern, Rest extern", "points": {"private": 1, "hybrid": 3, "public": 1}},
    {"id": "flexible", "label": "Flexibel - Hauptsache es funktioniert", "points": {"private": 0, "hybrid": 1, "public": 3}}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000001', 2, 'Budget', 'Wie ist Ihr IT-Budget-Ansatz?', 'radio_group', '{
  "id": "budget",
  "options": [
    {"id": "capex", "label": "Investition (CAPEX) - Einmal kaufen", "points": {"private": 3, "hybrid": 2, "public": 0}},
    {"id": "opex", "label": "Betriebskosten (OPEX) - Monatlich zahlen", "points": {"private": 0, "hybrid": 2, "public": 3}},
    {"id": "mixed", "label": "Gemischt - Je nach Anwendungsfall", "points": {"private": 1, "hybrid": 3, "public": 1}}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000001', 3, 'Skalierung', 'Wie schnell müssen Sie skalieren können?', 'radio_group', '{
  "id": "scaling",
  "options": [
    {"id": "stable", "label": "Stabil - Wenig Schwankungen", "points": {"private": 3, "hybrid": 2, "public": 1}},
    {"id": "growth", "label": "Wachstum - Kontinuierlich mehr Bedarf", "points": {"private": 1, "hybrid": 2, "public": 3}},
    {"id": "spikes", "label": "Spitzen - Saisonale Schwankungen", "points": {"private": 0, "hybrid": 2, "public": 3}}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000001', 4, 'Compliance', 'Welche Compliance-Anforderungen haben Sie?', 'radio_group', '{
  "id": "compliance",
  "options": [
    {"id": "strict", "label": "Streng - Regulierte Branche", "points": {"private": 3, "hybrid": 2, "public": 0}},
    {"id": "normal", "label": "Normal - DSGVO und Standard", "points": {"private": 1, "hybrid": 3, "public": 2}},
    {"id": "minimal", "label": "Minimal - Keine besonderen Auflagen", "points": {"private": 0, "hybrid": 1, "public": 3}}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000001', 5, 'Ergebnis', 'Ihr Cloud-Typ', 'quiz_result', '{
  "results": {
    "private": {"title": "Der Private Cloud Champion", "description": "Sie setzen auf maximale Kontrolle und Sicherheit. Eine Private Cloud oder On-Premise Lösung ist ideal für Sie.", "icon": "🏠", "recommendation": "Private Cloud oder dedizierte Infrastruktur"},
    "hybrid": {"title": "Der Hybrid-Stratege", "description": "Sie kombinieren das Beste aus beiden Welten. Eine Hybrid-Cloud-Strategie bietet Ihnen Flexibilität und Kontrolle.", "icon": "⚖️", "recommendation": "Hybrid Cloud mit klarer Datenstrategie"},
    "public": {"title": "Der Cloud-Native", "description": "Sie sind bereit für die Cloud! Public Cloud Services bieten Ihnen maximale Flexibilität und Skalierbarkeit.", "icon": "☁️", "recommendation": "Public Cloud (Azure, AWS, Google)"}
  },
  "ctaText": "Cloud-Strategie besprechen"
}'::jsonb);

-- ============================================================================
-- 30. IT-SECURITY IQ TEST
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '31000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'quiz',
  'IT-Security IQ Test',
  'Wie gut ist Ihr Security-Wissen? Testen Sie sich mit 10 Fragen!',
  'security-iq-test',
  '{"showResults": true, "shareResults": true, "showCorrectAnswers": true}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('31000000-0000-0000-0000-000000000002', 1, 'Frage 1/10', 'Was ist Phishing?', 'radio_group', '{
  "id": "q1",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Eine Art Computervirus", "correct": false},
    {"id": "b", "label": "Betrügerische E-Mails/Websites, die Daten stehlen", "correct": true},
    {"id": "c", "label": "Ein Netzwerk-Protokoll", "correct": false},
    {"id": "d", "label": "Eine Backup-Methode", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 2, 'Frage 2/10', 'Wofür steht MFA?', 'radio_group', '{
  "id": "q2",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Multiple File Access", "correct": false},
    {"id": "b", "label": "Multi-Factor Authentication", "correct": true},
    {"id": "c", "label": "Main Firewall Application", "correct": false},
    {"id": "d", "label": "Managed Firewall Access", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 3, 'Frage 3/10', 'Was ist Ransomware?', 'radio_group', '{
  "id": "q3",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Software zur Datensicherung", "correct": false},
    {"id": "b", "label": "Ein Antivirus-Programm", "correct": false},
    {"id": "c", "label": "Schadsoftware, die Daten verschlüsselt und Lösegeld fordert", "correct": true},
    {"id": "d", "label": "Ein VPN-Protokoll", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 4, 'Frage 4/10', 'Was bedeutet "Zero Trust"?', 'radio_group', '{
  "id": "q4",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Keinem Nutzer/Gerät automatisch vertrauen", "correct": true},
    {"id": "b", "label": "Alle Verbindungen blockieren", "correct": false},
    {"id": "c", "label": "Keine Passwörter verwenden", "correct": false},
    {"id": "d", "label": "Internet komplett abschalten", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 5, 'Frage 5/10', 'Was ist die 3-2-1 Backup-Regel?', 'radio_group', '{
  "id": "q5",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "3 Kopien, 2 Medien, 1 offsite", "correct": true},
    {"id": "b", "label": "Backup um 3, 2 und 1 Uhr nachts", "correct": false},
    {"id": "c", "label": "3 Passwörter, 2 Faktoren, 1 Admin", "correct": false},
    {"id": "d", "label": "3 Server, 2 Firewalls, 1 Switch", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 6, 'Frage 6/10', 'Was ist ein sicheres Passwort?', 'radio_group', '{
  "id": "q6",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Passwort123!", "correct": false},
    {"id": "b", "label": "Firmenname2024", "correct": false},
    {"id": "c", "label": "Ein langer Satz mit Sonderzeichen", "correct": true},
    {"id": "d", "label": "Geburtsdatum rückwärts", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 7, 'Frage 7/10', 'Was ist Social Engineering?', 'radio_group', '{
  "id": "q7",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Manipulation von Menschen zur Informationsgewinnung", "correct": true},
    {"id": "b", "label": "Programmierung sozialer Netzwerke", "correct": false},
    {"id": "c", "label": "Eine Art Firewall", "correct": false},
    {"id": "d", "label": "Team-Building für IT-Abteilungen", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 8, 'Frage 8/10', 'Was ist ein VPN?', 'radio_group', '{
  "id": "q8",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Very Private Network", "correct": false},
    {"id": "b", "label": "Virtuelles privates Netzwerk für sichere Verbindungen", "correct": true},
    {"id": "c", "label": "Virus Protection Network", "correct": false},
    {"id": "d", "label": "Ein E-Mail-Dienst", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 9, 'Frage 9/10', 'Was sollten Sie bei einer verdächtigen E-Mail tun?', 'radio_group', '{
  "id": "q9",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Den Link anklicken um zu prüfen", "correct": false},
    {"id": "b", "label": "Den Anhang öffnen", "correct": false},
    {"id": "c", "label": "Löschen und IT informieren", "correct": true},
    {"id": "d", "label": "An alle Kollegen weiterleiten", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 10, 'Frage 10/10', 'Was ist EDR?', 'radio_group', '{
  "id": "q10",
  "isQuiz": true,
  "options": [
    {"id": "a", "label": "Electronic Data Room", "correct": false},
    {"id": "b", "label": "Endpoint Detection and Response", "correct": true},
    {"id": "c", "label": "External Data Recovery", "correct": false},
    {"id": "d", "label": "Email Delivery Report", "correct": false}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000002', 11, 'Ergebnis', 'Ihr Security IQ', 'quiz_result', '{
  "scoreRanges": [
    {"min": 0, "max": 3, "title": "Security-Anfänger", "description": "Sie haben Verbesserungspotenzial. Ein Security Awareness Training wäre sinnvoll.", "icon": "🔰"},
    {"min": 4, "max": 6, "title": "Security-Bewusst", "description": "Gute Grundlagen! Mit etwas Vertiefung werden Sie zum Profi.", "icon": "🛡️"},
    {"min": 7, "max": 8, "title": "Security-Profi", "description": "Sehr gut! Sie haben solides Security-Wissen.", "icon": "🏆"},
    {"min": 9, "max": 10, "title": "Security-Experte", "description": "Ausgezeichnet! Sie sind ein echter Security-Champion.", "icon": "👑"}
  ],
  "ctaText": "Security Training buchen"
}'::jsonb);

-- ============================================================================
-- 31. HACKER-RISIKO-PROFIL
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '31000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'quiz',
  'Ihr Hacker-Risiko-Profil',
  'Wie attraktiv ist Ihr Unternehmen für Cyberkriminelle? Finden Sie es heraus!',
  'hacker-risiko-profil',
  '{"showResults": true, "shareResults": false}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('31000000-0000-0000-0000-000000000003', 1, 'Branche', 'In welcher Branche sind Sie tätig?', 'radio_group', '{
  "id": "industry",
  "options": [
    {"id": "finance", "label": "Finanzwesen / Versicherung", "risk": 5},
    {"id": "health", "label": "Gesundheitswesen", "risk": 5},
    {"id": "retail", "label": "Handel / E-Commerce", "risk": 4},
    {"id": "industry", "label": "Industrie / Produktion", "risk": 3},
    {"id": "services", "label": "Dienstleistungen", "risk": 2},
    {"id": "other", "label": "Andere", "risk": 2}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000003', 2, 'Grösse', 'Wie gross ist Ihr Unternehmen?', 'radio_group', '{
  "id": "size",
  "options": [
    {"id": "micro", "label": "1-10 Mitarbeiter", "risk": 1},
    {"id": "small", "label": "11-50 Mitarbeiter", "risk": 2},
    {"id": "medium", "label": "51-250 Mitarbeiter", "risk": 3},
    {"id": "large", "label": "250+ Mitarbeiter", "risk": 4}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000003', 3, 'Daten', 'Welche Daten verarbeiten Sie?', 'multi_select', '{
  "id": "data",
  "options": [
    {"id": "personal", "label": "Personenbezogene Daten (Kunden, Mitarbeiter)", "risk": 3},
    {"id": "financial", "label": "Finanzdaten / Kreditkarten", "risk": 5},
    {"id": "health", "label": "Gesundheitsdaten", "risk": 5},
    {"id": "ip", "label": "Geistiges Eigentum / Patente", "risk": 4},
    {"id": "contracts", "label": "Verträge / Geschäftsgeheimnisse", "risk": 3}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000003', 4, 'Online-Präsenz', 'Wie präsent sind Sie online?', 'radio_group', '{
  "id": "online",
  "options": [
    {"id": "minimal", "label": "Nur Website", "risk": 1},
    {"id": "standard", "label": "Website + E-Mail", "risk": 2},
    {"id": "ecommerce", "label": "Online-Shop", "risk": 4},
    {"id": "full", "label": "Vollständig digitalisiert / Cloud", "risk": 3}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000003', 5, 'Ergebnis', 'Ihr Risiko-Profil', 'quiz_result', '{
  "scoreRanges": [
    {"min": 0, "max": 8, "title": "Niedriges Risiko", "description": "Sie sind weniger im Fokus von Hackern, aber das bedeutet nicht, dass Sie sicher sind. Basis-Schutz ist wichtig.", "icon": "🟢", "color": "green"},
    {"min": 9, "max": 14, "title": "Mittleres Risiko", "description": "Sie haben ein durchschnittliches Risikoprofil. Investieren Sie in solide Sicherheitsmassnahmen.", "icon": "🟡", "color": "yellow"},
    {"min": 15, "max": 20, "title": "Erhöhtes Risiko", "description": "Ihr Unternehmen ist interessant für Angreifer. Professionelle Security ist dringend empfohlen.", "icon": "🟠", "color": "orange"},
    {"min": 21, "max": 100, "title": "Hohes Risiko", "description": "Sie sind ein attraktives Ziel für Cyberkriminelle. Handeln Sie jetzt!", "icon": "🔴", "color": "red"}
  ],
  "ctaText": "Security-Analyse anfordern"
}'::jsonb);

-- ============================================================================
-- 32. DIGITALISIERUNGS-SCORE
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '31000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'quiz',
  'Ihr Digitalisierungs-Score',
  'Wie digital ist Ihr Unternehmen im Vergleich zur Branche?',
  'digitalisierungs-score',
  '{"showResults": true, "shareResults": true, "showBenchmark": true}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('31000000-0000-0000-0000-000000000004', 1, 'Arbeitsplatz', 'Wie arbeiten Ihre Mitarbeiter?', 'radio_group', '{
  "id": "workplace",
  "options": [
    {"id": "traditional", "label": "Klassisch im Büro, lokale Software", "score": 1},
    {"id": "hybrid_basic", "label": "Teilweise Home-Office möglich", "score": 2},
    {"id": "hybrid_advanced", "label": "Flexible Arbeit mit Cloud-Tools", "score": 3},
    {"id": "full_digital", "label": "Vollständig digital und ortsunabhängig", "score": 4}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000004', 2, 'Prozesse', 'Wie digital sind Ihre Geschäftsprozesse?', 'radio_group', '{
  "id": "processes",
  "options": [
    {"id": "paper", "label": "Viel Papier, manuelle Abläufe", "score": 1},
    {"id": "partial", "label": "Teilweise digitalisiert", "score": 2},
    {"id": "mostly", "label": "Grösstenteils digital mit Workflows", "score": 3},
    {"id": "full", "label": "Vollständig automatisiert", "score": 4}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000004', 3, 'Kunden', 'Wie interagieren Sie mit Kunden?', 'radio_group', '{
  "id": "customers",
  "options": [
    {"id": "traditional", "label": "Telefon, Fax, persönlich", "score": 1},
    {"id": "email", "label": "Hauptsächlich E-Mail", "score": 2},
    {"id": "portal", "label": "Online-Portal / Self-Service", "score": 3},
    {"id": "omnichannel", "label": "Omnichannel (App, Chat, Portal)", "score": 4}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000004', 4, 'Daten', 'Wie nutzen Sie Ihre Unternehmensdaten?', 'radio_group', '{
  "id": "data",
  "options": [
    {"id": "none", "label": "Kaum systematische Datennutzung", "score": 1},
    {"id": "basic", "label": "Excel-Reports, manuelle Auswertungen", "score": 2},
    {"id": "bi", "label": "BI-Tools und Dashboards", "score": 3},
    {"id": "advanced", "label": "Predictive Analytics / KI", "score": 4}
  ]
}'::jsonb),
('31000000-0000-0000-0000-000000000004', 5, 'Ergebnis', 'Ihr Digitalisierungs-Score', 'quiz_result', '{
  "maxScore": 16,
  "scoreRanges": [
    {"min": 4, "max": 6, "title": "Digital-Einsteiger", "description": "Sie stehen am Anfang der digitalen Transformation. Es gibt viel Potenzial!", "percentage": 25, "benchmark": "Unter dem Durchschnitt"},
    {"min": 7, "max": 10, "title": "Digital-Entwickler", "description": "Sie haben erste Schritte gemacht. Jetzt gilt es, die Digitalisierung zu beschleunigen.", "percentage": 50, "benchmark": "Im Durchschnitt"},
    {"min": 11, "max": 13, "title": "Digital-Fortgeschritten", "description": "Sie sind gut aufgestellt. Fokussieren Sie sich auf Optimierung und Innovation.", "percentage": 75, "benchmark": "Über dem Durchschnitt"},
    {"min": 14, "max": 16, "title": "Digital-Champion", "description": "Exzellent! Sie gehören zu den digitalen Vorreitern.", "percentage": 95, "benchmark": "Top 5% der Branche"}
  ],
  "ctaText": "Digitalisierungs-Roadmap erstellen"
}'::jsonb);

-- ============================================================================
-- 33. ARZTPRAXIS IT-CHECK
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '41000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'Arztpraxis IT-Check',
  'Spezifischer IT-Sicherheitscheck für Arztpraxen und Gesundheitseinrichtungen',
  'arztpraxis-it-check',
  '{"threshold": 75, "belowThresholdAction": "urgent_consultation", "aboveThresholdAction": "certification"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('41000000-0000-0000-0000-000000000001', 1, 'Patientendaten', 'Schutz sensibler Gesundheitsdaten', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Praxis-Software mit Zugriffskontrolle?", "weight": 15},
    {"id": "q2", "text": "Verschlüsselte Datenspeicherung?", "weight": 15},
    {"id": "q3", "text": "Automatisches Logout bei Inaktivität?", "weight": 10},
    {"id": "q4", "text": "Sichere Kommunikation mit Patienten (E-Mail)?", "weight": 10},
    {"id": "q5", "text": "DSGVO-konforme Einwilligungen?", "weight": 12}
  ]
}'::jsonb),
('41000000-0000-0000-0000-000000000001', 2, 'IT-Infrastruktur', 'Grundlegende IT-Sicherheit', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Aktuelle Antivirus-Lösung auf allen PCs?", "weight": 12},
    {"id": "q7", "text": "Regelmässige Backups der Patientendaten?", "weight": 15},
    {"id": "q8", "text": "Backup-Wiederherstellung getestet?", "weight": 10},
    {"id": "q9", "text": "Firewall am Praxis-Netzwerk?", "weight": 10},
    {"id": "q10", "text": "Getrennte WLAN-Netze (Praxis/Patienten)?", "weight": 8}
  ]
}'::jsonb),
('41000000-0000-0000-0000-000000000001', 3, 'Zugangskontrolle', 'Wer hat Zugriff?', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Individuelle Benutzerkonten für alle Mitarbeiter?", "weight": 12},
    {"id": "q12", "text": "Starke Passwörter oder Chip-Karten?", "weight": 10},
    {"id": "q13", "text": "Zugriffsrechte nach Rolle vergeben?", "weight": 10},
    {"id": "q14", "text": "Protokollierung von Datenzugriffen?", "weight": 12},
    {"id": "q15", "text": "Schulung der Mitarbeiter zu IT-Sicherheit?", "weight": 10}
  ]
}'::jsonb);

-- ============================================================================
-- 34. KANZLEI-DIGITALISIERUNG RECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '41000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Kanzlei-Digitalisierung Rechner',
  'Berechnen Sie das Einsparpotenzial durch Digitalisierung Ihrer Anwalts- oder Steuerberaterkanzlei',
  'kanzlei-digitalisierung-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_paper_cost", "name": "Papier-/Druckkosten pro Akte", "variableName": "paperCost", "value": 15, "unit": "CHF", "category": "Papier"},
      {"id": "pv_filing_time", "name": "Ablagezeit pro Akte", "variableName": "filingTime", "value": 0.25, "unit": "Stunden", "category": "Zeit"},
      {"id": "pv_search_time", "name": "Suchzeit pro Dokument", "variableName": "searchTime", "value": 0.1, "unit": "Stunden", "category": "Zeit"},
      {"id": "pv_hourly_rate", "name": "Stundensatz Mitarbeiter", "variableName": "hourlyRate", "value": 80, "unit": "CHF", "category": "Personal"},
      {"id": "pv_dms_cost", "name": "DMS Lizenz", "variableName": "dmsCost", "value": 50, "unit": "CHF/User/Monat", "category": "Software"}
    ],
    "calculations": [
      {"id": "paper_savings", "formula": "monthlyFiles * paperCost * 12", "label": "Papier-Ersparnis"},
      {"id": "filing_savings", "formula": "monthlyFiles * filingTime * hourlyRate * 12 * 0.8", "label": "Ablage-Zeitersparnis"},
      {"id": "search_savings", "formula": "users * 20 * searchTime * hourlyRate * 12 * 0.9", "label": "Such-Zeitersparnis"},
      {"id": "total_savings", "formula": "paper_savings + filing_savings + search_savings", "label": "Gesamtersparnis"},
      {"id": "dms_investment", "formula": "users * dmsCost * 12", "label": "DMS-Kosten"},
      {"id": "net_benefit", "formula": "total_savings - dms_investment", "label": "Netto-Nutzen"},
      {"id": "roi", "formula": "(net_benefit / dms_investment) * 100", "label": "ROI"}
    ],
    "outputs": [
      {"id": "out_savings", "label": "Jährliche Ersparnis", "formula": "total_savings", "format": "currency"},
      {"id": "out_cost", "label": "DMS-Kosten/Jahr", "formula": "dms_investment", "format": "currency"},
      {"id": "out_net", "label": "Netto-Nutzen/Jahr", "formula": "net_benefit", "format": "currency", "highlight": true, "color": "green"},
      {"id": "out_roi", "label": "ROI", "formula": "roi", "format": "percentage"}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('41000000-0000-0000-0000-000000000002', 1, 'Kanzlei-Daten', 'Informationen zu Ihrer Kanzlei', 'form', '{
  "fields": [
    {"id": "users", "label": "Anzahl Mitarbeiter", "type": "number", "required": true, "variableName": "users"},
    {"id": "monthlyFiles", "label": "Neue Akten pro Monat", "type": "number", "required": true, "variableName": "monthlyFiles"},
    {"id": "kanzleiType", "label": "Kanzlei-Typ", "type": "select", "variableName": "kanzleiType", "options": [{"value": "lawyer", "label": "Anwaltskanzlei"}, {"value": "tax", "label": "Steuerberatung"}, {"value": "notary", "label": "Notariat"}]}
  ]
}'::jsonb),
('41000000-0000-0000-0000-000000000002', 2, 'Ergebnis', 'Ihr Digitalisierungs-Potenzial', 'result', '{"showChart": true, "ctaText": "DMS-Beratung", "ctaDescription": "Kostenlose Beratung für Ihre Kanzlei"}'::jsonb);

-- ============================================================================
-- 35. HANDWERKER-IT KOSTENRECHNER
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '41000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'calculator',
  'Handwerker-IT Kostenrechner',
  'Die richtige IT für kleine Handwerksbetriebe - ohne Übertreibung',
  'handwerker-it-rechner',
  '{
    "wizardMode": true,
    "showProgress": true,
    "priceVariables": [
      {"id": "pv_basic_pc", "name": "Büro-PC", "variableName": "basicPC", "value": 800, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_tablet", "name": "Tablet für Monteure", "variableName": "tablet", "value": 500, "unit": "CHF", "category": "Hardware"},
      {"id": "pv_m365_basic", "name": "M365 Business Basic", "variableName": "m365Basic", "value": 6, "unit": "CHF/User/Monat", "category": "Software"},
      {"id": "pv_handwerk_software", "name": "Handwerker-Software", "variableName": "handwerkSoftware", "value": 50, "unit": "CHF/Monat", "category": "Software"},
      {"id": "pv_backup", "name": "Cloud-Backup", "variableName": "backup", "value": 10, "unit": "CHF/Monat", "category": "Sicherheit"}
    ],
    "calculations": [
      {"id": "hardware_cost", "formula": "officePCs * basicPC + fieldWorkers * tablet", "label": "Hardware (einmalig)"},
      {"id": "hardware_annual", "formula": "hardware_cost / 4", "label": "Hardware (amortisiert)"},
      {"id": "software_annual", "formula": "(users * m365Basic + handwerkSoftware + backup) * 12", "label": "Software jährlich"},
      {"id": "total_annual", "formula": "hardware_annual + software_annual", "label": "IT-Kosten/Jahr"},
      {"id": "monthly_cost", "formula": "total_annual / 12", "label": "Monatliche Kosten"}
    ],
    "outputs": [
      {"id": "out_hardware", "label": "Hardware (einmalig)", "formula": "hardware_cost", "format": "currency"},
      {"id": "out_annual", "label": "Jährliche IT-Kosten", "formula": "total_annual", "format": "currency"},
      {"id": "out_monthly", "label": "Monatliche Kosten", "formula": "monthly_cost", "format": "currency", "highlight": true}
    ]
  }'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('41000000-0000-0000-0000-000000000003', 1, 'Betrieb', 'Informationen zu Ihrem Betrieb', 'form', '{
  "fields": [
    {"id": "users", "label": "Anzahl Mitarbeiter total", "type": "number", "required": true, "variableName": "users"},
    {"id": "officePCs", "label": "Büro-Arbeitsplätze", "type": "number", "required": true, "variableName": "officePCs"},
    {"id": "fieldWorkers", "label": "Monteure/Aussendienst", "type": "number", "required": true, "variableName": "fieldWorkers"}
  ]
}'::jsonb),
('41000000-0000-0000-0000-000000000003', 2, 'Ergebnis', 'Ihre IT-Kosten', 'result', '{"showChart": true, "ctaText": "IT-Beratung für Handwerker", "ctaDescription": "Kostenlose Erstberatung"}'::jsonb);

-- ============================================================================
-- 36. GASTRO & HOTEL IT-ASSESSMENT
-- ============================================================================
INSERT INTO lead_magnets (id, tenant_id, type, title, description, slug, config) VALUES
(
  '41000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'checklist',
  'Gastro & Hotel IT-Assessment',
  'IT-Check speziell für Gastronomie und Hotellerie',
  'gastro-hotel-it-check',
  '{"threshold": 65, "belowThresholdAction": "consultation", "aboveThresholdAction": "optimization"}'::jsonb
);

INSERT INTO flow_steps (lead_magnet_id, step_number, title, description, component_type, config) VALUES
('41000000-0000-0000-0000-000000000004', 1, 'Gäste-Technologie', 'Digitale Services für Gäste', 'checkbox_group', '{
  "questions": [
    {"id": "q1", "text": "Gäste-WLAN mit einfachem Login?", "weight": 15},
    {"id": "q2", "text": "Online-Reservierung / Buchung?", "weight": 15},
    {"id": "q3", "text": "Digitale Speisekarte / QR-Code Bestellung?", "weight": 10},
    {"id": "q4", "text": "Kontaktlose Zahlungsmöglichkeiten?", "weight": 12},
    {"id": "q5", "text": "Bewertungs-Management (Google, TripAdvisor)?", "weight": 10}
  ]
}'::jsonb),
('41000000-0000-0000-0000-000000000004', 2, 'Betriebliche IT', 'Interne Systeme', 'checkbox_group', '{
  "questions": [
    {"id": "q6", "text": "Modernes Kassensystem (POS)?", "weight": 15},
    {"id": "q7", "text": "Property Management System (Hotel)?", "weight": 12},
    {"id": "q8", "text": "Warenwirtschaft / Lagerverwaltung?", "weight": 10},
    {"id": "q9", "text": "Digitale Personaleinsatzplanung?", "weight": 10},
    {"id": "q10", "text": "Integration aller Systeme?", "weight": 12}
  ]
}'::jsonb),
('41000000-0000-0000-0000-000000000004', 3, 'IT-Sicherheit', 'Schutz und Compliance', 'checkbox_group', '{
  "questions": [
    {"id": "q11", "text": "Getrennte Netze (Gäste/Betrieb)?", "weight": 15},
    {"id": "q12", "text": "PCI-DSS Compliance (Kreditkarten)?", "weight": 15},
    {"id": "q13", "text": "Regelmässige Backups?", "weight": 12},
    {"id": "q14", "text": "DSGVO-konforme Gästedaten?", "weight": 12},
    {"id": "q15", "text": "IT-Support-Vertrag?", "weight": 8}
  ]
}'::jsonb);


