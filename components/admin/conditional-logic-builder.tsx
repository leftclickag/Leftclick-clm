"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowRight, GitBranch, Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FlowStep {
  id: string;
  step_number: number;
  title: string;
  component_type: string;
  config: Record<string, any>;
}

interface FlowCondition {
  id: string;
  flow_step_id: string;
  condition_type: "show_if" | "skip_if" | "branch_to";
  source_field: string;
  operator: string;
  target_value: any;
  target_step_id?: string;
  priority: number;
}

interface ConditionalLogicBuilderProps {
  steps: FlowStep[];
  conditions: FlowCondition[];
  availableFields: Array<{ id: string; label: string; type: string }>;
  onConditionsChange: (conditions: FlowCondition[]) => void;
}

const OPERATORS = [
  { value: "equals", label: "ist gleich" },
  { value: "not_equals", label: "ist nicht gleich" },
  { value: "contains", label: "enthält" },
  { value: "gt", label: "größer als" },
  { value: "lt", label: "kleiner als" },
  { value: "gte", label: "größer oder gleich" },
  { value: "lte", label: "kleiner oder gleich" },
  { value: "is_empty", label: "ist leer" },
  { value: "is_not_empty", label: "ist nicht leer" },
  { value: "in_array", label: "ist einer von" },
];

const CONDITION_TYPES = [
  { value: "show_if", label: "Zeigen wenn", icon: Eye, color: "bg-green-500" },
  { value: "skip_if", label: "Überspringen wenn", icon: EyeOff, color: "bg-orange-500" },
  { value: "branch_to", label: "Weiterleiten zu", icon: GitBranch, color: "bg-purple-500" },
];

export function ConditionalLogicBuilder({
  steps,
  conditions,
  availableFields,
  onConditionsChange,
}: ConditionalLogicBuilderProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const addCondition = (stepId: string) => {
    const newCondition: FlowCondition = {
      id: `temp_${Date.now()}`,
      flow_step_id: stepId,
      condition_type: "show_if",
      source_field: availableFields[0]?.id || "",
      operator: "equals",
      target_value: "",
      priority: conditions.filter((c) => c.flow_step_id === stepId).length,
    };
    onConditionsChange([...conditions, newCondition]);
  };

  const updateCondition = (conditionId: string, updates: Partial<FlowCondition>) => {
    onConditionsChange(
      conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c
      )
    );
  };

  const removeCondition = (conditionId: string) => {
    onConditionsChange(conditions.filter((c) => c.id !== conditionId));
  };

  const getStepConditions = (stepId: string) =>
    conditions.filter((c) => c.flow_step_id === stepId);

  return (
    <div className="space-y-6">
      {/* Visual Flow Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Flow Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {steps.map((step, index) => {
              const stepConditions = getStepConditions(step.id);
              const hasConditions = stepConditions.length > 0;

              return (
                <div key={step.id} className="flex items-center gap-2">
                  {/* Step Node */}
                  <button
                    onClick={() =>
                      setSelectedStep(selectedStep === step.id ? null : step.id)
                    }
                    className={`relative flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedStep === step.id
                        ? "border-indigo-500 bg-indigo-50"
                        : hasConditions
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                      {step.step_number}
                    </span>
                    <p className="font-medium text-gray-900 text-sm">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.component_type}</p>
                    {hasConditions && (
                      <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
                        {stepConditions.length}
                      </span>
                    )}
                  </button>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Condition Editor for Selected Step */}
      {selectedStep && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Bedingungen für Schritt{" "}
                {steps.find((s) => s.id === selectedStep)?.step_number}:{" "}
                {steps.find((s) => s.id === selectedStep)?.title}
              </span>
              <Button
                size="sm"
                onClick={() => addCondition(selectedStep)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Bedingung hinzufügen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getStepConditions(selectedStep).length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Keine Bedingungen konfiguriert. Dieser Schritt wird immer
                angezeigt.
              </p>
            ) : (
              getStepConditions(selectedStep).map((condition, index) => (
                <ConditionRow
                  key={condition.id}
                  condition={condition}
                  index={index}
                  steps={steps}
                  availableFields={availableFields}
                  onUpdate={(updates) => updateCondition(condition.id, updates)}
                  onRemove={() => removeCondition(condition.id)}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* All Conditions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Bedingungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {steps.map((step) => {
              const stepConditions = getStepConditions(step.id);
              if (stepConditions.length === 0) return null;

              return (
                <div
                  key={step.id}
                  className="border rounded-lg p-3 bg-gray-50"
                >
                  <p className="font-medium text-sm text-gray-700 mb-2">
                    Schritt {step.step_number}: {step.title}
                  </p>
                  <ul className="space-y-1">
                    {stepConditions.map((condition) => {
                      const condType = CONDITION_TYPES.find(
                        (t) => t.value === condition.condition_type
                      );
                      const op = OPERATORS.find(
                        (o) => o.value === condition.operator
                      );
                      const field = availableFields.find(
                        (f) => f.id === condition.source_field
                      );

                      return (
                        <li
                          key={condition.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className={`${condType?.color} text-white px-2 py-0.5 rounded text-xs font-medium`}
                          >
                            {condType?.label}
                          </span>
                          <span className="text-gray-600">
                            {field?.label || condition.source_field}{" "}
                            <span className="font-medium">{op?.label}</span>{" "}
                            &quot;{String(condition.target_value)}&quot;
                            {condition.condition_type === "branch_to" &&
                              condition.target_step_id && (
                                <>
                                  {" → Schritt "}
                                  {
                                    steps.find(
                                      (s) => s.id === condition.target_step_id
                                    )?.step_number
                                  }
                                </>
                              )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            {conditions.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Noch keine Bedingungen konfiguriert. Klicke auf einen Schritt um
                Bedingungen hinzuzufügen.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual Condition Row Component
interface ConditionRowProps {
  condition: FlowCondition;
  index: number;
  steps: FlowStep[];
  availableFields: Array<{ id: string; label: string; type: string }>;
  onUpdate: (updates: Partial<FlowCondition>) => void;
  onRemove: () => void;
}

function ConditionRow({
  condition,
  index,
  steps,
  availableFields,
  onUpdate,
  onRemove,
}: ConditionRowProps) {
  const condType = CONDITION_TYPES.find((t) => t.value === condition.condition_type);
  const Icon = condType?.icon || Eye;
  const needsValue = !["is_empty", "is_not_empty"].includes(condition.operator);

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`${condType?.color} p-1.5 rounded-lg`}
          >
            <Icon className="h-4 w-4 text-white" />
          </span>
          <span className="font-medium text-gray-900">
            Bedingung {index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Condition Type */}
        <div>
          <Label className="text-xs">Aktion</Label>
          <Select
            value={condition.condition_type}
            onValueChange={(v) =>
              onUpdate({ condition_type: v as FlowCondition["condition_type"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Field */}
        <div>
          <Label className="text-xs">Wenn Feld</Label>
          <Select
            value={condition.source_field}
            onValueChange={(v) => onUpdate({ source_field: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Feld auswählen" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operator */}
        <div>
          <Label className="text-xs">Operator</Label>
          <Select
            value={condition.operator}
            onValueChange={(v) => onUpdate({ operator: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Value */}
        {needsValue && (
          <div>
            <Label className="text-xs">Wert</Label>
            <Input
              value={String(condition.target_value || "")}
              onChange={(e) => onUpdate({ target_value: e.target.value })}
              placeholder="Wert eingeben"
            />
          </div>
        )}
      </div>

      {/* Branch target step */}
      {condition.condition_type === "branch_to" && (
        <div className="mt-3">
          <Label className="text-xs">Weiterleiten zu Schritt</Label>
          <Select
            value={condition.target_step_id || ""}
            onValueChange={(v) => onUpdate({ target_step_id: v })}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Ziel-Schritt auswählen" />
            </SelectTrigger>
            <SelectContent>
              {steps.map((step) => (
                <SelectItem key={step.id} value={step.id}>
                  Schritt {step.step_number}: {step.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

