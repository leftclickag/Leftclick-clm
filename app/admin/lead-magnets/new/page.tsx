"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { LeadMagnetBuilder } from "@/components/admin/lead-magnet-builder";
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
  ToggleRight
} from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

export default function NewLeadMagnetPage() {
  const router = useRouter();
  const [type, setType] = useState<"ebook" | "checklist" | "quiz" | "calculator">("ebook");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [active, setActive] = useState(true);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [allowUserThemeToggle, setAllowUserThemeToggle] = useState(true);

  const createMutation = trpc.leadMagnets.create.useMutation({
    onSuccess: () => {
      router.push("/admin/lead-magnets");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      type,
      title,
      description,
      slug,
      active,
      config: {
        ...config,
        themeMode,
        allowUserThemeToggle,
      },
    });
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

  return (
    <div className="space-y-8 max-w-4xl">
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
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-40" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Neuer Lead-Magnet</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Erstelle ein neues Lead-Generierungs-Tool
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
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
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
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
                <p className="text-xs text-muted-foreground">Lead-Magnet ist sofort nach Erstellung verfügbar</p>
              </div>
            </div>
          </CardContent>
        </GlowCard>

        {/* Theme Selection */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
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
            <div className="grid grid-cols-3 gap-4">
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
            <p className="mt-4 text-sm text-muted-foreground text-center">
              {themeMode === "light" && "Das Widget wird immer im hellen Modus angezeigt."}
              {themeMode === "dark" && "Das Widget wird immer im dunklen Modus angezeigt."}
              {themeMode === "system" && "Das Widget passt sich automatisch an die Systemeinstellungen des Besuchers an."}
            </p>

            {/* User Theme Toggle Option */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
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
          </CardContent>
        </GlowCard>

        {/* Wizard Config */}
        {(type === "calculator" || type === "checklist" || type === "quiz") && (
          <GlowCard className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Wizard-Konfiguration</CardTitle>
                  <CardDescription>Erstelle Schritt-für-Schritt-Flows</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LeadMagnetBuilder
                onSave={(steps) => {
                  setConfig((prev) => ({ ...prev, steps }));
                }}
              />
            </CardContent>
          </GlowCard>
        )}

        {/* E-Book Config */}
        {type === "ebook" && (
          <GlowCard className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
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
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
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
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
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
            disabled={createMutation.isPending}
            className="min-w-[150px]"
          >
            {createMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wird erstellt...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Erstellen
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
