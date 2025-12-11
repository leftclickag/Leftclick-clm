"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { WizardStep, WizardField, FieldType } from "@/types/wizard-builder";
import {
  Plus,
  Trash2,
  GripVertical,
  FormInput,
  Hash,
  Mail,
  Phone,
  Calendar,
  List,
  CheckSquare,
  Radio,
  SlidersHorizontal,
  FileText,
  Settings,
  Eye,
  Copy,
  ChevronUp,
  ChevronDown,
  PieChart,
  Calculator,
  Table,
  Sparkles,
  Edit3,
  Check,
  X,
  BarChart3,
  DollarSign,
  Zap,
  Info,
} from "lucide-react";

interface VisualFormBuilderProps {
  initialSteps?: WizardStep[];
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  onChange: (steps: WizardStep[]) => void;
  onCalculationsChange?: (calculations: Array<{ id: string; formula: string; label?: string }>) => void;
}

// Feld-Typen
const FIELD_TYPES = [
  { type: "text" as FieldType, label: "Text", icon: FormInput, color: "bg-blue-500" },
  { type: "number" as FieldType, label: "Zahl", icon: Hash, color: "bg-green-500" },
  { type: "email" as FieldType, label: "E-Mail", icon: Mail, color: "bg-purple-500" },
  { type: "tel" as FieldType, label: "Telefon", icon: Phone, color: "bg-orange-500" },
  { type: "select" as FieldType, label: "Auswahl", icon: List, color: "bg-cyan-500" },
  { type: "slider" as FieldType, label: "Schieberegler", icon: SlidersHorizontal, color: "bg-teal-500" },
  { type: "checkbox_group" as FieldType, label: "Checkboxen", icon: CheckSquare, color: "bg-red-500" },
  { type: "radio_group" as FieldType, label: "Radio", icon: Radio, color: "bg-yellow-500" },
];

// Ergebnis-Komponenten für Schlussseite
const RESULT_COMPONENTS = [
  { type: "total", label: "Gesamtsumme", icon: Calculator, color: "bg-emerald-500" },
  { type: "chart_pie", label: "Kreisdiagramm", icon: PieChart, color: "bg-violet-500" },
  { type: "chart_bar", label: "Balkendiagramm", icon: BarChart3, color: "bg-blue-500" },
  { type: "table", label: "Ergebnis-Tabelle", icon: Table, color: "bg-amber-500" },
  { type: "summary", label: "Zusammenfassung", icon: FileText, color: "bg-pink-500" },
];

export function VisualFormBuilder({
  initialSteps = [],
  calculations,
  priceVariables,
  onChange,
  onCalculationsChange,
}: VisualFormBuilderProps) {
  // Default-Schritte: 1 Eingabe-Schritt + 1 Ergebnis-Schritt
  const [steps, setSteps] = useState<WizardStep[]>(() => {
    if (initialSteps.length > 0) return initialSteps;
    return [
      {
        id: "step_1",
        title: "Eingaben",
        order: 1,
        isRequired: true,
        isSkippable: false,
        fields: [],
        calculations: [],
        effects: {},
      },
      {
        id: "step_result",
        title: "Ergebnis",
        order: 2,
        isRequired: true,
        isSkippable: false,
        fields: [],
        calculations: [],
        effects: {},
        isResultStep: true,
      } as WizardStep & { isResultStep?: boolean },
    ];
  });

  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [editingField, setEditingField] = useState<WizardField | null>(null);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [showCalculationDialog, setShowCalculationDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Lokale Berechnungen
  const [localCalculations, setLocalCalculations] = useState(calculations);

  const selectedStep = steps[selectedStepIndex];

  useEffect(() => {
    onChange(steps);
  }, [steps, onChange]);

  // Feld hinzufügen
  const addField = (type: FieldType) => {
    const fieldType = FIELD_TYPES.find(f => f.type === type);
    const newField: WizardField = {
      id: `field_${Date.now()}`,
      type,
      label: `Neues ${fieldType?.label || "Feld"}`,
      variableName: `var_${Date.now()}`,
      visibility: "normal",
      validation: {},
      showInQuickMode: true,
      showInExpertMode: true,
    };

    if (type === "slider") {
      newField.validation = { min: 0, max: 100 };
    }

    setSteps(steps.map((step, i) => 
      i === selectedStepIndex 
        ? { ...step, fields: [...step.fields, newField] }
        : step
    ));

    // Sofort zum Bearbeiten öffnen
    setEditingField(newField);
    setShowFieldDialog(true);
  };

  // Feld aktualisieren
  const updateField = (fieldId: string, updates: Partial<WizardField>) => {
    setSteps(steps.map((step, i) => 
      i === selectedStepIndex 
        ? { 
            ...step, 
            fields: step.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) 
          }
        : step
    ));
    if (editingField?.id === fieldId) {
      setEditingField({ ...editingField, ...updates });
    }
  };

  // Feld löschen
  const deleteField = (fieldId: string) => {
    setSteps(steps.map((step, i) => 
      i === selectedStepIndex 
        ? { ...step, fields: step.fields.filter(f => f.id !== fieldId) }
        : step
    ));
    setShowFieldDialog(false);
    setEditingField(null);
  };

  // Feld verschieben
  const moveField = (fieldId: string, direction: "up" | "down") => {
    const currentFields = selectedStep.fields;
    const index = currentFields.findIndex(f => f.id === fieldId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentFields.length) return;

    const newFields = [...currentFields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];

    setSteps(steps.map((step, i) => 
      i === selectedStepIndex ? { ...step, fields: newFields } : step
    ));
  };

  // Schritt hinzufügen (vor dem Ergebnis-Schritt)
  const addStep = () => {
    const resultIndex = steps.findIndex((s: any) => s.isResultStep);
    const insertIndex = resultIndex > 0 ? resultIndex : steps.length;
    
    const newStep: WizardStep = {
      id: `step_${Date.now()}`,
      title: `Schritt ${insertIndex + 1}`,
      order: insertIndex + 1,
      isRequired: true,
      isSkippable: false,
      fields: [],
      calculations: [],
      effects: {},
    };

    const newSteps = [...steps];
    newSteps.splice(insertIndex, 0, newStep);
    
    // Order aktualisieren
    newSteps.forEach((s, i) => s.order = i + 1);
    
    setSteps(newSteps);
    setSelectedStepIndex(insertIndex);
  };

  // Schritt umbenennen
  const renameStep = (index: number, title: string) => {
    setSteps(steps.map((step, i) => 
      i === index ? { ...step, title } : step
    ));
  };

  // Alle Variablen sammeln (für Berechnungen)
  const allVariables = steps.flatMap(step => 
    step.fields.map(f => ({ name: f.variableName, label: f.label, type: f.type }))
  );

  // Berechnung speichern
  const saveCalculation = (calc: { id: string; formula: string; label: string }) => {
    const newCalcs = [...localCalculations];
    const existingIndex = newCalcs.findIndex(c => c.id === calc.id);
    if (existingIndex >= 0) {
      newCalcs[existingIndex] = calc;
    } else {
      newCalcs.push(calc);
    }
    setLocalCalculations(newCalcs);
    onCalculationsChange?.(newCalcs);
    setShowCalculationDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header mit Aktionen */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Formular-Builder</h2>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCalculationDialog(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Berechnungen ({localCalculations.length})
          </Button>
          <Button size="sm" onClick={addStep}>
            <Plus className="h-4 w-4 mr-2" />
            Schritt hinzufügen
          </Button>
        </div>
      </div>

      {/* Schritt-Tabs */}
      <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl overflow-x-auto">
        {steps.map((step, index) => {
          const isResult = (step as any).isResultStep;
          return (
            <button
              key={step.id}
              onClick={() => setSelectedStepIndex(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                selectedStepIndex === index
                  ? isResult 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "hover:bg-white/10 text-muted-foreground"
              }`}
            >
              {isResult ? <Sparkles className="h-4 w-4" /> : <span className="font-mono text-xs">{index + 1}</span>}
              <span>{step.title}</span>
              {!isResult && (
                <span className="text-xs opacity-50">({step.fields.length} Felder)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hauptbereich */}
      <div className="grid grid-cols-12 gap-6">
        {/* Linke Spalte: Komponenten-Palette */}
        <div className="col-span-3 space-y-4">
          <Card className="border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-purple-400" />
                Komponenten hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Eingabe-Felder */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Eingabe-Felder</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FIELD_TYPES.map((fieldType) => {
                    const Icon = fieldType.icon;
                    return (
                      <button
                        key={fieldType.type}
                        onClick={() => addField(fieldType.type)}
                        className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-center group"
                      >
                        <div className={`${fieldType.color} p-2 rounded-lg mb-2 inline-flex group-hover:scale-110 transition-transform`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-xs font-medium">{fieldType.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ergebnis-Komponenten (nur im Ergebnis-Schritt) */}
              {(selectedStep as any)?.isResultStep && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Ergebnis-Elemente</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESULT_COMPONENTS.map((comp) => {
                      const Icon = comp.icon;
                      return (
                        <button
                          key={comp.type}
                          onClick={() => {
                            // Ergebnis-Komponente hinzufügen
                            const newField: WizardField = {
                              id: `result_${Date.now()}`,
                              type: "text" as FieldType,
                              label: comp.label,
                              variableName: `result_${comp.type}_${Date.now()}`,
                              visibility: "normal",
                              validation: {},
                              showInQuickMode: true,
                              showInExpertMode: true,
                              resultType: comp.type,
                            } as WizardField & { resultType?: string };
                            setSteps(steps.map((step, i) => 
                              i === selectedStepIndex 
                                ? { ...step, fields: [...step.fields, newField] }
                                : step
                            ));
                          }}
                          className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-center group"
                        >
                          <div className={`${comp.color} p-2 rounded-lg mb-2 inline-flex group-hover:scale-110 transition-transform`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-xs font-medium">{comp.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick-Info */}
          <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-cyan-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-white mb-1">So funktioniert's:</p>
                  <ul className="space-y-1">
                    <li>• Klicken Sie auf eine Komponente zum Hinzufügen</li>
                    <li>• Klicken Sie auf ein Feld zum Bearbeiten</li>
                    <li>• Pfeile zum Sortieren verwenden</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mittlere Spalte: Formular-Vorschau */}
        <div className="col-span-6">
          <Card className="border-white/10 min-h-[500px]">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <EditableTitle
                    value={selectedStep.title}
                    onChange={(title) => renameStep(selectedStepIndex, title)}
                  />
                  {(selectedStep as any).isResultStep && (
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">
                      Ergebnis-Seite
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {selectedStep.fields.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="mb-2">Keine Felder vorhanden</p>
                  <p className="text-xs">Klicken Sie links auf eine Komponente, um sie hinzuzufügen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStep.fields.map((field, index) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      index={index}
                      total={selectedStep.fields.length}
                      onEdit={() => {
                        setEditingField(field);
                        setShowFieldDialog(true);
                      }}
                      onDelete={() => deleteField(field.id)}
                      onMoveUp={() => moveField(field.id, "up")}
                      onMoveDown={() => moveField(field.id, "down")}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte: Berechnungen & Variablen */}
        <div className="col-span-3 space-y-4">
          {/* Variablen-Übersicht */}
          <Card className="border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Verfügbare Variablen
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[200px] overflow-y-auto">
              {allVariables.length === 0 ? (
                <p className="text-xs text-muted-foreground">Noch keine Felder erstellt</p>
              ) : (
                <div className="space-y-1">
                  {allVariables.map((v) => (
                    <div key={v.name} className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                      <span className="text-muted-foreground">{v.label}</span>
                      <code className="text-purple-400 font-mono">{v.name}</code>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Berechnungen */}
          <Card className="border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Berechnungen
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7"
                  onClick={() => setShowCalculationDialog(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[200px] overflow-y-auto">
              {localCalculations.length === 0 ? (
                <p className="text-xs text-muted-foreground">Keine Berechnungen definiert</p>
              ) : (
                <div className="space-y-2">
                  {localCalculations.map((calc) => (
                    <div key={calc.id} className="p-2 rounded bg-white/5 border border-white/10">
                      <div className="text-sm font-medium">{calc.label}</div>
                      <code className="text-xs text-muted-foreground font-mono">{calc.formula}</code>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preis-Variablen */}
          <Card className="border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                Preise ({priceVariables.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[150px] overflow-y-auto">
              {priceVariables.length === 0 ? (
                <p className="text-xs text-muted-foreground">Keine Preise definiert</p>
              ) : (
                <div className="space-y-1">
                  {priceVariables.slice(0, 5).map((pv) => (
                    <div key={pv.variableName} className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                      <code className="text-green-400 font-mono">{pv.variableName}</code>
                      <span className="text-muted-foreground">{pv.value.toFixed(2)} €</span>
                    </div>
                  ))}
                  {priceVariables.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{priceVariables.length - 5} weitere
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feld-Bearbeitungs-Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Feld bearbeiten</DialogTitle>
          </DialogHeader>
          {editingField && (
            <DialogBody>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Feld-Bezeichnung</Label>
                  <Input
                    value={editingField.label}
                    onChange={(e) => updateField(editingField.id, { label: e.target.value })}
                    placeholder="z.B. Anzahl Mitarbeiter"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Variablen-Name (für Berechnungen)</Label>
                  <Input
                    value={editingField.variableName}
                    onChange={(e) => updateField(editingField.id, { variableName: e.target.value })}
                    placeholder="z.B. mitarbeiter"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Feld-Typ</Label>
                  <select
                    value={editingField.type}
                    onChange={(e) => updateField(editingField.id, { type: e.target.value as FieldType })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2"
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft.type} value={ft.type}>{ft.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Placeholder</Label>
                  <Input
                    value={editingField.placeholder || ""}
                    onChange={(e) => updateField(editingField.id, { placeholder: e.target.value })}
                    placeholder="z.B. Geben Sie eine Zahl ein"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="required"
                    checked={editingField.validation.required || false}
                    onChange={(e) => updateField(editingField.id, { 
                      validation: { ...editingField.validation, required: e.target.checked } 
                    })}
                    className="rounded"
                  />
                  <Label htmlFor="required">Pflichtfeld</Label>
                </div>
                {(editingField.type === "number" || editingField.type === "slider") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum</Label>
                      <Input
                        type="number"
                        value={editingField.validation.min ?? ""}
                        onChange={(e) => updateField(editingField.id, { 
                          validation: { ...editingField.validation, min: e.target.value ? Number(e.target.value) : undefined } 
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum</Label>
                      <Input
                        type="number"
                        value={editingField.validation.max ?? ""}
                        onChange={(e) => updateField(editingField.id, { 
                          validation: { ...editingField.validation, max: e.target.value ? Number(e.target.value) : undefined } 
                        })}
                      />
                    </div>
                  </div>
                )}
                {(editingField.type === "select" || editingField.type === "radio_group" || editingField.type === "checkbox_group") && (
                  <div className="space-y-2">
                    <Label>Optionen (eine pro Zeile)</Label>
                    <textarea
                      value={editingField.options?.map(o => `${o.value}|${o.label}`).join("\n") || ""}
                      onChange={(e) => {
                        const options = e.target.value.split("\n").filter(Boolean).map(line => {
                          const [value, label] = line.split("|");
                          return { value: value?.trim() || "", label: label?.trim() || value?.trim() || "" };
                        });
                        updateField(editingField.id, { options });
                      }}
                      placeholder="option1|Option 1&#10;option2|Option 2"
                      className="w-full min-h-[100px] rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={() => editingField && deleteField(editingField.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </Button>
            <Button onClick={() => setShowFieldDialog(false)}>
              <Check className="h-4 w-4 mr-2" />
              Fertig
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Berechnungs-Dialog */}
      <CalculationDialog
        open={showCalculationDialog}
        onOpenChange={setShowCalculationDialog}
        calculations={localCalculations}
        variables={allVariables}
        priceVariables={priceVariables}
        onSave={saveCalculation}
        onDelete={(id) => {
          setLocalCalculations(localCalculations.filter(c => c.id !== id));
          onCalculationsChange?.(localCalculations.filter(c => c.id !== id));
        }}
      />

      {/* Vorschau-Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Formular-Vorschau</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <FormPreviewContent steps={steps} />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Editierbarer Titel
function EditableTitle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange(temp);
              setEditing(false);
            } else if (e.key === "Escape") {
              setTemp(value);
              setEditing(false);
            }
          }}
          className="h-8 w-[200px]"
          autoFocus
        />
        <Button size="sm" variant="ghost" onClick={() => { onChange(temp); setEditing(false); }}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setTemp(value); setEditing(false); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setEditing(true)}
      className="text-lg font-medium hover:text-purple-400 transition-colors flex items-center gap-2"
    >
      {value}
      <Edit3 className="h-4 w-4 opacity-50" />
    </button>
  );
}

// Feld-Karte
function FieldCard({ 
  field, 
  index, 
  total,
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown 
}: { 
  field: WizardField; 
  index: number;
  total: number;
  onEdit: () => void; 
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const fieldType = FIELD_TYPES.find(ft => ft.type === field.type);
  const Icon = fieldType?.icon || FormInput;

  return (
    <div 
      className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all group cursor-pointer"
      onClick={onEdit}
    >
      <div className="flex items-center gap-3">
        <div className={`${fieldType?.color || "bg-gray-500"} p-2 rounded-lg`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium flex items-center gap-2">
            {field.label}
            {field.validation.required && <span className="text-red-400 text-xs">*</span>}
          </div>
          <div className="text-xs text-muted-foreground font-mono">{field.variableName}</div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === total - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-red-400 hover:text-red-300"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Visueller Berechnungs-Dialog
function CalculationDialog({
  open,
  onOpenChange,
  calculations,
  variables,
  priceVariables,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculations: Array<{ id: string; formula: string; label?: string }>;
  variables: Array<{ name: string; label: string; type: FieldType }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  onSave: (calc: { id: string; formula: string; label: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [editingCalc, setEditingCalc] = useState<{ id: string; formula: string; label: string } | null>(null);
  const [formulaParts, setFormulaParts] = useState<string[]>([]);

  const startNewCalc = () => {
    setEditingCalc({ id: `calc_${Date.now()}`, formula: "", label: "Neue Berechnung" });
    setFormulaParts([]);
  };

  const addToParts = (part: string) => {
    setFormulaParts([...formulaParts, part]);
  };

  const buildFormula = () => {
    return formulaParts.join(" ");
  };

  const saveCurrentCalc = () => {
    if (!editingCalc) return;
    onSave({
      ...editingCalc,
      formula: buildFormula(),
    });
    setEditingCalc(null);
    setFormulaParts([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Berechnungen</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {!editingCalc ? (
            <div className="space-y-4">
              <Button onClick={startNewCalc} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Neue Berechnung erstellen
              </Button>
              
              {calculations.length > 0 && (
                <div className="space-y-2">
                  <Label>Vorhandene Berechnungen</Label>
                  {calculations.map((calc) => (
                    <div key={calc.id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{calc.label}</span>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingCalc({ id: calc.id, formula: calc.formula, label: calc.label || "" });
                              setFormulaParts(calc.formula.split(" "));
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400"
                            onClick={() => onDelete(calc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <code className="text-sm text-muted-foreground font-mono block bg-black/20 p-2 rounded">
                        {calc.formula}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Berechnungs-Name</Label>
                <Input
                  value={editingCalc.label}
                  onChange={(e) => setEditingCalc({ ...editingCalc, label: e.target.value })}
                  placeholder="z.B. Gesamtkosten"
                />
              </div>

              {/* Formel-Anzeige */}
              <div className="space-y-2">
                <Label>Formel</Label>
                <div className="p-4 rounded-lg border border-white/10 bg-black/20 min-h-[60px] font-mono text-lg">
                  {formulaParts.length === 0 ? (
                    <span className="text-muted-foreground">Klicken Sie auf Variablen und Operatoren...</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formulaParts.map((part, i) => (
                        <span 
                          key={i} 
                          className={`px-2 py-1 rounded ${
                            ["+", "-", "*", "/", "(", ")"].includes(part) 
                              ? "bg-yellow-500/20 text-yellow-300" 
                              : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFormulaParts(formulaParts.slice(0, -1))}
                  disabled={formulaParts.length === 0}
                >
                  Letztes Element entfernen
                </Button>
              </div>

              {/* Variablen */}
              <div className="space-y-2">
                <Label>Variablen einfügen</Label>
                <div className="flex flex-wrap gap-2">
                  {variables.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => addToParts(v.name)}
                      className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm hover:bg-purple-500/20 transition-all"
                    >
                      {v.label}
                    </button>
                  ))}
                  {priceVariables.slice(0, 5).map((pv) => (
                    <button
                      key={pv.variableName}
                      onClick={() => addToParts(pv.variableName)}
                      className="px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10 text-green-300 text-sm hover:bg-green-500/20 transition-all"
                    >
                      {pv.variableName} ({pv.value}€)
                    </button>
                  ))}
                </div>
              </div>

              {/* Operatoren */}
              <div className="space-y-2">
                <Label>Operatoren</Label>
                <div className="flex flex-wrap gap-2">
                  {["+", "-", "*", "/", "(", ")"].map((op) => (
                    <button
                      key={op}
                      onClick={() => addToParts(op)}
                      className="w-10 h-10 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-lg font-bold hover:bg-yellow-500/20 transition-all"
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zahlen eingeben */}
              <div className="space-y-2">
                <Label>Zahl hinzufügen</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Zahl eingeben"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        addToParts(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => { setEditingCalc(null); setFormulaParts([]); }}>
                  Abbrechen
                </Button>
                <Button onClick={saveCurrentCalc} disabled={formulaParts.length === 0}>
                  <Check className="h-4 w-4 mr-2" />
                  Berechnung speichern
                </Button>
              </div>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

// Formular-Vorschau
function FormPreviewContent({ steps }: { steps: WizardStep[] }) {
  return (
    <div className="space-y-6">
      {steps.map((step, stepIndex) => (
        <Card key={step.id} className="border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {stepIndex + 1}. {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step.fields.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Keine Felder</p>
            ) : (
              step.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.validation.required && <span className="text-red-400 ml-1">*</span>}
                  </Label>
                  <FieldPreviewInput field={field} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Feld-Vorschau
function FieldPreviewInput({ field }: { field: WizardField }) {
  switch (field.type) {
    case "text":
    case "email":
    case "tel":
      return <Input placeholder={field.placeholder || field.label} disabled />;
    case "number":
      return <Input type="number" placeholder={field.placeholder || field.label} disabled />;
    case "slider":
      return (
        <div className="space-y-2">
          <input type="range" className="w-full" disabled />
          <div className="text-xs text-muted-foreground">
            {field.validation.min ?? 0} - {field.validation.max ?? 100}
          </div>
        </div>
      );
    case "select":
      return (
        <select className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" disabled>
          <option>{field.placeholder || "Auswahl..."}</option>
        </select>
      );
    default:
      return <Input placeholder={field.label} disabled />;
  }
}

