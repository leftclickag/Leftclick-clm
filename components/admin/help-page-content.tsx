"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { Permission } from "@/types/permissions";
import {
  Magnet,
  TrendingUp,
  Users,
  Mail,
  Bell,
  LineChart,
  Globe,
  Shield,
  FileText,
  Sparkles,
  Zap,
  Target,
  MousePointer,
  Share2,
  Code,
  BookOpen,
  HelpCircle,
  CheckCircle,
  Calculator,
  FileCheck,
  MessageSquare,
  Settings,
  Palette,
  Play,
  Award,
  BarChart3,
  Languages,
  Cookie,
  Download,
  Eye,
  Filter,
  GitBranch,
  Rocket,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type HelpSection = {
  id: string;
  title: string;
  icon: any;
  color: string;
  requiredPermission?: Permission; // Optional - wenn nicht gesetzt, für alle sichtbar
  subsections: any[];
};

export function HelpPageContent() {
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: permissionsData } = trpc.permissions.getCurrentUserPermissions.useQuery();

  useEffect(() => {
    if (permissionsData?.permissions) {
      setUserPermissions(permissionsData.permissions);
      setIsLoading(false);
    }
  }, [permissionsData]);

  const hasPermission = (permission?: Permission) => {
    if (!permission) return true; // Keine Berechtigung erforderlich
    return userPermissions.includes(permission);
  };

  const sections: HelpSection[] = [
    {
      id: "overview",
      title: "Übersicht",
      icon: BookOpen,
      color: "purple",
      subsections: [
        {
          title: "Was ist LeftClick CLM?",
          content: `LeftClick CLM ist eine moderne Lead-Management-Plattform, die speziell für IT-Dienstleister entwickelt wurde. Mit dieser Plattform können Sie ansprechende Lead-Magnete erstellen, Besucher in Leads konvertieren und diese automatisch qualifizieren und nachverfolgen.`,
        },
        {
          title: "Hauptfunktionen",
          list: [
            "Lead-Magnete erstellen (E-Books, Checklisten, Kalkulatoren, Quizzes)",
            "Widgets in Ihre Website einbetten",
            "Leads automatisch sammeln und bewerten",
            "E-Mail-Automationen einrichten",
            "Detaillierte Analytics und Reporting",
            "A/B-Testing für Optimierung",
            "Multi-Language Support",
            "DSGVO-konforme Datenverwaltung",
          ],
        },
      ],
    },
    {
      id: "lead-magnets",
      title: "Lead-Magnete",
      icon: Magnet,
      color: "cyan",
      requiredPermission: "lead_magnets.view",
      subsections: [
        {
          title: "Was sind Lead-Magnete?",
          content: `Lead-Magnete sind wertvolle Inhalte oder Tools, die Sie Ihren Website-Besuchern im Austausch gegen deren Kontaktdaten anbieten. Sie helfen Ihnen, qualifizierte Leads zu generieren und Ihre Marketing-Pipeline zu füllen.`,
        },
        {
          title: "Verfügbare Typen",
          types: [
            {
              type: "E-Book",
              icon: FileText,
              description: "Digitale Ratgeber oder Whitepaper als PDF zum Download. Ideal für detaillierte Informationen und Best Practices.",
            },
            {
              type: "Checkliste",
              icon: FileCheck,
              description: "Interaktive Checklisten, die Benutzer Schritt für Schritt durch einen Prozess führen.",
            },
            {
              type: "Kalkulator",
              icon: Calculator,
              description: "Interaktive Rechner (z.B. ROI-Rechner, Kostenrechner). Perfekt für IT-Dienstleister, um Einsparpotenziale zu zeigen.",
            },
            {
              type: "Quiz",
              icon: MessageSquare,
              description: "Interaktive Quizze zur Lead-Qualifizierung und Engagement.",
            },
          ],
        },
        {
          title: "Lead-Magnet erstellen",
          steps: [
            {
              step: "Navigieren Sie zu 'Lead Magnets' im Admin-Bereich",
              detail: "Klicken Sie auf den Link in der Sidebar",
            },
            {
              step: "Klicken Sie auf 'Neuer Lead-Magnet'",
              detail: "Wählen Sie den gewünschten Typ aus",
            },
            {
              step: "Füllen Sie die Basis-Informationen aus",
              detail: "Titel, Beschreibung, Slug (URL-Name)",
            },
            {
              step: "Konfigurieren Sie die Flow-Steps",
              detail: "Definieren Sie die einzelnen Schritte Ihres Lead-Magnets",
            },
            {
              step: "Passen Sie das Branding an",
              detail: "Farben, Logo, Button-Stile",
            },
            {
              step: "Aktivieren und testen",
              detail: "Schalten Sie den Lead-Magnet live und testen Sie ihn",
            },
          ],
          requiredPermission: "lead_magnets.create",
        },
        {
          title: "Flow-Steps konfigurieren",
          content: `Jeder Lead-Magnet besteht aus mehreren Flow-Steps (Schritten). Sie können verschiedene Komponenten verwenden:`,
          list: [
            "Willkommensseite - Begrüßung und Einführung",
            "Formularfelder - Sammeln von Kontaktdaten und Informationen",
            "Fragen - Multiple Choice, Text, Skala",
            "Berechnungen - Für Kalkulatoren",
            "Ergebnisseite - Präsentation der Ergebnisse",
            "CTA (Call-to-Action) - Nächste Schritte",
          ],
          requiredPermission: "lead_magnets.edit",
        },
      ],
    },
    {
      id: "calculator",
      title: "Kalkulator-Widget",
      icon: Calculator,
      color: "emerald",
      requiredPermission: "lead_magnets.view",
      subsections: [
        {
          title: "Kalkulator erstellen",
          content: `Der Kalkulator ist eines der mächtigsten Features. Sie können komplexe Berechnungen durchführen und personalisierte Ergebnisse liefern.`,
        },
        {
          title: "Komponenten eines Kalkulators",
          list: [
            "Variablen - Eingabefelder für Benutzer (z.B. Mitarbeiteranzahl, Budget)",
            "Preistabellen - Vordefinierte Pricing-Strukturen",
            "Berechnungen - Formeln zur Berechnung von Werten",
            "Bedingungen - If/Then-Logik für bedingte Berechnungen",
            "Ausgaben - Formatierte Darstellung der Ergebnisse",
          ],
        },
        {
          title: "Beispiel: IT-Kosten-Rechner",
          example: {
            variables: [
              "Anzahl Mitarbeiter (number)",
              "Monatliches IT-Budget (currency)",
              "Anzahl Server (number)",
            ],
            calculations: [
              "Kosten pro Mitarbeiter = IT-Budget / Mitarbeiter",
              "Einsparpotenzial = Kosten * 0.3",
              "ROI nach 12 Monaten = Einsparpotenzial * 12",
            ],
            outputs: [
              "Ihre aktuellen Kosten pro Mitarbeiter: €X",
              "Mögliches Einsparpotenzial: €Y pro Monat",
              "ROI nach 1 Jahr: €Z",
            ],
          },
        },
      ],
    },
    {
      id: "embedding",
      title: "Widget einbetten",
      icon: Code,
      color: "blue",
      requiredPermission: "lead_magnets.view",
      subsections: [
        {
          title: "Embed-Arten",
          types: [
            {
              type: "iFrame",
              icon: Share2,
              description: "Einfaches Einbetten als iFrame. Kopieren Sie einfach den Code und fügen Sie ihn in Ihre Website ein.",
            },
            {
              type: "Popup/Modal",
              icon: Eye,
              description: "Widget erscheint als Overlay über Ihrer Seite. Ideal für Exit-Intent oder CTA-Buttons.",
            },
            {
              type: "Slide-In",
              icon: MousePointer,
              description: "Widget gleitet von der Seite herein. Weniger aufdringlich als Popup.",
            },
            {
              type: "Inline",
              icon: Share2,
              description: "Widget wird direkt im Content Ihrer Seite eingebettet.",
            },
          ],
        },
        {
          title: "Embed-Code generieren",
          steps: [
            {
              step: "Öffnen Sie Ihren Lead-Magnet",
              detail: "Klicken Sie auf 'Bearbeiten'",
            },
            {
              step: "Wechseln Sie zum Tab 'Einbetten'",
              detail: "Oder nutzen Sie den Embed-Code-Generator",
            },
            {
              step: "Wählen Sie die Embed-Art",
              detail: "iFrame, Popup, Slide-In oder Inline",
            },
            {
              step: "Konfigurieren Sie die Optionen",
              detail: "Größe, Position, Trigger-Bedingungen",
            },
            {
              step: "Kopieren Sie den generierten Code",
              detail: "Fügen Sie ihn in Ihre Website ein (vor dem </body> Tag)",
            },
          ],
        },
      ],
    },
    {
      id: "ab-testing",
      title: "A/B Testing",
      icon: GitBranch,
      color: "purple",
      requiredPermission: "lead_magnets.edit",
      subsections: [
        {
          title: "Was ist A/B Testing?",
          content: `A/B Testing ermöglicht es Ihnen, verschiedene Varianten Ihres Lead-Magnets zu testen, um herauszufinden, welche besser konvertiert. Sie können z.B. unterschiedliche Headlines, Farben oder Flow-Strukturen testen.`,
        },
        {
          title: "A/B Test erstellen",
          steps: [
            {
              step: "Öffnen Sie Ihren Lead-Magnet",
              detail: "Wählen Sie den zu testenden Lead-Magnet aus",
            },
            {
              step: "Erstellen Sie eine Variante",
              detail: "Klicken Sie auf 'Variante hinzufügen'",
            },
            {
              step: "Konfigurieren Sie Traffic-Split",
              detail: "Z.B. 50% Control, 50% Variant A",
            },
            {
              step: "Passen Sie die Variante an",
              detail: "Ändern Sie Headline, Design, Flow, etc.",
            },
            {
              step: "Aktivieren und Traffic sammeln",
              detail: "Lassen Sie den Test laufen (mindestens 100+ Impressions)",
            },
            {
              step: "Ergebnisse analysieren",
              detail: "Prüfen Sie Conversion-Rate und statistische Signifikanz",
            },
          ],
        },
      ],
    },
    {
      id: "lead-scoring",
      title: "Lead Scoring",
      icon: Target,
      color: "orange",
      requiredPermission: "leads.view",
      subsections: [
        {
          title: "Was ist Lead Scoring?",
          content: `Lead Scoring bewertet automatisch die Qualität Ihrer Leads basierend auf deren Antworten und Verhalten. Leads werden in drei Kategorien eingeteilt: Hot 🔥, Warm ☀️ und Cold ❄️.`,
        },
        {
          title: "Lead-Grades",
          grades: [
            {
              grade: "Hot 🔥",
              score: "80+ Punkte",
              action: "Sofort kontaktieren! Hohes Conversion-Potenzial.",
            },
            {
              grade: "Warm ☀️",
              score: "40-79 Punkte",
              action: "Follow-up innerhalb von 24-48h. Nurturing empfohlen.",
            },
            {
              grade: "Cold ❄️",
              score: "<40 Punkte",
              action: "In Drip-Campaign aufnehmen. Langfristiges Nurturing.",
            },
          ],
        },
      ],
    },
    {
      id: "analytics",
      title: "Analytics & Tracking",
      icon: BarChart3,
      color: "emerald",
      requiredPermission: "analytics.view",
      subsections: [
        {
          title: "Analytics Dashboard",
          content: `Das Analytics Dashboard gibt Ihnen einen vollständigen Überblick über die Performance Ihrer Lead-Magnete.`,
        },
        {
          title: "Wichtige Metriken",
          metrics: [
            {
              metric: "Impressions",
              description: "Wie oft wurde der Lead-Magnet angezeigt?",
            },
            {
              metric: "Starts",
              description: "Wie viele Besucher haben begonnen?",
            },
            {
              metric: "Completions",
              description: "Wie viele haben abgeschlossen?",
            },
            {
              metric: "Conversion Rate",
              description: "Completions / Starts (in %)",
            },
            {
              metric: "Avg. Time",
              description: "Durchschnittliche Bearbeitungszeit",
            },
          ],
        },
      ],
    },
    {
      id: "users",
      title: "Benutzerverwaltung",
      icon: Users,
      color: "blue",
      requiredPermission: "users.view",
      subsections: [
        {
          title: "Benutzer verwalten",
          content: `Als Administrator können Sie Benutzer erstellen, bearbeiten und Rollen zuweisen.`,
        },
        {
          title: "Benutzerrollen",
          list: [
            "Super Admin - Vollzugriff auf alle Funktionen",
            "Admin - Erweiterte Berechtigungen für Lead-Management",
            "User - Basis-Berechtigungen zum Ansehen von Daten",
          ],
        },
      ],
    },
    {
      id: "settings",
      title: "Einstellungen",
      icon: Settings,
      color: "slate",
      requiredPermission: "settings.view",
      subsections: [
        {
          title: "System-Einstellungen",
          content: `Konfigurieren Sie E-Mail-Server, SSO, Branding und weitere System-Einstellungen.`,
        },
      ],
    },
    {
      id: "best-practices",
      title: "Best Practices",
      icon: Award,
      color: "amber",
      subsections: [
        {
          title: "Lead-Magnet Optimierung",
          tips: [
            {
              tip: "Keep it short",
              description: "Maximal 5-7 Steps. Benutzer verlieren bei längeren Flows das Interesse.",
            },
            {
              tip: "Value first, contact last",
              description: "Sammeln Sie Kontaktdaten erst am Ende, nachdem Sie Wert geliefert haben.",
            },
            {
              tip: "Clear CTAs",
              description: "Verwenden Sie klare Handlungsaufforderungen wie 'Jetzt berechnen' statt 'Weiter'.",
            },
            {
              tip: "Visual Progress",
              description: "Zeigen Sie immer den Fortschritt (Progress Bar) an.",
            },
            {
              tip: "Mobile First",
              description: "70% der Benutzer sind auf Mobile. Testen Sie immer auf Smartphone.",
            },
          ],
        },
      ],
    },
  ];

  // Filtere Sektionen basierend auf Berechtigungen
  const visibleSections = sections.filter(section => hasPermission(section.requiredPermission));

  // Filtere Subsections innerhalb jeder Sektion
  const filteredSections = visibleSections.map(section => ({
    ...section,
    subsections: section.subsections.filter((subsection: any) => 
      hasPermission(subsection.requiredPermission)
    ),
  }));

  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    purple: {
      bg: "bg-purple-500/10",
      icon: "text-purple-500",
      border: "border-purple-500/20",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      icon: "text-cyan-500",
      border: "border-cyan-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-500",
      border: "border-emerald-500/20",
    },
    blue: {
      bg: "bg-blue-500/10",
      icon: "text-blue-500",
      border: "border-blue-500/20",
    },
    orange: {
      bg: "bg-orange-500/10",
      icon: "text-orange-500",
      border: "border-orange-500/20",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      icon: "text-yellow-500",
      border: "border-yellow-500/20",
    },
    pink: {
      bg: "bg-pink-500/10",
      icon: "text-pink-500",
      border: "border-pink-500/20",
    },
    indigo: {
      bg: "bg-indigo-500/10",
      icon: "text-indigo-500",
      border: "border-indigo-500/20",
    },
    green: {
      bg: "bg-green-500/10",
      icon: "text-green-500",
      border: "border-green-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      icon: "text-red-500",
      border: "border-red-500/20",
    },
    violet: {
      bg: "bg-violet-500/10",
      icon: "text-violet-500",
      border: "border-violet-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      icon: "text-amber-500",
      border: "border-amber-500/20",
    },
    slate: {
      bg: "bg-slate-500/10",
      icon: "text-slate-500",
      border: "border-slate-500/20",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-500">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Hilfe & Dokumentation</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg mt-2">
          Vollständige Anleitung zur Nutzung von LeftClick CLM
        </p>
      </div>

      {/* Quick Navigation */}
      <Card className="animate-fade-in border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-500" />
            Schnellnavigation
          </CardTitle>
          <CardDescription>Springe direkt zum gewünschten Thema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSections.map((section) => {
              const colors = colorClasses[section.color];
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${colors.border} ${colors.bg} hover:scale-105 transition-all duration-300`}
                >
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                  <span className="text-sm font-medium">{section.title}</span>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      {filteredSections.map((section, sectionIndex) => {
        const colors = colorClasses[section.color];
        const Icon = section.icon;

        return (
          <div
            key={section.id}
            id={section.id}
            className="animate-fade-in scroll-mt-8"
            style={{ animationDelay: `${sectionIndex * 0.1}s` }}
          >
            <Card className={`border-2 ${colors.border}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <ChevronRight className={`h-5 w-5 ${colors.icon}`} />
                      {subsection.title}
                    </h3>

                    {subsection.content && (
                      <p className="text-muted-foreground leading-relaxed">
                        {subsection.content}
                      </p>
                    )}

                    {subsection.list && (
                      <ul className="space-y-2 ml-4">
                        {subsection.list.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className={`h-5 w-5 ${colors.icon} mt-0.5 flex-shrink-0`} />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {subsection.types && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {subsection.types.map((type: any, i: number) => {
                          const TypeIcon = type.icon;
                          return (
                            <div
                              key={i}
                              className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <TypeIcon className={`h-5 w-5 ${colors.icon}`} />
                                <h4 className="font-semibold">{type.type}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {type.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {subsection.steps && (
                      <div className="space-y-3">
                        {subsection.steps.map((step: any, i: number) => (
                          <div key={i} className="flex gap-4">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} ${colors.icon} flex items-center justify-center font-bold`}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{step.step}</p>
                              <p className="text-sm text-muted-foreground">{step.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {subsection.example && (
                      <div className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Play className={`h-4 w-4 ${colors.icon}`} />
                          Beispiel
                        </h4>
                        {subsection.example.variables && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Variablen:</p>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                              {subsection.example.variables.map((v: string, i: number) => (
                                <li key={i}>• {v}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {subsection.example.calculations && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Berechnungen:</p>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                              {subsection.example.calculations.map((c: string, i: number) => (
                                <li key={i}>• {c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {subsection.example.outputs && (
                          <div>
                            <p className="text-sm font-medium mb-1">Ausgaben:</p>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                              {subsection.example.outputs.map((o: string, i: number) => (
                                <li key={i}>• {o}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {subsection.grades && (
                      <div className="grid gap-3 md:grid-cols-3">
                        {subsection.grades.map((grade: any, i: number) => (
                          <div key={i} className={`p-4 rounded-lg border ${colors.border}`}>
                            <div className="text-2xl mb-2">{grade.grade}</div>
                            <p className="text-sm font-medium mb-1">{grade.score}</p>
                            <p className="text-xs text-muted-foreground">{grade.action}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {subsection.metrics && (
                      <div className="grid gap-3 md:grid-cols-2">
                        {subsection.metrics.map((metric: any, i: number) => (
                          <div key={i} className={`p-3 rounded-lg ${colors.bg}`}>
                            <p className="font-semibold">{metric.metric}</p>
                            <p className="text-sm text-muted-foreground">
                              {metric.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {subsection.tips && (
                      <div className="space-y-3">
                        {subsection.tips.map((tip: any, i: number) => (
                          <div key={i} className={`p-4 rounded-lg border ${colors.border}`}>
                            <p className="font-semibold mb-1">{tip.tip}</p>
                            <p className="text-sm text-muted-foreground">{tip.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* Footer */}
      <Card className="animate-fade-in border-blue-500/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Noch Fragen?</h3>
            <p className="text-muted-foreground mb-4">
              Besuchen Sie unsere GitHub-Dokumentation oder kontaktieren Sie den Support.
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="https://github.com/yourusername/leftclick-clm"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
              >
                GitHub Docs
              </a>
              <a
                href="mailto:support@leftclick.de"
                className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
              >
                Support kontaktieren
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

