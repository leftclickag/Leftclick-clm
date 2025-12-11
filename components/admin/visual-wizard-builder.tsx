"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WizardStep, WizardField } from "@/types/wizard-builder";
import { StepEditor } from "./step-editor";
import { LiveCalculationPreview } from "./live-calculation-preview";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

interface VisualWizardBuilderProps {
  initialSteps?: WizardStep[];
  calculations: Array<{ id: string; formula: string; label?: string }>;
  priceVariables: Array<{ variableName: string; value: number }>;
  onChange: (steps: WizardStep[]) => void;
}

export function VisualWizardBuilder({
  initialSteps = [],
  calculations,
  priceVariables,
  onChange,
}: VisualWizardBuilderProps) {
  const [steps, setSteps] = useState<WizardStep[]>(
    initialSteps.map((s, idx) => ({
      ...s,
      order: s.order || idx + 1,
    }))
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    steps[0]?.id || null
  );
  const [previewMode, setPreviewMode] = useState<"quick" | "expert">("quick");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedStep = steps.find((s) => s.id === selectedStepId);

  // Update parent when steps change
  useEffect(() => {
    onChange(steps);
  }, [steps]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
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
    setStepToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmRemoveStep = () => {
    if (stepToDelete) {
      const filtered = steps.filter((s) => s.id !== stepToDelete);
      const updated = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
      setSteps(updated);
      if (selectedStepId === stepToDelete) {
        setSelectedStepId(updated[0]?.id || null);
      }
      setStepToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const updateStep = (id: string, updates: Partial<WizardStep>) => {
    setSteps((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[800px]">
      {/* Left: Schritt-Liste */}
      <div className="col-span-3 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 pb-2">
          <h3 className="text-sm font-semibold">Schritte</h3>
          <Button onClick={addStep} size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
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
        </DndContext>

        {steps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Keine Schritte vorhanden
          </div>
        )}
      </div>

      {/* Middle: Schritt-Editor */}
      <div className="col-span-5 overflow-y-auto">
        {selectedStep ? (
          <StepEditor
            step={selectedStep}
            calculations={calculations}
            priceVariables={priceVariables}
            previewMode={previewMode}
            onChange={(updates) => updateStep(selectedStep.id, updates)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Wählen Sie einen Schritt aus
          </div>
        )}
      </div>

      {/* Right: Live-Preview */}
      <div className="col-span-4 overflow-y-auto">
        <LiveCalculationPreview
          steps={steps}
          selectedStepId={selectedStepId}
          calculations={calculations}
          priceVariables={priceVariables}
          previewMode={previewMode}
          onModeChange={setPreviewMode}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Schritt löschen"
        description="Möchten Sie diesen Schritt wirklich löschen? Alle Felder und Konfigurationen gehen verloren."
        type="delete"
        confirmText="Löschen"
        cancelText="Abbrechen"
        onConfirm={confirmRemoveStep}
      />
    </div>
  );
}

// Sortable Step Item Component
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
              {step.isRequired && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                  Pflicht
                </span>
              )}
              {step.isSkippable && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                  Überspringbar
                </span>
              )}
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

