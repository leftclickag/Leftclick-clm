"use client";

import { useState, useEffect } from "react";
import { 
  DndContext, 
  DragOverlay,
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  useSortable, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardStep, WizardField, FieldType } from "@/types/wizard-builder";
import { FieldEditor } from "./field-editor";
import { LiveCalculationPreview } from "./live-calculation-preview";
import {
  GripVertical,
  Plus,
  Trash2,
  Settings,
  Eye,
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
  X,
  Edit2,
  Move,
} from "lucide-react";

interface DragDropWizardBuilderProps {
  initialSteps?: WizardStep[];
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  onChange: (steps: WizardStep[]) => void;
}

// Feld-Typen für die Toolbox
const FIELD_TYPES: Array<{ 
  type: FieldType; 
  label: string; 
  icon: any;
  description: string;
}> = [
  { type: "text", label: "Text", icon: FormInput, description: "Einzeiliges Textfeld" },
  { type: "number", label: "Zahl", icon: Hash, description: "Numerisches Eingabefeld" },
  { type: "email", label: "E-Mail", icon: Mail, description: "E-Mail-Adresse" },
  { type: "tel", label: "Telefon", icon: Phone, description: "Telefonnummer" },
  { type: "date", label: "Datum", icon: Calendar, description: "Datumsauswahl" },
  { type: "textarea", label: "Mehrzeilig", icon: FileText, description: "Mehrzeiliges Textfeld" },
  { type: "select", label: "Auswahl", icon: List, description: "Dropdown-Auswahl" },
  { type: "radio_group", label: "Radio", icon: Radio, description: "Radio-Buttons" },
  { type: "checkbox_group", label: "Checkboxen", icon: CheckSquare, description: "Mehrfachauswahl" },
  { type: "slider", label: "Schieberegler", icon: SlidersHorizontal, description: "Wert-Schieberegler" },
];

export function DragDropWizardBuilder({
  initialSteps = [],
  calculations,
  priceVariables,
  onChange,
}: DragDropWizardBuilderProps) {
  const [steps, setSteps] = useState<WizardStep[]>(
    initialSteps.map((s, idx) => ({
      ...s,
      order: s.order || idx + 1,
    }))
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    steps[0]?.id || null
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"quick" | "expert">("quick");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [draggedFieldType, setDraggedFieldType] = useState<FieldType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedStep = steps.find((s) => s.id === selectedStepId);

  // Update parent when steps change
  useEffect(() => {
    onChange(steps);
  }, [steps, onChange]);

  // Cleanup: Wenn selectedFieldId nicht mehr existiert, zurücksetzen
  useEffect(() => {
    if (selectedFieldId && selectedStep) {
      const fieldExists = selectedStep.fields.some(f => f.id === selectedFieldId);
      if (!fieldExists) {
        setSelectedFieldId(null);
      }
    }
  }, [selectedFieldId, selectedStep]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
    
    // Prüfe ob es ein Feld-Typ aus der Toolbox ist
    const fieldType = FIELD_TYPES.find(ft => `toolbox-${ft.type}` === active.id);
    if (fieldType) {
      setDraggedFieldType(fieldType.type);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setDraggedFieldType(null);

    if (!over) return;

    // Wenn ein Feld-Typ aus der Toolbox gezogen wurde
    if (active.id.toString().startsWith("toolbox-")) {
      const fieldType = active.id.toString().replace("toolbox-", "") as FieldType;
      
      if (over.id.toString().startsWith("step-preview-")) {
        const stepId = over.id.toString().replace("step-preview-", "");
        addFieldToStep(stepId, fieldType);
      }
      return;
    }

    // Wenn ein Feld innerhalb eines Schritts verschoben wird
    if (active.id !== over.id) {
      const activeFieldId = active.id.toString();
      const overFieldId = over.id.toString();
      
      // Prüfe ob es sich um Felder handelt
      const activeField = findFieldInSteps(activeFieldId);
      const overField = findFieldInSteps(overFieldId);
      
      if (activeField && overField && activeField.stepId === overField.stepId) {
        // Verschiebe Feld innerhalb desselben Schritts
        moveFieldInStep(activeField.stepId, activeFieldId, overFieldId);
      } else if (activeField && overField && activeField.stepId !== overField.stepId) {
        // Verschiebe Feld zwischen Schritten
        moveFieldBetweenSteps(activeField.stepId, overField.stepId, activeFieldId);
      }
    }
  };

  const findFieldInSteps = (fieldId: string): { field: WizardField; stepId: string } | null => {
    for (const step of steps) {
      const field = step.fields.find(f => f.id === fieldId);
      if (field) {
        return { field, stepId: step.id };
      }
    }
    return null;
  };

  const addFieldToStep = (stepId: string, fieldType: FieldType) => {
    const newField: WizardField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `Neues ${FIELD_TYPES.find(ft => ft.type === fieldType)?.label || "Feld"}`,
      variableName: `field_${Date.now()}`,
      visibility: "normal",
      validation: {},
      showInQuickMode: true,
      showInExpertMode: true,
    };

    setSteps((items) =>
      items.map((item) =>
        item.id === stepId
          ? { ...item, fields: [...item.fields, newField] }
          : item
      )
    );
    setSelectedFieldId(newField.id);
  };

  const moveFieldInStep = (stepId: string, fieldId: string, overFieldId: string) => {
    setSteps((items) =>
      items.map((item) => {
        if (item.id === stepId) {
          const fieldIndex = item.fields.findIndex((f) => f.id === fieldId);
          const overIndex = item.fields.findIndex((f) => f.id === overFieldId);
          const newFields = arrayMove(item.fields, fieldIndex, overIndex);
          return { ...item, fields: newFields };
        }
        return item;
      })
    );
  };

  const moveFieldBetweenSteps = (fromStepId: string, toStepId: string, fieldId: string) => {
    setSteps((items) => {
      const fromStep = items.find((s) => s.id === fromStepId);
      const field = fromStep?.fields.find((f) => f.id === fieldId);
      if (!field) return items;

      return items.map((item) => {
        if (item.id === fromStepId) {
          return { ...item, fields: item.fields.filter((f) => f.id !== fieldId) };
        }
        if (item.id === toStepId) {
          return { ...item, fields: [...item.fields, field] };
        }
        return item;
      });
    });
  };

  const addStep = () => {
    const newStep: WizardStep = {
      id: `step_${Date.now()}`,
      title: `Schritt ${steps.length + 1}`,
      order: steps.length + 1,
      isRequired: true,
      isSkippable: false,
      fields: [],
      calculations: [],
      effects: {},
    };
    const updated = [...steps, newStep];
    setSteps(updated);
    setSelectedStepId(newStep.id);
  };

  const removeStep = (id: string) => {
    if (confirm("Möchten Sie diesen Schritt wirklich löschen?")) {
      const filtered = steps.filter((s) => s.id !== id);
      const updated = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
      setSteps(updated);
      if (selectedStepId === id) {
        setSelectedStepId(updated[0]?.id || null);
      }
    }
  };

  const updateStep = (id: string, updates: Partial<WizardStep>) => {
    setSteps((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const updateField = (stepId: string, fieldId: string, updates: Partial<WizardField>) => {
    setSteps((items) =>
      items.map((item) =>
        item.id === stepId
          ? {
              ...item,
              fields: item.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : item
      )
    );
  };

  const removeField = (stepId: string, fieldId: string) => {
    setSteps((items) =>
      items.map((item) =>
        item.id === stepId
          ? { ...item, fields: item.fields.filter((f) => f.id !== fieldId) }
          : item
      )
    );
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
        {/* Linke Spalte: Toolbox */}
        <div className="col-span-2 space-y-4 overflow-y-auto border-r border-white/10 pr-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 pb-2">
            <h3 className="text-sm font-semibold mb-2">Feld-Toolbox</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Ziehen Sie Felder in die Vorschau
            </p>
          </div>
          <div className="space-y-2">
            {FIELD_TYPES.map((fieldType) => (
              <ToolboxField key={fieldType.type} fieldType={fieldType} />
            ))}
          </div>
        </div>

        {/* Mittlere Spalte: Schritt-Liste & Editor */}
        <div className="col-span-5 flex flex-col gap-4 overflow-hidden">
          {/* Schritt-Liste */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 pb-2">
              <h3 className="text-sm font-semibold">Schritte</h3>
              <Button onClick={addStep} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <SortableContext
              items={steps.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {steps.map((step) => (
                  <SortableStepItem
                    key={step.id}
                    step={step}
                    isSelected={step.id === selectedStepId}
                    onSelect={() => setSelectedStepId(step.id)}
                    onDelete={() => removeStep(step.id)}
                  />
                ))}
              </div>
            </SortableContext>

            {steps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Keine Schritte vorhanden
              </div>
            )}
          </div>

          {/* Schritt-Editor */}
          {selectedStep && (
            <Card className="border border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Schritt bearbeiten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Titel</Label>
                  <Input
                    value={selectedStep.title}
                    onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })}
                    placeholder="Schritt-Titel"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Beschreibung (optional)</Label>
                  <Input
                    value={selectedStep.description || ""}
                    onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                    placeholder="Beschreibung"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rechte Spalte: Vorschau mit Feldern */}
        <div className="col-span-5 overflow-y-auto space-y-4 border-l border-white/10 pl-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 pb-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Live-Vorschau</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode(previewMode === "quick" ? "expert" : "quick")}
              >
                {previewMode === "quick" ? "Schnell" : "Experten"}
              </Button>
            </div>
          </div>

          {selectedStep ? (
            <StepPreview
              step={selectedStep}
              selectedFieldId={selectedFieldId}
              previewMode={previewMode}
              calculations={calculations}
              priceVariables={priceVariables}
              onFieldClick={(fieldId) => setSelectedFieldId(fieldId)}
              onFieldUpdate={(fieldId, updates) => updateField(selectedStep.id, fieldId, updates)}
              onFieldDelete={(fieldId) => removeField(selectedStep.id, fieldId)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Wählen Sie einen Schritt aus
            </div>
          )}

          {/* Feld-Editor Sidebar */}
          {selectedFieldId && selectedStep && (() => {
            const field = selectedStep.fields.find((f) => f.id === selectedFieldId);
            if (!field) {
              // Feld wurde gelöscht oder existiert nicht mehr
              setSelectedFieldId(null);
              return null;
            }
            return (
              <Card className="border border-purple-500/30 bg-purple-500/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Feld bearbeiten</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelectedFieldId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <FieldEditorInline
                    field={field}
                    calculations={calculations}
                    priceVariables={priceVariables}
                    previewMode={previewMode}
                    onChange={(updates) => updateField(selectedStep.id, selectedFieldId, updates)}
                    onDelete={() => {
                      removeField(selectedStep.id, selectedFieldId);
                      setSelectedFieldId(null);
                    }}
                  />
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {draggedFieldType && (() => {
          const fieldTypeData = FIELD_TYPES.find(ft => ft.type === draggedFieldType);
          if (!fieldTypeData) return null;
          const Icon = fieldTypeData.icon;
          return (
            <div className="p-3 rounded-lg border-2 border-purple-500/70 bg-purple-500/30 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-purple-300" />
                <span className="text-xs font-medium text-white">
                  {fieldTypeData.label}
                </span>
              </div>
            </div>
          );
        })()}
      </DragOverlay>
    </DndContext>
  );
}

// Sortable Step Item
function SortableStepItem({
  step,
  isSelected,
  onSelect,
  onDelete,
}: {
  step: WizardStep;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer group transition-all ${
        isSelected
          ? "border-purple-500/50 bg-purple-500/10"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                #{step.order}
              </span>
              <span className="font-medium text-sm truncate">{step.title}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {step.fields.length} Feld{step.fields.length !== 1 ? "er" : ""}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3 text-red-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step Preview mit Drop-Zone
function StepPreview({
  step,
  selectedFieldId,
  previewMode,
  calculations,
  priceVariables,
  onFieldClick,
  onFieldUpdate,
  onFieldDelete,
}: {
  step: WizardStep;
  selectedFieldId: string | null;
  previewMode: "quick" | "expert";
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  onFieldClick: (fieldId: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<WizardField>) => void;
  onFieldDelete: (fieldId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `step-preview-${step.id}`,
  });

  const visibleFields = step.fields.filter((field) => {
    if (previewMode === "quick") {
      return field.showInQuickMode !== false && field.visibility !== "hidden";
    } else {
      return field.showInExpertMode !== false && field.visibility !== "hidden";
    }
  });

  return (
    <Card
      ref={setNodeRef}
      className={`border-2 border-dashed transition-all ${
        isOver
          ? "border-purple-500/50 bg-purple-500/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{step.title}</CardTitle>
        {step.description && (
          <p className="text-xs text-muted-foreground">{step.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleFields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-white/20 rounded-lg">
            <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Ziehen Sie Felder hierher</p>
          </div>
        ) : (
          <SortableContext
            items={visibleFields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {visibleFields.map((field) => (
                <SortableFieldPreview
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onClick={() => onFieldClick(field.id)}
                  onUpdate={(updates) => onFieldUpdate(field.id, updates)}
                  onDelete={() => onFieldDelete(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}

// Sortable Field Preview
function SortableFieldPreview({
  field,
  isSelected,
  onClick,
  onUpdate,
  onDelete,
}: {
  field: WizardField;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: (updates: Partial<WizardField>) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: field.id,
    disabled: false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border transition-all cursor-pointer group ${
        isSelected
          ? "border-cyan-500/50 bg-cyan-500/10"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      } ${isDragging ? "opacity-30 scale-95" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{field.label}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {field.variableName}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3 text-red-400" />
        </Button>
      </div>
    </div>
  );
}

// Toolbox Field (Draggable)
function ToolboxField({ fieldType }: { fieldType: typeof FIELD_TYPES[0] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `toolbox-${fieldType.type}`,
  });

  const Icon = fieldType.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all group ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-purple-400" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium">{fieldType.label}</div>
          <div className="text-[10px] text-muted-foreground truncate">
            {fieldType.description}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Field Editor
function FieldEditorInline({
  field,
  calculations,
  priceVariables,
  previewMode,
  onChange,
  onDelete,
}: {
  field: WizardField;
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  previewMode: "quick" | "expert";
  onChange: (updates: Partial<WizardField>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Label</Label>
          <Input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Feld-Label"
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Variable</Label>
          <Input
            value={field.variableName}
            onChange={(e) => onChange({ variableName: e.target.value })}
            placeholder="variableName"
            className="h-8 font-mono"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Feld-Typ</Label>
        <select
          value={field.type}
          onChange={(e) => onChange({ type: e.target.value as FieldType })}
          className="flex h-8 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs"
        >
          {FIELD_TYPES.map((type) => (
            <option key={type.type} value={type.type}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end pt-2 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Löschen
        </Button>
      </div>
    </div>
  );
}

