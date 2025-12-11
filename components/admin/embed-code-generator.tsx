"use client";

import { useState } from "react";
import { Copy, Check, Code, Monitor, Smartphone, ExternalLink, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { QuickTooltip } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmbedCodeGeneratorProps {
  leadMagnetId: string;
  leadMagnetSlug: string;
  tenantSlug: string;
}

type EmbedType = "iframe" | "popup" | "slide_in" | "inline";

interface EmbedConfig {
  type: EmbedType;
  width: string;
  height: string;
  position: "bottom-left" | "bottom-right" | "center";
  trigger: "click" | "delay" | "scroll" | "exit";
  triggerValue: string;
  customCss: string;
  allowedDomains: string[];
}

export function EmbedCodeGenerator({
  leadMagnetId,
  leadMagnetSlug,
  tenantSlug,
}: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<EmbedConfig>({
    type: "iframe",
    width: "100%",
    height: "600",
    position: "bottom-right",
    trigger: "click",
    triggerValue: "5",
    customCss: "",
    allowedDomains: [],
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com";
  const widgetUrl = `${baseUrl}/widget/${leadMagnetSlug}`;

  const generateEmbedCode = (): string => {
    switch (config.type) {
      case "iframe":
        return `<!-- LeftClick CLM Widget - iFrame -->
<iframe
  src="${widgetUrl}"
  width="${config.width}"
  height="${config.height}px"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
  allow="clipboard-write"
  loading="lazy"
></iframe>`;

      case "popup":
        return `<!-- LeftClick CLM Widget - Popup -->
<script>
(function() {
  var config = {
    id: '${leadMagnetId}',
    slug: '${leadMagnetSlug}',
    trigger: '${config.trigger}',
    triggerValue: ${config.triggerValue},
    position: '${config.position}',
    width: '${config.width}',
    height: '${config.height}'
  };
  
  var script = document.createElement('script');
  script.src = '${baseUrl}/embed.js';
  script.async = true;
  script.onload = function() {
    window.LeftClickCLM && window.LeftClickCLM.init(config);
  };
  document.head.appendChild(script);
})();
</script>`;

      case "slide_in":
        return `<!-- LeftClick CLM Widget - Slide In -->
<script>
(function() {
  var config = {
    id: '${leadMagnetId}',
    slug: '${leadMagnetSlug}',
    type: 'slide_in',
    position: '${config.position}',
    trigger: '${config.trigger}',
    triggerValue: ${config.triggerValue}
  };
  
  var script = document.createElement('script');
  script.src = '${baseUrl}/embed.js';
  script.async = true;
  script.onload = function() {
    window.LeftClickCLM && window.LeftClickCLM.init(config);
  };
  document.head.appendChild(script);
})();
</script>`;

      case "inline":
        return `<!-- LeftClick CLM Widget - Inline -->
<div id="leftclick-clm-widget" data-slug="${leadMagnetSlug}"></div>
<script src="${baseUrl}/embed.js" async></script>`;

      default:
        return "";
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedTypeOptions = [
    {
      value: "iframe",
      label: "iFrame",
      description: "Einfache Integration, lädt Widget in einem Frame",
      icon: Monitor,
    },
    {
      value: "popup",
      label: "Popup/Modal",
      description: "Öffnet als Overlay über der Seite",
      icon: ExternalLink,
    },
    {
      value: "slide_in",
      label: "Slide-In",
      description: "Gleitet von der Seite rein",
      icon: Smartphone,
    },
    {
      value: "inline",
      label: "Inline",
      description: "Direkt im Content eingebettet",
      icon: Code,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Embed Type Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Embed-Typ auswählen
              </CardTitle>
              <CardDescription>
                Wähle aus wie das Widget auf deiner Website erscheinen soll
              </CardDescription>
            </div>
            <QuickTooltip content="Wählen Sie, wie das Lead-Magnet-Widget auf Ihrer Website integriert werden soll: iFrame (einfach), Popup (Overlay), Slide-In oder Inline (direkt im Content)">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </QuickTooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {embedTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = config.type === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() =>
                    setConfig({ ...config, type: option.value as EmbedType })
                  }
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 mb-2 ${
                      isSelected ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`font-semibold ${
                      isSelected ? "text-indigo-900" : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Size Options (for iframe and popup) */}
          {(config.type === "iframe" || config.type === "popup") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label>Breite</Label>
                  <QuickTooltip content="Kann als Prozent (z.B. 100%) oder Pixel (z.B. 600px) angegeben werden">
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </QuickTooltip>
                </div>
                <Input
                  value={config.width}
                  onChange={(e) =>
                    setConfig({ ...config, width: e.target.value })
                  }
                  placeholder="100% oder 600px"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label>Höhe (px)</Label>
                  <QuickTooltip content="Höhe des Widgets in Pixel. Empfohlen: 600px für Desktop">
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </QuickTooltip>
                </div>
                <Input
                  value={config.height}
                  onChange={(e) =>
                    setConfig({ ...config, height: e.target.value })
                  }
                  placeholder="600"
                />
              </div>
            </div>
          )}

          {/* Position (for popup and slide_in) */}
          {(config.type === "popup" || config.type === "slide_in") && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label>Position</Label>
                <QuickTooltip content="Bestimmt, wo das Widget auf dem Bildschirm erscheint">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </QuickTooltip>
              </div>
              <Select
                value={config.position}
                onValueChange={(v) =>
                  setConfig({
                    ...config,
                    position: v as EmbedConfig["position"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-left">Unten Links</SelectItem>
                  <SelectItem value="bottom-right">Unten Rechts</SelectItem>
                  <SelectItem value="center">Zentral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Trigger (for popup and slide_in) */}
          {(config.type === "popup" || config.type === "slide_in") && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label>Trigger</Label>
                  <QuickTooltip content="Bestimmt, wann das Widget erscheint: sofort bei Klick, nach bestimmter Zeit, bei bestimmter Scroll-Position oder wenn der Benutzer die Seite verlassen möchte">
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </QuickTooltip>
                </div>
                <Select
                  value={config.trigger}
                  onValueChange={(v) =>
                    setConfig({
                      ...config,
                      trigger: v as EmbedConfig["trigger"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="click">Bei Klick auf Button</SelectItem>
                    <SelectItem value="delay">Nach X Sekunden</SelectItem>
                    <SelectItem value="scroll">Nach X% Scroll</SelectItem>
                    <SelectItem value="exit">Bei Exit Intent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.trigger === "delay" && (
                <div>
                  <Label>Verzögerung (Sekunden): {config.triggerValue}s</Label>
                  <Slider
                    value={[parseInt(config.triggerValue) || 5]}
                    onValueChange={([v]) =>
                      setConfig({ ...config, triggerValue: String(v) })
                    }
                    min={1}
                    max={60}
                    step={1}
                    className="mt-2"
                  />
                </div>
              )}

              {config.trigger === "scroll" && (
                <div>
                  <Label>Scroll-Position: {config.triggerValue}%</Label>
                  <Slider
                    value={[parseInt(config.triggerValue) || 50]}
                    onValueChange={([v]) =>
                      setConfig({ ...config, triggerValue: String(v) })
                    }
                    min={10}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Embed-Code</span>
            <Button
              onClick={copyToClipboard}
              className={`transition-all ${
                copied
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Code kopieren
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Füge diesen Code auf deiner Website ein
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm font-mono">
              <code>{generateEmbedCode()}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live-Vorschau</CardTitle>
          <CardDescription>
            So wird das Widget auf deiner Website aussehen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
            {config.type === "iframe" && (
              <iframe
                src={widgetUrl}
                width={config.width}
                height={`${config.height}px`}
                frameBorder="0"
                style={{
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  maxWidth: "100%",
                }}
              />
            )}
            {config.type !== "iframe" && (
              <div className="text-center text-gray-500">
                <Code className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">Vorschau für {config.type}</p>
                <p className="text-sm mt-1">
                  Teste das Widget auf deiner Website um die volle Funktionalität
                  zu sehen
                </p>
                <a
                  href={widgetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-indigo-600 hover:text-indigo-700"
                >
                  Widget in neuem Tab öffnen
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Schnell-Anleitung</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ol className="space-y-2 text-gray-600">
            <li>
              <strong>Code kopieren:</strong> Klicke auf &quot;Code kopieren&quot; oben
            </li>
            <li>
              <strong>In Website einfügen:</strong>
              {config.type === "iframe" ? (
                <span>
                  {" "}
                  Füge den Code dort ein, wo das Widget erscheinen soll
                </span>
              ) : (
                <span>
                  {" "}
                  Füge den Code vor dem schließenden{" "}
                  <code>&lt;/body&gt;</code> Tag ein
                </span>
              )}
            </li>
            <li>
              <strong>Testen:</strong> Lade die Seite neu und teste das Widget
            </li>
          </ol>

          {config.trigger === "click" &&
            (config.type === "popup" || config.type === "slide_in") && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Tipp:</strong> Füge einen Button mit der Klasse{" "}
                  <code>data-leftclick-trigger=&quot;{leadMagnetSlug}&quot;</code> hinzu um
                  das Popup zu öffnen:
                </p>
                <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded">
                  {`<button data-leftclick-trigger="${leadMagnetSlug}">
  Jetzt starten
</button>`}
                </pre>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

