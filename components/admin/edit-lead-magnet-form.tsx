"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeadMagnetBuilder } from "@/components/admin/lead-magnet-builder";
import { CalculatorBuilder } from "@/components/admin/calculator-builder";
import { VisualWizardBuilder } from "@/components/admin/visual-wizard-builder";
import { PriceVariableManager } from "@/components/admin/price-variable-manager";
import { LeadMagnetSettings } from "@/components/admin/lead-magnet-settings";
import { ChartBuilder } from "@/components/admin/chart-builder";
import { WizardStep, LeadMagnetSettings as SettingsType, PriceVariable } from "@/types/wizard-builder";
import { 
  Moon, 
  Sun, 
  Monitor, 
  Sparkles, 
  FileText, 
  Calculator, 
  CheckSquare, 
  BookOpen,
  ArrowLeft,
  Zap,
  Mail,
  Download,
  UserPlus,
  ToggleRight,
  Save,
  Trash2,
  Sigma,
  DollarSign,
  BarChart3,
  Settings as SettingsIcon,
  Layout,
  Palette,
  Wand2
} from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

interface LeadMagnet {
  id: string;
  type: "ebook" | "checklist" | "quiz" | "calculator";
  title: string;
  description?: string;
  slug: string;
  active: boolean;
  config: Record<string, any>;
}

interface EditLeadMagnetFormProps {
  leadMagnet: LeadMagnet;
}

export function EditLeadMagnetForm({ leadMagnet }: EditLeadMagnetFormProps) {
  const router = useRouter();
  const [type, setType] = useState<"ebook" | "checklist" | "quiz" | "calculator">(leadMagnet.type);
  const [title, setTitle] = useState(leadMagnet.title);
  const [description, setDescription] = useState(leadMagnet.description || "");
  const [slug, setSlug] = useState(leadMagnet.slug);
  const [active, setActive] = useState(leadMagnet.active);
  const [config, setConfig] = useState<Record<string, any>>(leadMagnet.config || {});
  const [themeMode, setThemeMode] = useState<ThemeMode>((leadMagnet.config?.themeMode as ThemeMode) || "system");
  const [allowUserThemeToggle, setAllowUserThemeToggle] = useState(leadMagnet.config?.allowUserThemeToggle ?? true);
  
  // Calculator-spezifische Konfiguration
  const [calculatorConfig, setCalculatorConfig] = useState({
    wizardMode: leadMagnet.config?.wizardMode ?? true,
    showProgress: leadMagnet.config?.showProgress ?? true,
    calculations: leadMagnet.config?.calculations || [],
    outputs: leadMagnet.config?.outputs || [],
  });

  // Wizard Steps (erweitert)
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>(
    (config.steps || []).map((step: any, idx: number) => ({
      id: step.id || `step_${idx}`,
      title: step.title || `Schritt ${idx + 1}`,
      description: step.description,
      order: step.step_number || step.order || idx + 1,
      isRequired: step.isRequired ?? true,
      isSkippable: step.isSkippable ?? false,
      skipDefaultValues: step.skipDefaultValues || {},
      fields: step.fields || [],
      calculations: step.calculations || [],
      effects: step.effects || {},
    }))
  );

  // Preis-Variablen
  const [priceVariables, setPriceVariables] = useState<PriceVariable[]>(
    config.priceVariables || []
  );

  // Update settings when priceVariables change
  useEffect(() => {
    setLeadMagnetSettings((prev) => ({
      ...prev,
      priceVariables: priceVariables,
    }));
  }, [priceVariables]);

  // Settings
  const [leadMagnetSettings, setLeadMagnetSettings] = useState<SettingsType>({
    email: {
      sendToVisitor: config.settings?.email?.sendToVisitor ?? true,
      sendToTeam: config.settings?.email?.sendToTeam ?? false,
      teamEmail: config.settings?.email?.teamEmail,
      templateId: config.settings?.email?.templateId,
      customSubject: config.settings?.email?.customSubject,
      customBody: config.settings?.email?.customBody,
    },
    pdf: {
      generate: config.settings?.pdf?.generate ?? true,
      attachToEmail: config.settings?.pdf?.attachToEmail ?? true,
      branding: config.settings?.pdf?.branding || {
        primaryColor: "#3b82f6",
        secondaryColor: "#8b5cf6",
      },
      sections: {
        inputSummary: config.settings?.pdf?.sections?.inputSummary ?? true,
        calculationDetails: config.settings?.pdf?.sections?.calculationDetails ?? true,
        charts: config.settings?.pdf?.sections?.charts ?? true,
        recommendations: config.settings?.pdf?.sections?.recommendations ?? false,
        customSections: config.settings?.pdf?.sections?.customSections || [],
      },
    },
    contactGate: {
      required: config.settings?.contactGate?.required ?? true,
      fields: config.settings?.contactGate?.fields || ["name", "email"],
      teaserType: config.settings?.contactGate?.teaserType || "blurred_total",
      teaserText: config.settings?.contactGate?.teaserText,
      showBeforeContact: {
        totalResult: config.settings?.contactGate?.showBeforeContact?.totalResult ?? true,
        partialResults: config.settings?.contactGate?.showBeforeContact?.partialResults ?? false,
        chartPreview: config.settings?.contactGate?.showBeforeContact?.chartPreview ?? false,
      },
    },
    priceVariables: priceVariables,
    charts: config.settings?.charts || [],
    expertModeEnabled: config.settings?.expertModeEnabled ?? true,
  });

  const updateMutation = trpc.leadMagnets.update.useMutation({
    onSuccess: () => {
      router.push("/admin/lead-magnets");
      router.refresh();
    },
  });

  const deleteMutation = trpc.leadMagnets.delete.useMutation({
    onSuccess: () => {
      router.push("/admin/lead-magnets");
      router.refresh();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Merge calculator config for calculator type
    const finalConfig = type === "calculator" 
      ? {
          ...config,
          themeMode,
          allowUserThemeToggle,
          ...calculatorConfig,
          steps: wizardSteps,
          priceVariables: priceVariables,
          settings: {
            ...leadMagnetSettings,
            priceVariables: priceVariables,
          },
        }
      : {
          ...config,
          themeMode,
          allowUserThemeToggle,
          steps: config.steps || [],
        };
    
    updateMutation.mutate({
      id: leadMagnet.id,
      type,
      title,
      description,
      slug,
      active,
      config: {
        ...finalConfig,
      },
    });
  };

  const handleDelete = () => {
    if (confirm(`Möchten Sie den Lead-Magnet "${title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      deleteMutation.mutate({ id: leadMagnet.id });
    }
  };

  const typeOptions = [
    { value: "ebook", label: "E-Book Download", icon: BookOpen, color: "emerald" },
    { value: "checklist", label: "Checkliste", icon: CheckSquare, color: "cyan" },
    { value: "quiz", label: "Quiz", icon: FileText, color: "purple" },
    { value: "calculator", label: "Kalkulator", icon: Calculator, color: "pink" },
  ];

  const colorClasses = {
    emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", ring: "ring-emerald-500/50" },
    cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30", ring: "ring-cyan-500/50" },
    purple: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", ring: "ring-purple-500/50" },
    pink: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30", ring: "ring-pink-500/50" },
  };

  // Tab-Konfiguration basierend auf Typ
  const getTabs = () => {
    const baseTabs = [
      { value: "general", label: "Allgemein", icon: Layout },
      { value: "appearance", label: "Darstellung", icon: Palette },
    ];

    if (type === "calculator") {
      return [
        ...baseTabs,
        { value: "variables", label: "Preise & Variablen", icon: DollarSign },
        { value: "calculations", label: "Berechnungen", icon: Sigma },
        { value: "wizard", label: "Wizard-Builder", icon: Wand2 },
        { value: "charts", label: "Diagramme", icon: BarChart3 },
        { value: "settings", label: "Einstellungen", icon: SettingsIcon },
      ];
    } else if (type === "checklist" || type === "quiz") {
      return [
        ...baseTabs,
        { value: "wizard", label: "Wizard-Schritte", icon: Sparkles },
      ];
    } else if (type === "ebook") {
      return [
        ...baseTabs,
        { value: "ebook", label: "E-Book Optionen", icon: BookOpen },
      ];
    }

    return baseTabs;
  };

  const tabs = getTabs();

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="animate-fade-in">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-4 -ml-2 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-40" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Lead-Magnet bearbeiten</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Passen Sie Ihr Lead-Generierungs-Tool an
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs Navigation */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="flex flex-wrap w-full mb-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab: Allgemein */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Type Selection */}
              <GlowCard className="animate-fade-in h-fit">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20">
                      <Zap className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Typ auswählen</CardTitle>
                      <CardDescription>Wähle die Art deines Lead-Magnets</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {typeOptions.map((option) => {
                      const colors = colorClasses[option.color as keyof typeof colorClasses];
                      const isSelected = type === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setType(option.value as any)}
                          className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                            isSelected
                              ? `${colors.border} ${colors.bg} ring-2 ${colors.ring}`
                              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${isSelected ? colors.bg : "bg-white/10"} transition-colors`}>
                            <option.icon className={`h-6 w-6 ${isSelected ? colors.text : "text-muted-foreground group-hover:text-white"} transition-colors`} />
                          </div>
                          <span className={`font-medium ${isSelected ? "text-white" : "text-muted-foreground group-hover:text-white"} transition-colors`}>
                            {option.label}
                          </span>
                          {isSelected && (
                            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${colors.text.replace("text-", "bg-")} animate-pulse`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </GlowCard>

              {/* Basic Info */}
              <GlowCard className="animate-fade-in h-fit">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20">
                      <FileText className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Grundinformationen</CardTitle>
                      <CardDescription>Basis-Daten für deinen Lead-Magnet</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">Titel</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="z.B. IT-Frust bei Dienstleisterwechsel"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">Beschreibung</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Kurze Beschreibung des Lead-Magnets"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">URL-Slug</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-mono">/widget/</span>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="it-frust-dienstleisterwechsel"
                        required
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                    <input
                      type="checkbox"
                      id="active"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                    />
                    <div>
                      <Label htmlFor="active" className="font-medium cursor-pointer">Aktiv</Label>
                      <p className="text-xs text-muted-foreground">Lead-Magnet ist öffentlich verfügbar</p>
                    </div>
                  </div>
                </CardContent>
              </GlowCard>
            </div>
          </TabsContent>

          {/* Tab: Darstellung */}
          <TabsContent value="appearance" className="space-y-6">
            <GlowCard className="animate-fade-in">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-pink-500/20">
                    <Sun className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Darstellung</CardTitle>
                    <CardDescription>Wähle das Erscheinungsbild für dein Widget</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                  {[
                    { value: "light", label: "Hell", icon: Sun, gradient: "from-amber-400 to-orange-400" },
                    { value: "dark", label: "Dunkel", icon: Moon, gradient: "from-slate-600 to-slate-800" },
                    { value: "system", label: "System", icon: Monitor, gradient: "from-purple-500 to-cyan-500" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setThemeMode(option.value as ThemeMode)}
                      className={`group flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 ${
                        themeMode === option.value
                          ? "border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/30"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${option.gradient}`}>
                        <option.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${themeMode === option.value ? "text-white" : "text-muted-foreground"}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {themeMode === "light" && "Das Widget wird immer im hellen Modus angezeigt."}
                  {themeMode === "dark" && "Das Widget wird immer im dunklen Modus angezeigt."}
                  {themeMode === "system" && "Das Widget passt sich automatisch an die Systemeinstellungen des Besuchers an."}
                </p>

                {/* User Theme Toggle Option */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors max-w-2xl">
                    <input
                      type="checkbox"
                      id="allowUserThemeToggle"
                      checked={allowUserThemeToggle}
                      onChange={(e) => setAllowUserThemeToggle(e.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                    />
                    <div className="p-2 rounded-lg bg-white/10">
                      <ToggleRight className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="allowUserThemeToggle" className="font-medium cursor-pointer">
                        Besucher dürfen Theme wechseln
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Zeigt einen Theme-Toggle-Button im Widget an, mit dem Besucher selbst zwischen Hell/Dunkel wechseln können
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expert Mode Toggle (nur für Kalkulatoren) */}
                {type === "calculator" && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors max-w-2xl">
                      <input
                        type="checkbox"
                        id="expertModeEnabled"
                        checked={leadMagnetSettings.expertModeEnabled}
                        onChange={(e) =>
                          setLeadMagnetSettings({
                            ...leadMagnetSettings,
                            expertModeEnabled: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <div className="p-2 rounded-lg bg-white/10">
                        <Zap className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="expertModeEnabled" className="font-medium cursor-pointer">
                          Experten-Modus aktivieren
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Besucher können zwischen Schnell-Modus (nur Pflichtfelder) und Experten-Modus (alle Felder) wählen
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </GlowCard>
          </TabsContent>

          {/* Tab: Preise & Variablen (nur Calculator) */}
          {type === "calculator" && (
            <TabsContent value="variables" className="space-y-6">
              <GlowCard className="animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Preise & Variablen</CardTitle>
                      <CardDescription>Verwalten Sie alle Preise und Konstanten zentral</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PriceVariableManager
                    variables={priceVariables}
                    calculations={calculatorConfig.calculations}
                    onChange={setPriceVariables}
                  />
                </CardContent>
              </GlowCard>
            </TabsContent>
          )}

          {/* Tab: Berechnungen (nur Calculator) */}
          {type === "calculator" && (
            <TabsContent value="calculations" className="space-y-6">
              <GlowCard className="animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20">
                      <Sigma className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Berechnungen & Ausgaben</CardTitle>
                      <CardDescription>Definiere Formeln und Ergebnis-Ausgaben</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CalculatorBuilder
                    initialConfig={calculatorConfig}
                    onChange={(newConfig) => setCalculatorConfig(newConfig)}
                  />
                </CardContent>
              </GlowCard>
            </TabsContent>
          )}

          {/* Tab: Wizard-Builder (Calculator) */}
          {type === "calculator" && (
            <TabsContent value="wizard" className="space-y-6">
              <GlowCard className="animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Wizard-Builder</CardTitle>
                      <CardDescription>Erstellen Sie Schritte mit Drag & Drop und Live-Preview</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <VisualWizardBuilder
                    initialSteps={wizardSteps}
                    calculations={calculatorConfig.calculations}
                    priceVariables={priceVariables}
                    onChange={setWizardSteps}
                  />
                </CardContent>
              </GlowCard>
            </TabsContent>
          )}

          {/* Tab: Wizard-Schritte (Checklist/Quiz) */}
          {(type === "checklist" || type === "quiz") && (
            <TabsContent value="wizard" className="space-y-6">
              <GlowCard className="animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Wizard-Schritte</CardTitle>
                      <CardDescription>Erstelle Schritt-für-Schritt-Flows für die Dateneingabe</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <LeadMagnetBuilder
                    initialSteps={config.steps || []}
                    onSave={(steps) => {
                      setConfig((prev) => ({ ...prev, steps }));
                    }}
                  />
                </CardContent>
              </GlowCard>
            </TabsContent>
          )}

          {/* Tab: Diagramme (nur Calculator) */}
          {type === "calculator" && (
            <TabsContent value="charts" className="space-y-6">
              <GlowCard className="animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20">
                      <BarChart3 className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Diagramme</CardTitle>
                      <CardDescription>Visualisieren Sie Ihre Ergebnisse mit Diagrammen</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartBuilder
                    charts={leadMagnetSettings.charts}
                    calculations={calculatorConfig.calculations}
                    onChange={(charts) =>
                      setLeadMagnetSettings({ ...leadMagnetSettings, charts })
                    }
                  />
                </CardContent>
              </GlowCard>
            </TabsContent>
          )}

          {/* Tab: Einstellungen (nur Calculator) */}
          {type === "calculator" && (
            <TabsContent value="settings" className="space-y-6">
              <GlowCard className="animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20">
                      <SettingsIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Einstellungen</CardTitle>
                      <CardDescription>E-Mail, PDF, Kontaktdaten-Gate und mehr</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <LeadMagnetSettings
                    settings={leadMagnetSettings}
                    onChange={setLeadMagnetSettings}
                  />
                </CardContent>
              </GlowCard>
            </TabsContent>
          )}

          {/* Tab: E-Book Optionen */}
          {type === "ebook" && (
            <TabsContent value="ebook" className="space-y-6">
              <GlowCard className="animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20">
                      <BookOpen className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">E-Book Konfiguration</CardTitle>
                      <CardDescription>Optionen für den E-Book Download</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "requireContactInfo", label: "Kontaktinformationen erforderlich", description: "Besucher müssen ihre E-Mail angeben", icon: UserPlus },
                    { id: "emailDelivery", label: "Per E-Mail versenden", description: "E-Book wird automatisch zugesendet", icon: Mail },
                    { id: "instantDownload", label: "Sofortiger Download", description: "Direkter Download ohne Wartezeit", icon: Download },
                  ].map((option) => (
                    <div 
                      key={option.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors max-w-2xl"
                    >
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={config[option.id] || false}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            [option.id]: e.target.checked,
                          }))
                        }
                        className="h-5 w-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500/50"
                      />
                      <div className="p-2 rounded-lg bg-white/10">
                        <option.icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="font-medium cursor-pointer">{option.label}</Label>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </GlowCard>
            </TabsContent>
          )}
        </Tabs>

        {/* Actions - Sticky am unteren Rand */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-white/10 -mx-6 px-6 py-4 mt-6">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              size="lg"
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              variant="glow"
              size="lg"
              disabled={updateMutation.isPending}
              className="min-w-[150px]"
            >
              {updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wird gespeichert...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Speichern
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
