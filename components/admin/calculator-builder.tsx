"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Calculator,
  ArrowRight,
  Variable,
  Hash,
  Eye,
  Code,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Sigma,
  DollarSign,
  Percent,
  Type,
  Info,
} from "lucide-react";

interface Calculation {
  id: string;
  formula: string;
  label?: string;
  dependsOn?: string[];
}

interface Output {
  id: string;
  label: string;
  formula: string;
  format: "currency" | "percentage" | "number" | "text";
}

interface CalculatorConfig {
  wizardMode?: boolean;
  showProgress?: boolean;
  calculations: Calculation[];
  outputs: Output[];
}

interface CalculatorBuilderProps {
  initialConfig?: CalculatorConfig;
  onChange: (config: CalculatorConfig) => void;
}

const FORMAT_OPTIONS = [
  { value: "currency", label: "Währung (€)", icon: DollarSign },
  { value: "percentage", label: "Prozent (%)", icon: Percent },
  { value: "number", label: "Zahl", icon: Hash },
  { value: "text", label: "Text", icon: Type },
];

export function CalculatorBuilder({ initialConfig, onChange }: CalculatorBuilderProps) {
  const [calculations, setCalculations] = useState<Calculation[]>(
    initialConfig?.calculations || []
  );
  const [outputs, setOutputs] = useState<Output[]>(
    initialConfig?.outputs || []
  );
  const [activeTab, setActiveTab] = useState<"calculations" | "outputs">("calculations");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Update parent when data changes
  useEffect(() => {
    onChange({
      wizardMode: initialConfig?.wizardMode ?? true,
      showProgress: initialConfig?.showProgress ?? true,
      calculations,
      outputs,
    });
  }, [calculations, outputs]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // --- Calculations ---
  const addCalculation = () => {
    const newCalc: Calculation = {
      id: `calc_${Date.now()}`,
      formula: "",
      label: `Neue Berechnung ${calculations.length + 1}`,
    };
    setCalculations([...calculations, newCalc]);
    setExpandedItems(new Set([...expandedItems, newCalc.id]));
  };

  const updateCalculation = (id: string, updates: Partial<Calculation>) => {
    setCalculations(calcs =>
      calcs.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeCalculation = (id: string) => {
    setCalculations(calcs => calcs.filter(c => c.id !== id));
  };

  // --- Outputs ---
  const addOutput = () => {
    const newOutput: Output = {
      id: `output_${Date.now()}`,
      label: `Neue Ausgabe ${outputs.length + 1}`,
      formula: "",
      format: "number",
    };
    setOutputs([...outputs, newOutput]);
    setExpandedItems(new Set([...expandedItems, newOutput.id]));
  };

  const updateOutput = (id: string, updates: Partial<Output>) => {
    setOutputs(outs =>
      outs.map(o => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const removeOutput = (id: string) => {
    setOutputs(outs => outs.filter(o => o.id !== id));
  };

  // Get all available variables (from calculations + input fields)
  const availableVariables = [
    ...calculations.map(c => c.id),
    // Common input variables
    "users", "locations", "months", "price", "quantity", "rate",
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("calculations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === "calculations"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <Sigma className="h-4 w-4" />
          Berechnungen
          <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs">
            {calculations.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("outputs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === "outputs"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <Eye className="h-4 w-4" />
          Ergebnis-Ausgaben
          <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs">
            {outputs.length}
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "calculations" ? (
            <>
              {/* Calculations List */}
              {calculations.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-white/20 bg-white/5">
                  <Sigma className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Noch keine Berechnungen definiert
                  </p>
                  <Button onClick={addCalculation} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Erste Berechnung hinzufügen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {calculations.map((calc, index) => (
                    <Card
                      key={calc.id}
                      className="group border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer"
                        onClick={() => toggleExpand(calc.id)}
                      >
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Variable className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono bg-white/10 px-2 py-0.5 rounded">
                              #{index + 1}
                            </span>
                            <span className="font-medium truncate">
                              {calc.label || calc.id}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono truncate mt-1">
                            {calc.id} = {calc.formula || "..."}
                          </p>
                        </div>
                        {expandedItems.has(calc.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      {expandedItems.has(calc.id) && (
                        <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Variablen-Name (ID)
                              </Label>
                              <Input
                                value={calc.id}
                                onChange={(e) =>
                                  updateCalculation(calc.id, { id: e.target.value })
                                }
                                placeholder="z.B. total_cost"
                                className="font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Beschreibung (optional)
                              </Label>
                              <Input
                                value={calc.label || ""}
                                onChange={(e) =>
                                  updateCalculation(calc.id, { label: e.target.value })
                                }
                                placeholder="z.B. Gesamtkosten"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              Formel
                            </Label>
                            <div className="relative">
                              <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                value={calc.formula}
                                onChange={(e) =>
                                  updateCalculation(calc.id, { formula: e.target.value })
                                }
                                placeholder="z.B. users * price_per_user"
                                className="pl-10 font-mono"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Verwende Variablen-Namen und mathematische Operatoren (+, -, *, /, (, ))
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCalculation(calc.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Entfernen
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {calculations.length > 0 && (
                <Button
                  type="button"
                  onClick={addCalculation}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Berechnung hinzufügen
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Outputs List */}
              {outputs.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-white/20 bg-white/5">
                  <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Noch keine Ausgaben definiert
                  </p>
                  <Button onClick={addOutput} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Erste Ausgabe hinzufügen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {outputs.map((output, index) => {
                    const FormatIcon =
                      FORMAT_OPTIONS.find((f) => f.value === output.format)?.icon || Hash;
                    return (
                      <Card
                        key={output.id}
                        className="group border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer"
                          onClick={() => toggleExpand(output.id)}
                        >
                          <div className="p-2 rounded-lg bg-cyan-500/20">
                            <FormatIcon className="h-4 w-4 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono bg-white/10 px-2 py-0.5 rounded">
                                #{index + 1}
                              </span>
                              <span className="font-medium truncate">
                                {output.label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono truncate mt-1">
                              = {output.formula || "..."}
                            </p>
                          </div>
                          {expandedItems.has(output.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {expandedItems.has(output.id) && (
                          <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Anzeige-Label
                                </Label>
                                <Input
                                  value={output.label}
                                  onChange={(e) =>
                                    updateOutput(output.id, { label: e.target.value })
                                  }
                                  placeholder="z.B. Monatliche Kosten"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Format
                                </Label>
                                <select
                                  value={output.format}
                                  onChange={(e) =>
                                    updateOutput(output.id, {
                                      format: e.target.value as Output["format"],
                                    })
                                  }
                                  className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                                >
                                  {FORMAT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Wert-Formel
                              </Label>
                              <div className="relative">
                                <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  value={output.formula}
                                  onChange={(e) =>
                                    updateOutput(output.id, { formula: e.target.value })
                                  }
                                  placeholder="z.B. total_monthly_cost"
                                  className="pl-10 font-mono"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Verwende eine Berechnung oder Formel als Wert
                              </p>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOutput(output.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Entfernen
                              </Button>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}

              {outputs.length > 0 && (
                <Button
                  type="button"
                  onClick={addOutput}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ausgabe hinzufügen
                </Button>
              )}
            </>
          )}
        </div>

        {/* Right: Variable Reference & Preview */}
        <div className="space-y-4">
          {/* Available Variables */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Variable className="h-4 w-4 text-purple-400" />
                Verfügbare Variablen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Klicken zum Kopieren
              </p>
              <div className="flex flex-wrap gap-2">
                {calculations.map((calc) => (
                  <button
                    key={calc.id}
                    type="button"
                    onClick={() => navigator.clipboard.writeText(calc.id)}
                    className="px-2 py-1 text-xs font-mono bg-purple-500/20 text-purple-400 rounded border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                  >
                    {calc.id}
                  </button>
                ))}
                {calculations.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Noch keine Berechnungen
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-2">
                  Standard-Eingaben (aus Flow-Steps)
                </p>
                <div className="flex flex-wrap gap-2">
                  {["users", "price", "quantity", "months"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => navigator.clipboard.writeText(v)}
                      className="px-2 py-1 text-xs font-mono bg-white/10 text-muted-foreground rounded border border-white/10 hover:bg-white/20 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-400" />
                Formel-Syntax
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Operatoren</p>
                <code className="text-xs font-mono text-cyan-400">
                  + - * / ( )
                </code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Beispiele</p>
                <div className="space-y-1 font-mono text-xs">
                  <p className="text-white/70">users * 10</p>
                  <p className="text-white/70">(a + b) * c</p>
                  <p className="text-white/70">total / 12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="border border-cyan-500/30 bg-cyan-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                Ergebnis-Vorschau
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outputs.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Füge Ausgaben hinzu, um eine Vorschau zu sehen
                </p>
              ) : (
                <div className="space-y-2">
                  {outputs.map((output) => {
                    const FormatIcon =
                      FORMAT_OPTIONS.find((f) => f.value === output.format)?.icon || Hash;
                    return (
                      <div
                        key={output.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                      >
                        <span className="text-sm">{output.label}</span>
                        <span className="text-sm font-mono text-cyan-400 flex items-center gap-1">
                          <FormatIcon className="h-3 w-3" />
                          {output.format === "currency" && "€"}
                          {output.format === "percentage" && "%"}
                          ---
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

