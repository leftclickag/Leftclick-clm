"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuickTooltip } from "@/components/ui/tooltip";
import { 
  Settings, 
  Palette, 
  Mail, 
  Webhook, 
  Shield,
  Save,
  Plus,
  Sparkles,
  Activity,
  RefreshCw
} from "lucide-react";
import { getSSOSettings, updateSSOSettings } from "@/app/actions/sso-settings";

export default function SettingsPage() {
  const [ssoConfig, setSsoConfig] = useState({ enabled: false, clientId: "", tenantId: "" });
  const [loadingSSO, setLoadingSSO] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);

  useEffect(() => {
    getSSOSettings().then(setSsoConfig);
  }, []);

  const handleSaveSSO = async () => {
    setLoadingSSO(true);
    try {
      const isEnabled = !!ssoConfig.clientId && !!ssoConfig.tenantId;
      await updateSSOSettings({ ...ssoConfig, enabled: isEnabled });
      setSsoConfig(prev => ({ ...prev, enabled: isEnabled }));
      // Optional: Add toast or feedback here
    } catch (e) {
      console.error("Failed to save SSO settings:", e);
    } finally {
      setLoadingSSO(false);
    }
  };

  const runDiagnostics = async () => {
    setLoadingDiag(true);
    try {
      const response = await fetch("/api/test-admin");
      const data = await response.json();
      setDiagnostics(data);
    } catch (e) {
      console.error("Failed to run diagnostics:", e);
      setDiagnostics({ error: "Verbindungsfehler" });
    } finally {
      setLoadingDiag(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-40" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
              <Settings className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Einstellungen</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Verwalte deine Plattform-Einstellungen
            </p>
          </div>
        </div>
      </div>

      {/* System Diagnostics Card */}
      <GlowCard className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">System-Diagnose</CardTitle>
                <CardDescription>Überprüfe Supabase-Verbindung und Konfiguration</CardDescription>
              </div>
            </div>
            <QuickTooltip content="System-Diagnose durchführen: Überprüft Supabase-Verbindung, Umgebungsvariablen und Konfiguration">
              <Button 
                onClick={runDiagnostics}
                disabled={loadingDiag}
                size="sm"
                variant="outline"
              >
                {loadingDiag ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Test starten
                  </>
                )}
              </Button>
            </QuickTooltip>
          </div>
        </CardHeader>
        {diagnostics && (
          <CardContent className="space-y-4">
            {/* Environment */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Umgebungsvariablen</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(diagnostics.environment).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-1 px-3 rounded-lg bg-secondary/30">
                    <span className="font-mono text-xs">{key}</span>
                    <span className={value?.toString().includes("✅") ? "text-emerald-400" : "text-red-400"}>
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tests */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Verbindungstests</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(diagnostics.tests).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-1 px-3 rounded-lg bg-secondary/30">
                    <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className={value?.toString().includes("✅") ? "text-emerald-400" : "text-red-400"}>
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error & Solution */}
            {diagnostics.error && diagnostics.solution && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                <h3 className="font-semibold text-red-400 mb-2">Problem: {diagnostics.solution.problem}</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  {diagnostics.solution.steps.map((step: string, i: number) => (
                    <div key={i}>{step}</div>
                  ))}
                  {diagnostics.solution.note && (
                    <div className="mt-2 pt-2 border-t border-red-500/30 text-red-400">
                      {diagnostics.solution.note}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!diagnostics.error && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold">Alle Tests erfolgreich!</span>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </GlowCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branding Card */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-500/20">
                <Palette className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Branding</CardTitle>
                <CardDescription>Passe Farben und Design an</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="primaryColor" className="text-sm text-muted-foreground">Primärfarbe</Label>
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <Input
                    id="primaryColor"
                    type="color"
                    defaultValue="#9333ea"
                    className="w-16 h-12 p-1 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  defaultValue="#9333ea"
                  className="flex-1"
                  placeholder="Hex-Farbcode"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="secondaryColor" className="text-sm text-muted-foreground">Sekundärfarbe</Label>
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <Input
                    id="secondaryColor"
                    type="color"
                    defaultValue="#22d3ee"
                    className="w-16 h-12 p-1 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  defaultValue="#22d3ee"
                  className="flex-1"
                  placeholder="Hex-Farbcode"
                />
              </div>
            </div>
            <QuickTooltip content="Branding-Einstellungen speichern">
              <Button className="w-full mt-2">
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </QuickTooltip>
          </CardContent>
        </GlowCard>

        {/* SMTP Card */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20">
                <Mail className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-lg">SMTP-Einstellungen</CardTitle>
                <CardDescription>Konfiguriere den E-Mail-Versand</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="smtpHost" className="text-sm text-muted-foreground">SMTP Host</Label>
              <Input id="smtpHost" placeholder="smtp.example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <Label htmlFor="smtpPort" className="text-sm text-muted-foreground">Port</Label>
                <Input id="smtpPort" type="number" placeholder="587" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="smtpSecurity" className="text-sm text-muted-foreground">Sicherheit</Label>
                <Input id="smtpSecurity" placeholder="TLS" />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="smtpUser" className="text-sm text-muted-foreground">Benutzer</Label>
              <Input id="smtpUser" placeholder="user@example.com" />
            </div>
            <QuickTooltip content="SMTP-Einstellungen speichern für automatischen E-Mail-Versand">
              <Button className="w-full mt-2">
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </QuickTooltip>
          </CardContent>
        </GlowCard>

        {/* Webhooks Card */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <Webhook className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Webhooks</CardTitle>
                <CardDescription>Konfiguriere Webhook-Integrationen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="webhookUrl" className="text-sm text-muted-foreground">Webhook URL</Label>
              <Input id="webhookUrl" placeholder="https://example.com/webhook" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="webhookSecret" className="text-sm text-muted-foreground">Secret</Label>
              <Input id="webhookSecret" type="password" placeholder="••••••••" />
            </div>
            <div className="p-4 rounded-xl border border-border bg-secondary/30 dark:bg-white/5">
              <p className="text-xs text-muted-foreground mb-2">Verfügbare Events:</p>
              <div className="flex flex-wrap gap-2">
                {["submission.created", "submission.completed", "lead.converted"].map((event) => (
                  <span key={event} className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400 text-xs font-mono">
                    {event}
                  </span>
                ))}
              </div>
            </div>
            <QuickTooltip content="Neuen Webhook hinzufügen für Event-Benachrichtigungen">
              <Button variant="outline" className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Webhook hinzufügen
              </Button>
            </QuickTooltip>
          </CardContent>
        </GlowCard>

        {/* SSO Card */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg">SSO-Konfiguration</CardTitle>
                <CardDescription>Microsoft 365 SSO-Einstellungen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="azureClientId" className="text-sm text-muted-foreground">Azure Client ID</Label>
              <Input 
                id="azureClientId" 
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                className="font-mono text-sm" 
                value={ssoConfig.clientId}
                onChange={(e) => setSsoConfig({...ssoConfig, clientId: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="azureTenantId" className="text-sm text-muted-foreground">Azure Tenant ID</Label>
              <Input 
                id="azureTenantId" 
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                className="font-mono text-sm" 
                value={ssoConfig.tenantId}
                onChange={(e) => setSsoConfig({...ssoConfig, tenantId: e.target.value})}
              />
            </div>
            {ssoConfig.enabled && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">SSO ist aktiviert</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Benutzer können sich mit Microsoft 365 anmelden
                </p>
              </div>
            )}
            <QuickTooltip content="SSO-Konfiguration speichern und Microsoft 365 Login aktivieren">
              <Button 
                className="w-full mt-2" 
                onClick={handleSaveSSO}
                disabled={loadingSSO}
              >
                {loadingSSO ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Speichern...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Speichern
                  </>
                )}
              </Button>
            </QuickTooltip>
          </CardContent>
        </GlowCard>
      </div>
    </div>
  );
}
