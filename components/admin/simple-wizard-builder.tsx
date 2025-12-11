"use client";

import { useState, useEffect } from "react";
import { 
  DndContext, 
  DragOverlay,
  closestCenter, 
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
  useSortable, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  X,
  Settings,
  Eye,
  ChevronDown,
} from "lucide-react";

interface SimpleWizardBuilderProps {
  initialSteps?: WizardStep[];
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  onChange: (steps: WizardStep[]) => void;
}

// Feld-Typen mit Icons
const FIELD_TYPES: Array<{ 
  type: FieldType; 
  label: string; 
  icon: any;
  color: string;
}> = [
  { type: "text", label: "Text", icon: FormInput, color: "bg-blue-500" },
  { type: "number", label: "Zahl", icon: Hash, color: "bg-green-500" },
  { type: "email", label: "E-Mail", icon: Mail, color: "bg-purple-500" },
  { type: "tel", label: "Telefon", icon: Phone, color: "bg-orange-500" },
  { type: "date", label: "Datum", icon: Calendar, color: "bg-pink-500" },
  { type: "textarea", label: "Mehrzeilig", icon: FileText, color: "bg-indigo-500" },
  { type: "select", label: "Auswahl", icon: List, color: "bg-cyan-500" },
  { type: "radio_group", label: "Radio", icon: Radio, color: "bg-yellow-500" },
  { type: "checkbox_group", label: "Checkboxen", icon: CheckSquare, color: "bg-red-500" },
  { type: "slider", label: "Schieberegler", icon: SlidersHorizontal, color: "bg-teal-500" },
];

export function SimpleWizardBuilder({
  initialSteps = [],
  calculations,
  priceVariables,
  onChange,
}: SimpleWizardBuilderProps) {
  const [steps, setSteps] = useState<WizardStep[]>(
    initialSteps.length > 0 
      ? initialSteps.map((s, idx) => ({ ...s, order: s.order || idx + 1 }))
      : [{
          id: `step_${Date.now()}`,
          title: "Schritt 1",
          order: 1,
          isRequired: true,
          isSkippable: false,
          fields: [],
          calculations: [],
          effects: {},
        }]
  );
  
  const [selectedStepId, setSelectedStepId] = useState<string>(steps[0]?.id || "");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<FieldType | null>(null);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepTitle, setEditingStepTitle] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 8,
        tolerance: 5,
        delay: 0,
      } 
    })
  );

  const selectedStep = steps.find(s => s.id === selectedStepId);

  useEffect(() => {
    onChange(steps);
  }, [steps, onChange]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id.toString();
    if (id.startsWith("toolbox-")) {
      setDraggedType(id.replace("toolbox-", "") as FieldType);
    } else if (id.startsWith("field-")) {
      setDraggedFieldId(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedType(null);
    setDraggedFieldId(null);

    if (!over || !selectedStep) return;

    // Neues Feld aus Toolbox hinzufügen - NUR wenn über form-canvas
    if (active.id.toString().startsWith("toolbox-")) {
      if (over.id === "form-canvas" || over.id.toString().startsWith("field-")) {
        const fieldType = active.id.toString().replace("toolbox-", "") as FieldType;
        addField(fieldType);
      }
      return;
    }

    // Feld innerhalb des Formulars verschieben
    if (active.id.toString().startsWith("field-")) {
      if (over.id === "form-canvas") {
        // Fallback: Wenn über Canvas gedroppt, ans Ende verschieben
        const activeId = active.id.toString();
        const fields = selectedStep.fields;
        const activeIndex = fields.findIndex(f => f.id === activeId);
        if (activeIndex !== -1) {
          const newFields = [...fields];
          const [moved] = newFields.splice(activeIndex, 1);
          newFields.push(moved);
          setSteps(steps.map(step => 
            step.id === selectedStepId 
              ? { ...step, fields: newFields }
              : step
          ));
        }
      } else if (over.id.toString().startsWith("field-")) {
        const activeId = active.id.toString();
        const overId = over.id.toString();
        moveField(activeId, overId);
      }
    }
  };

  const addField = (type: FieldType) => {
    if (!selectedStep) return;

    const newField: WizardField = {
      id: `field_${Date.now()}`,
      type,
      label: `Neues ${FIELD_TYPES.find(ft => ft.type === type)?.label || "Feld"}`,
      variableName: `field_${Date.now()}`,
      visibility: "normal",
      validation: {},
      showInQuickMode: true,
      showInExpertMode: true,
    };

    setSteps(steps.map(step => 
      step.id === selectedStepId 
        ? { ...step, fields: [...step.fields, newField] }
        : step
    ));
    setSelectedFieldId(newField.id);
  };

  const moveField = (activeId: string, overId: string) => {
    if (!selectedStep) return;

    const activeIndex = selectedStep.fields.findIndex(f => f.id === activeId);
    const overIndex = selectedStep.fields.findIndex(f => f.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    const newFields = arrayMove(selectedStep.fields, activeIndex, overIndex);
    setSteps(steps.map(step => 
      step.id === selectedStepId 
        ? { ...step, fields: newFields }
        : step
    ));
  };

  const updateField = (fieldId: string, updates: Partial<WizardField>) => {
    setSteps(steps.map(step => ({
      ...step,
      fields: step.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    })));
  };

  const updateStep = (stepId: string, updates: Partial<WizardStep>) => {
    setSteps(steps.map(step => step.id === stepId ? { ...step, ...updates } : step));
  };

  const startEditingStep = (step: WizardStep) => {
    setEditingStepId(step.id);
    setEditingStepTitle(step.title);
  };

  const saveStepTitle = () => {
    if (editingStepId && editingStepTitle.trim()) {
      updateStep(editingStepId, { title: editingStepTitle.trim() });
    }
    setEditingStepId(null);
    setEditingStepTitle("");
  };

  const deleteField = (fieldId: string) => {
    setSteps(steps.map(step => ({
      ...step,
      fields: step.fields.filter(f => f.id !== fieldId)
    })));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const selectedField = selectedStep?.fields.find(f => f.id === selectedFieldId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[]}
    >
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-250px)]">
        {/* LINKS: Toolbox */}
        <div className="col-span-2 border-r border-white/10 pr-4 overflow-y-auto">
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 pb-4">
            <h3 className="text-sm font-semibold mb-4">Komponenten</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FIELD_TYPES.map((fieldType) => (
              <ToolboxItem key={fieldType.type} fieldType={fieldType} />
            ))}
          </div>
        </div>

        {/* MITTE: Formular Canvas */}
        <div className="col-span-7 flex flex-col overflow-hidden">
          {/* Schritt-Auswahl mit Dropdown */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3 flex-1">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">Schritt:</Label>
              <Select value={selectedStepId} onValueChange={(id) => {
                setSelectedStepId(id);
                setSelectedFieldId(null);
              }}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {steps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingStepId === selectedStepId ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingStepTitle}
                    onChange={(e) => setEditingStepTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveStepTitle();
                      } else if (e.key === "Escape") {
                        setEditingStepId(null);
                        setEditingStepTitle("");
                      }
                    }}
                    className="h-8 w-[200px]"
                    autoFocus
                  />
                  <Button size="sm" onClick={saveStepTitle}>
                    Speichern
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditingStepId(null);
                    setEditingStepTitle("");
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditingStep(selectedStep!)}
                    className="h-8"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    ({steps.length} {steps.length === 1 ? "Schritt" : "Schritte"})
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Vorschau
              </Button>
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Formular-Vorschau</DialogTitle>
                  </DialogHeader>
                  <FormPreview steps={steps} />
                </DialogContent>
              </Dialog>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
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
                  setSteps([...steps, newStep]);
                  setSelectedStepId(newStep.id);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schritt hinzufügen
              </Button>
            </div>
          </div>

          {/* Formular Canvas */}
          {selectedStep && (
            <div className="flex-1 overflow-y-auto">
              <FormCanvas
                step={selectedStep}
                selectedFieldId={selectedFieldId}
                onFieldClick={setSelectedFieldId}
                onFieldDelete={deleteField}
              />
            </div>
          )}
        </div>

        {/* RECHTS: Properties Panel */}
        <div className="col-span-3 border-l border-white/10 pl-4 overflow-y-auto">
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 pb-4">
            <h3 className="text-sm font-semibold mb-4">Eigenschaften</h3>
          </div>

          {selectedField ? (
            <FieldProperties
              field={selectedField}
              calculations={calculations}
              priceVariables={priceVariables}
              onChange={(updates) => updateField(selectedField.id, updates)}
              onDelete={() => deleteField(selectedField.id)}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Wählen Sie ein Feld aus, um die Eigenschaften zu bearbeiten
            </div>
          )}
        </div>
      </div>

      {/* Drag Overlay - direkt am Cursor */}
      <DragOverlay 
        dropAnimation={null}
        className="pointer-events-none z-50"
        style={{ 
          cursor: 'grabbing',
        }}
      >
        {draggedType && (() => {
          const fieldType = FIELD_TYPES.find(ft => ft.type === draggedType);
          if (!fieldType) return null;
          const Icon = fieldType.icon;
          return (
            <div 
              className={`${fieldType.color} p-3 rounded-lg shadow-2xl border-2 border-white/20 pointer-events-none rotate-3`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white">{fieldType.label}</span>
              </div>
            </div>
          );
        })()}
        {draggedFieldId && (() => {
          const field = selectedStep?.fields.find(f => f.id === draggedFieldId);
          if (!field) return null;
          const fieldType = FIELD_TYPES.find(ft => ft.type === field.type);
          const Icon = fieldType?.icon || FormInput;
          return (
            <div className="p-4 rounded-lg border-2 border-cyan-500 bg-cyan-500/20 shadow-2xl pointer-events-none rotate-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-cyan-300" />
                <span className="text-sm font-medium">{field.label}</span>
              </div>
            </div>
          );
        })()}
      </DragOverlay>
    </DndContext>
  );
}

// Toolbox Item (Draggable)
function ToolboxItem({ fieldType }: { fieldType: typeof FIELD_TYPES[0] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `toolbox-${fieldType.type}`,
  });

  const Icon = fieldType.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all text-center ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <div className={`${fieldType.color} p-2 rounded-lg mb-2 inline-flex`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-xs font-medium">{fieldType.label}</div>
    </div>
  );
}

// Form Canvas (Drop Zone)
function FormCanvas({
  step,
  selectedFieldId,
  onFieldClick,
  onFieldDelete,
}: {
  step: WizardStep;
  selectedFieldId: string | null;
  onFieldClick: (id: string) => void;
  onFieldDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "form-canvas",
  });

  return (
    <Card
      ref={setNodeRef}
      className={`min-h-[400px] transition-all ${
        isOver ? "border-purple-500/50 bg-purple-500/10" : "border-white/10"
      }`}
    >
      <CardHeader>
        <CardTitle className="text-lg">{step.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {step.fields.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-white/20 rounded-lg">
            <p className="mb-2">Ziehen Sie Felder hierher</p>
            <p className="text-xs">oder klicken Sie auf ein Element in der Toolbox</p>
          </div>
        ) : (
          <SortableContext
            items={step.fields.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {step.fields.map((field) => (
              <FormFieldItem
                key={field.id}
                field={field}
                isSelected={field.id === selectedFieldId}
                onClick={() => onFieldClick(field.id)}
                onDelete={() => onFieldDelete(field.id)}
              />
            ))}
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}

// Form Field Item (Sortable)
function FormFieldItem({
  field,
  isSelected,
  onClick,
  onDelete,
}: {
  field: WizardField;
  isSelected: boolean;
  onClick: () => void;
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
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldType = FIELD_TYPES.find(ft => ft.type === field.type);
  const Icon = fieldType?.icon || FormInput;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer group ${
        isSelected
          ? "border-cyan-500 bg-cyan-500/10"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Label className="font-medium">{field.label}</Label>
            {field.validation.required && (
              <span className="text-xs text-red-400">*</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {field.variableName}
          </div>
          {/* Feld-Vorschau */}
          <div className="mt-3">
            <FieldPreview field={field} />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    </div>
  );
}

// Field Preview
function FieldPreview({ field }: { field: WizardField }) {
  switch (field.type) {
    case "text":
    case "email":
    case "tel":
      return (
        <Input
          placeholder={field.placeholder || field.label}
          disabled
          className="bg-white/5"
        />
      );
    case "number":
      return (
        <Input
          type="number"
          placeholder={field.placeholder || field.label}
          disabled
          className="bg-white/5"
        />
      );
    case "textarea":
      return (
        <textarea
          placeholder={field.placeholder || field.label}
          disabled
          className="w-full min-h-[80px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
      );
    case "select":
      return (
        <select
          disabled
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        >
          <option>{field.placeholder || "Auswahl..."}</option>
        </select>
      );
    case "slider":
      return (
        <div className="space-y-2">
          <input
            type="range"
            disabled
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            {field.validation.min || 0} - {field.validation.max || 100}
          </div>
        </div>
      );
    default:
      return (
        <div className="text-xs text-muted-foreground">
          {field.type} Feld
        </div>
      );
  }
}

// Field Properties Panel
function FieldProperties({
  field,
  calculations,
  priceVariables,
  onChange,
  onDelete,
}: {
  field: WizardField;
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  onChange: (updates: Partial<WizardField>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Grunddaten */}
      <Card className="border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Grunddaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Label</Label>
            <Input
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="Feld-Label"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Variable-Name</Label>
            <Input
              value={field.variableName}
              onChange={(e) => onChange({ variableName: e.target.value })}
              placeholder="variableName"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Feld-Typ</Label>
            <select
              value={field.type}
              onChange={(e) => onChange({ type: e.target.value as FieldType })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Placeholder</Label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              placeholder="Placeholder-Text"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validierung */}
      <Card className="border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Validierung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.validation.required || false}
              onChange={(e) => onChange({
                validation: { ...field.validation, required: e.target.checked }
              })}
              className="rounded border-white/20"
            />
            <span className="text-sm">Pflichtfeld</span>
          </label>
          {field.type === "number" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Minimum</Label>
                  <Input
                    type="number"
                    value={field.validation.min || ""}
                    onChange={(e) => onChange({
                      validation: {
                        ...field.validation,
                        min: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Maximum</Label>
                  <Input
                    type="number"
                    value={field.validation.max || ""}
                    onChange={(e) => onChange({
                      validation: {
                        ...field.validation,
                        max: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Löschen */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="w-full"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Feld löschen
      </Button>
    </div>
  );
}

// Form Preview Component
function FormPreview({ steps }: { steps: WizardStep[] }) {
  return (
    <div className="space-y-6 py-4">
      {steps.map((step, stepIndex) => (
        <Card key={step.id} className="border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">
              Schritt {stepIndex + 1}: {step.title}
            </CardTitle>
            {step.description && (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {step.fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Keine Felder in diesem Schritt
              </div>
            ) : (
              step.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label}
                    {field.validation.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </Label>
                  <FieldPreview field={field} />
                  {field.helpText && (
                    <p className="text-xs text-muted-foreground">{field.helpText}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

