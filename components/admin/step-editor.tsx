"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardStep, WizardField, FieldType } from "@/types/wizard-builder";
import { FieldEditor } from "./field-editor";
import { StepEffectsConfig } from "./step-effects-config";
import {
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  SkipForward,
  Info,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface StepEditorProps {
  step: WizardStep;
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  previewMode: "quick" | "expert";
  onChange: (updates: Partial<WizardStep>) => void;
}

export function StepEditor({
  step,
  calculations,
  priceVariables,
  previewMode,
  onChange,
}: StepEditorProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const addField = () => {
    const newField: WizardField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "Neues Feld",
      variableName: `field_${Date.now()}`,
      visibility: "normal",
      validation: {},
      showInQuickMode: true,
      showInExpertMode: true,
    };
    onChange({
      fields: [...step.fields, newField],
    });
    setExpandedFields(new Set([...expandedFields, newField.id]));
  };

  const updateField = (id: string, updates: Partial<WizardField>) => {
    onChange({
      fields: step.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const removeField = (id: string) => {
    onChange({
      fields: step.fields.filter((f) => f.id !== id),
    });
    const newExpanded = new Set(expandedFields);
    newExpanded.delete(id);
    setExpandedFields(newExpanded);
  };

  const toggleFieldExpand = (id: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFields(newExpanded);
  };

  // Verknüpfte Berechnungen finden
  const linkedCalculations = calculations.filter((calc) =>
    step.calculations.includes(calc.id)
  );

  return (
    <div className="space-y-4">
      {/* Schritt-Grunddaten */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-purple-400" />
            Schritt-Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={step.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="z.B. Unternehmensprofil"
              />
            </div>
            <div className="space-y-2">
              <Label>Reihenfolge</Label>
              <Input
                type="number"
                value={step.order}
                onChange={(e) =>
                  onChange({ order: parseInt(e.target.value) || 1 })
                }
                disabled
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Beschreibung (optional)</Label>
            <Input
              value={step.description || ""}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Kurze Beschreibung dieses Schritts"
            />
          </div>

          {/* Optionen */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Checkbox
                id="required"
                checked={step.isRequired}
                onCheckedChange={(checked) =>
                  onChange({ isRequired: checked === true })
                }
              />
              <Label htmlFor="required" className="flex items-center gap-2 cursor-pointer">
                <CheckCircle className="h-4 w-4 text-red-400" />
                Pflicht-Schritt (kann nicht übersprungen werden)
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="skippable"
                checked={step.isSkippable}
                disabled={step.isRequired}
                onCheckedChange={(checked) =>
                  onChange({ isSkippable: checked === true })
                }
              />
              <Label
                htmlFor="skippable"
                className="flex items-center gap-2 cursor-pointer"
              >
                <SkipForward className="h-4 w-4 text-yellow-400" />
                Überspringbar (Besucher kann diesen Schritt überspringen)
              </Label>
            </div>
            {step.isSkippable && (
              <div className="pl-7 pt-2 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Default-Werte wenn übersprungen (optional)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Diese Werte werden verwendet, wenn der Besucher diesen Schritt überspringt.
                  Format: variableName=wert (eine pro Zeile)
                </p>
                <textarea
                  value={
                    step.skipDefaultValues
                      ? Object.entries(step.skipDefaultValues)
                          .map(([key, value]) => `${key}=${value}`)
                          .join("\n")
                      : ""
                  }
                  onChange={(e) => {
                    const lines = e.target.value.split("\n").filter(Boolean);
                    const defaults: Record<string, any> = {};
                    lines.forEach((line) => {
                      const [key, value] = line.split("=");
                      if (key && value) {
                        defaults[key.trim()] = isNaN(Number(value))
                          ? value.trim()
                          : Number(value);
                      }
                    });
                    onChange({ skipDefaultValues: defaults });
                  }}
                  placeholder="z.B.&#10;users=10&#10;locations=1"
                  className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-mono"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Verknüpfte Berechnungen */}
          <div className="pt-2 border-t border-white/10">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Verknüpfte Berechnungen
            </Label>
            {calculations.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Noch keine Berechnungen definiert
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {calculations.map((calc) => {
                  const isLinked = step.calculations.includes(calc.id);
                  return (
                    <div
                      key={calc.id}
                      className={`text-xs p-2 rounded border transition-colors cursor-pointer ${
                        isLinked
                          ? "bg-purple-500/20 border-purple-500/30"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => {
                        const newCalculations = isLinked
                          ? step.calculations.filter((id) => id !== calc.id)
                          : [...step.calculations, calc.id];
                        onChange({ calculations: newCalculations });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={() => {}}
                          className="h-3 w-3 rounded border-white/20 bg-white/10"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-purple-400">
                            {calc.label || calc.id}
                          </div>
                          <code className="text-muted-foreground text-[10px]">
                            {calc.formula}
                          </code>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Felder */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400" />
              Felder ({step.fields.length})
            </CardTitle>
            <Button onClick={addField} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Feld hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {step.fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Noch keine Felder hinzugefügt
            </div>
          ) : (
            <div className="space-y-2">
              {step.fields.map((field, index) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  isExpanded={expandedFields.has(field.id)}
                  calculations={calculations}
                  priceVariables={priceVariables}
                  previewMode={previewMode}
                  onToggleExpand={() => toggleFieldExpand(field.id)}
                  onChange={(updates) => updateField(field.id, updates)}
                  onDelete={() => removeField(field.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schritt-Effekte */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-purple-400" />
            Effekte & Animationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepEffectsConfig
            effects={step.effects}
            onChange={(effects) => onChange({ effects })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

