"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { WizardField, FieldType } from "@/types/wizard-builder";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface FieldEditorProps {
  field: WizardField;
  index: number;
  isExpanded: boolean;
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  previewMode: "quick" | "expert";
  onToggleExpand: () => void;
  onChange: (updates: Partial<WizardField>) => void;
  onDelete: () => void;
}

const FIELD_TYPES: Array<{ value: FieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "number", label: "Zahl" },
  { value: "email", label: "E-Mail" },
  { value: "tel", label: "Telefon" },
  { value: "select", label: "Auswahl (Select)" },
  { value: "multi_select", label: "Mehrfach-Auswahl" },
  { value: "radio_group", label: "Radio-Buttons" },
  { value: "checkbox_group", label: "Checkbox-Gruppe" },
  { value: "slider", label: "Schieberegler" },
  { value: "textarea", label: "Mehrzeilig" },
  { value: "date", label: "Datum" },
];

const VISIBILITY_OPTIONS = [
  { value: "normal", label: "Normal (immer sichtbar)", icon: Eye },
  {
    value: "optional",
    label: "Optional (mit Toggle)",
    icon: Eye,
  },
  {
    value: "advanced",
    label: "Erweitert (nur Experten-Modus)",
    icon: Settings,
  },
  { value: "hidden", label: "Versteckt", icon: EyeOff },
];

export function FieldEditor({
  field,
  index,
  isExpanded,
  calculations,
  priceVariables,
  previewMode,
  onToggleExpand,
  onChange,
  onDelete,
}: FieldEditorProps) {
  const VisibilityIcon =
    VISIBILITY_OPTIONS.find((v) => v.value === field.visibility)?.icon || Eye;

  return (
    <Card className="border border-white/10 bg-white/5">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="p-1.5 rounded bg-cyan-500/20">
          <VisibilityIcon className="h-3 w-3 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              #{index + 1}
            </span>
            <span className="font-medium text-sm truncate">{field.label}</span>
            <span className="text-xs text-muted-foreground font-mono">
              ({field.variableName})
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">
              {FIELD_TYPES.find((t) => t.value === field.type)?.label}
            </span>
            {field.validation.required && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                Pflicht
              </span>
            )}
            {field.visibility === "advanced" && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                Erweitert
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t border-white/10">
          {/* Grunddaten */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                placeholder="z.B. Anzahl Benutzer"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Variable-Name</Label>
              <Input
                value={field.variableName}
                onChange={(e) => onChange({ variableName: e.target.value })}
                placeholder="z.B. users"
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Feld-Typ</Label>
              <select
                value={field.type}
                onChange={(e) =>
                  onChange({ type: e.target.value as FieldType })
                }
                className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sichtbarkeit</Label>
              <select
                value={field.visibility}
                onChange={(e) =>
                  onChange({
                    visibility: e.target.value as WizardField["visibility"],
                  })
                }
                className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
              >
                {VISIBILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Placeholder (optional)</Label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              placeholder="z.B. Geben Sie eine Zahl ein"
            />
          </div>

          {/* Validierung */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <Label className="text-xs text-muted-foreground">Validierung</Label>
            <div className="flex items-center gap-3">
              <Checkbox
                id={`required-${field.id}`}
                checked={field.validation.required || false}
                onCheckedChange={(checked) =>
                  onChange({
                    validation: {
                      ...field.validation,
                      required: checked === true,
                    },
                  })
                }
              />
              <Label
                htmlFor={`required-${field.id}`}
                className="text-sm cursor-pointer"
              >
                Pflichtfeld
              </Label>
            </div>
            {field.type === "number" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Minimum</Label>
                  <Input
                    type="number"
                    value={field.validation.min || ""}
                    onChange={(e) =>
                      onChange({
                        validation: {
                          ...field.validation,
                          min: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    placeholder="z.B. 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Maximum</Label>
                  <Input
                    type="number"
                    value={field.validation.max || ""}
                    onChange={(e) =>
                      onChange({
                        validation: {
                          ...field.validation,
                          max: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    placeholder="z.B. 1000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modus-Sichtbarkeit */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <Label className="text-xs text-muted-foreground">
              In welchen Modi anzeigen?
            </Label>
            <div className="flex items-center gap-3">
              <Checkbox
                id={`quick-${field.id}`}
                checked={field.showInQuickMode !== false}
                onCheckedChange={(checked) =>
                  onChange({ showInQuickMode: checked === true })
                }
              />
              <Label htmlFor={`quick-${field.id}`} className="text-sm cursor-pointer">
                Schnell-Modus
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id={`expert-${field.id}`}
                checked={field.showInExpertMode !== false}
                onCheckedChange={(checked) =>
                  onChange({ showInExpertMode: checked === true })
                }
              />
              <Label htmlFor={`expert-${field.id}`} className="text-sm cursor-pointer">
                Experten-Modus
              </Label>
            </div>
          </div>

          {/* Options für Select/Radio */}
          {(field.type === "select" ||
            field.type === "radio_group" ||
            field.type === "multi_select") && (
            <div className="pt-2 border-t border-white/10">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Optionen (eine pro Zeile, Format: value|Label)
              </Label>
              <textarea
                value={
                  field.options
                    ?.map((opt) => `${opt.value}|${opt.label}`)
                    .join("\n") || ""
                }
                onChange={(e) => {
                  const lines = e.target.value.split("\n").filter(Boolean);
                  const options = lines.map((line) => {
                    const [value, label] = line.split("|");
                    return { value: value?.trim() || "", label: label?.trim() || value?.trim() || "" };
                  });
                  onChange({ options });
                }}
                placeholder="z.B.&#10;option1|Option 1&#10;option2|Option 2"
                className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
                rows={4}
              />
            </div>
          )}

          {/* Hilfe-Text */}
          <div className="space-y-2">
            <Label className="text-xs">Hilfe-Text (optional)</Label>
            <Input
              value={field.helpText || ""}
              onChange={(e) => onChange({ helpText: e.target.value })}
              placeholder="Erklärung für den Benutzer"
            />
          </div>

          {/* Löschen */}
          <div className="flex justify-end pt-2 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Feld entfernen
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

