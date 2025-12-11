"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardStep } from "@/types/wizard-builder";
import {
  Calculator,
  Eye,
  Zap,
  TrendingUp,
  DollarSign,
  Percent,
  Hash,
  Type,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface LiveCalculationPreviewProps {
  steps: WizardStep[];
  selectedStepId: string | null;
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  previewMode: "quick" | "expert";
  onModeChange: (mode: "quick" | "expert") => void;
}

export function LiveCalculationPreview({
  steps,
  selectedStepId,
  calculations,
  priceVariables,
  previewMode,
  onModeChange,
}: LiveCalculationPreviewProps) {
  const [mockValues, setMockValues] = useState<Record<string, number>>({});

  // Mock-Werte für Demo generieren
  useEffect(() => {
    const values: Record<string, number> = {};
    steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (field.type === "number") {
          values[field.variableName] = field.validation.min || 10;
        }
      });
    });
    // Preis-Variablen hinzufügen
    priceVariables.forEach((pv) => {
      values[pv.variableName] = pv.value;
    });
    setMockValues(values);
  }, [steps, priceVariables]);

  // Berechnungen ausführen (vereinfacht)
  const calculatedResults = useMemo(() => {
    const results: Record<string, number> = { ...mockValues };

    // Einfache Formel-Auswertung (nur für Demo)
    calculations.forEach((calc) => {
      try {
        let formula = calc.formula;
        // Ersetze Variablen durch Werte
        Object.keys(results).forEach((varName) => {
          const regex = new RegExp(`\\b${varName}\\b`, "g");
          formula = formula.replace(regex, results[varName].toString());
        });
        // Einfache Auswertung (nur +, -, *, /)
        const result = eval(formula);
        if (typeof result === "number" && !isNaN(result)) {
          results[calc.id] = result;
        }
      } catch (e) {
        // Fehler ignorieren für Demo
      }
    });

    return results;
  }, [mockValues, calculations]);

  const selectedStep = steps.find((s) => s.id === selectedStepId);
  const currentStepIndex = selectedStep
    ? steps.findIndex((s) => s.id === selectedStepId)
    : -1;

  // Sichtbare Felder basierend auf Modus
  const visibleFields = selectedStep
    ? selectedStep.fields.filter((field) => {
        if (previewMode === "quick") {
          return field.showInQuickMode !== false && field.visibility !== "hidden";
        } else {
          return field.showInExpertMode !== false && field.visibility !== "hidden";
        }
      })
    : [];

  return (
    <div className="space-y-4">
      {/* Modus-Toggle */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              Live-Vorschau
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onModeChange(previewMode === "quick" ? "expert" : "quick")
              }
              className="gap-2"
            >
              {previewMode === "quick" ? (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  Schnell
                </>
              ) : (
                <>
                  <ToggleRight className="h-4 w-4" />
                  Experten
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Fortschritt */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Schritt {currentStepIndex + 1} von {steps.length}
              </span>
              <span className="text-muted-foreground">
                {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                style={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktueller Schritt */}
      {selectedStep && (
        <Card className="border border-purple-500/30 bg-purple-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              Aktueller Schritt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="font-medium text-sm">{selectedStep.title}</div>
              {selectedStep.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedStep.description}
                </div>
              )}
            </div>

            {/* Felder-Vorschau */}
            {visibleFields.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-xs text-muted-foreground mb-2">
                  Sichtbare Felder ({visibleFields.length}):
                </div>
                {visibleFields.map((field) => (
                  <div
                    key={field.id}
                    className="text-xs p-2 rounded bg-white/5 border border-white/10"
                  >
                    <div className="font-medium">{field.label}</div>
                    <div className="text-muted-foreground font-mono mt-1">
                      {field.variableName} = {mockValues[field.variableName] || "?"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Optionen */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              {selectedStep.isRequired && (
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                  Pflicht
                </span>
              )}
              {selectedStep.isSkippable && (
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                  Überspringbar
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Berechnungen */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-emerald-400" />
            Berechnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calculations.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              Noch keine Berechnungen
            </div>
          ) : (
            <div className="space-y-2">
              {calculations.map((calc) => {
                const result = calculatedResults[calc.id];
                const hasResult = result !== undefined && !isNaN(result);

                return (
                  <div
                    key={calc.id}
                    className="text-xs p-2 rounded bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {calc.label || calc.id}
                      </span>
                      {hasResult && (
                        <span className="font-mono text-emerald-400">
                          {result.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <code className="text-muted-foreground text-[10px]">
                      {calc.formula}
                    </code>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preis-Variablen */}
      {priceVariables.length > 0 && (
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-400" />
              Preise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {priceVariables.map((pv) => (
                <div
                  key={pv.variableName}
                  className="flex items-center justify-between text-xs p-1.5 rounded bg-white/5"
                >
                  <code className="text-muted-foreground font-mono">
                    {pv.variableName}
                  </code>
                  <span className="font-mono text-amber-400">
                    {pv.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

