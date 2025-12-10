"use client";

import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Plus, Trash2, FormInput, CheckSquare, List, SlidersHorizontal, Trophy } from "lucide-react";

interface FlowStep {
  id: string;
  step_number: number;
  title: string;
  description?: string;
  component_type: string;
  config: Record<string, any>;
}

interface LeadMagnetBuilderProps {
  initialSteps?: FlowStep[];
  onSave: (steps: FlowStep[]) => void;
}

export function LeadMagnetBuilder({ initialSteps = [], onSave }: LeadMagnetBuilderProps) {
  const [steps, setSteps] = useState<FlowStep[]>(initialSteps);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          step_number: index + 1,
        }));
      });
    }
  };

  const addStep = () => {
    const newStep: FlowStep = {
      id: `step-${Date.now()}`,
      step_number: steps.length + 1,
      title: `Schritt ${steps.length + 1}`,
      component_type: "form",
      config: {},
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps((items) => {
      const filtered = items.filter((item) => item.id !== id);
      return filtered.map((item, index) => ({
        ...item,
        step_number: index + 1,
      }));
    });
  };

  const updateStep = (id: string, updates: Partial<FlowStep>) => {
    setSteps((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Wizard-Schritte</h3>
          <p className="text-sm text-muted-foreground">Drag & Drop zum Sortieren</p>
        </div>
        <Button onClick={addStep} size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Schritt hinzufügen
        </Button>
      </div>

      {steps.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-dashed border-white/20 bg-white/5">
          <div className="p-4 rounded-full bg-white/10 inline-block mb-4">
            <FormInput className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Noch keine Schritte hinzugefügt</p>
          <Button onClick={addStep} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Ersten Schritt erstellen
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <SortableStep
                key={step.id}
                step={step}
                index={index}
                onUpdate={(updates) => updateStep(step.id, updates)}
                onRemove={() => removeStep(step.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {steps.length > 0 && (
        <Button onClick={() => onSave(steps)} className="w-full" variant="default">
          Schritte speichern
        </Button>
      )}
    </div>
  );
}

const componentTypes = [
  { value: "form", label: "Formular", icon: FormInput },
  { value: "checkbox_group", label: "Checkbox-Gruppe", icon: CheckSquare },
  { value: "multi_select", label: "Multi-Select", icon: List },
  { value: "slider", label: "Schieberegler", icon: SlidersHorizontal },
  { value: "result", label: "Ergebnis", icon: Trophy },
];

function SortableStep({
  step,
  index,
  onUpdate,
  onRemove,
}: {
  step: FlowStep;
  index: number;
  onUpdate: (updates: Partial<FlowStep>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const selectedType = componentTypes.find(t => t.value === step.component_type);

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`relative group transition-all duration-200 ${
        isDragging ? "opacity-50 scale-[1.02] shadow-xl shadow-purple-500/10" : ""
      }`}
    >
      {/* Step number indicator */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-xs font-bold">
        {step.step_number}
      </div>

      {/* Drag handle */}
      <div 
        className="absolute left-3 top-5 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors" 
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <CardHeader className="pl-12 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {selectedType && <selectedType.icon className="h-4 w-4 text-purple-400" />}
            <span>Schritt {step.step_number}</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pl-12">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Titel</Label>
            <Input
              value={step.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Schritt-Titel"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Komponenten-Typ</Label>
            <select
              className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 hover:border-white/20"
              value={step.component_type}
              onChange={(e) => onUpdate({ component_type: e.target.value })}
            >
              {componentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Beschreibung (optional)</Label>
          <Input
            value={step.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Hilfetext für diesen Schritt"
          />
        </div>
      </CardContent>
    </Card>
  );
}
