"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tracker } from "@/lib/tracking/tracker";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { LeadMagnet } from "@/types/lead-magnet";
import type { FlowStep } from "@/types/lead-magnet";
import type { CalculatorConfig } from "@/types/lead-magnet";
import { CalculationEngine } from "@/lib/calculator/calculation-engine";
import { allPriceTables } from "@/lib/calculator/price-tables";

interface CalculatorWidgetProps {
  leadMagnet: LeadMagnet;
}

export function CalculatorWidget({ leadMagnet }: CalculatorWidgetProps) {
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [completed, setCompleted] = useState(false);
  const [calculationEngine, setCalculationEngine] =
    useState<CalculationEngine | null>(null);

  // Initialisiere Berechnungs-Engine
  useEffect(() => {
    const config = (leadMagnet.config as CalculatorConfig) || {};
    const engine = new CalculationEngine({
      ...config,
      priceTables: allPriceTables,
    });
    setCalculationEngine(engine);
  }, [leadMagnet.config]);

  useEffect(() => {
    async function loadSteps() {
      const supabase = createClient();
      const { data } = await supabase
        .from("flow_steps")
        .select("*")
        .eq("lead_magnet_id", leadMagnet.id)
        .order("step_number", { ascending: true });

      if (data) {
        setSteps(data);
        await tracker.trackEvent("start", leadMagnet.id);
      }
    }
    loadSteps();
  }, [leadMagnet.id]);

  // Aktualisiere Engine-Kontext wenn FormData sich ändert
  useEffect(() => {
    if (calculationEngine) {
      // Setze FormData-Variablen
      calculationEngine.setVariables(formData);
      
      // Lade Preise aus Preistabellen basierend auf Auswahlen
      const updatedData = { ...formData };
      
      // Teams Telephony: Setze Preise basierend auf Lösungstyp
      if (formData.solution_type && formData.users) {
        const users = Number(formData.users) || 0;
        switch (formData.solution_type) {
          case "domestic":
            updatedData.phoneSystemPrice = calculationEngine.getPrice("phone_system_license", "unitPrice");
            updatedData.callingPlanPrice = calculationEngine.getPrice("calling_plan_domestic", "unitPrice");
            updatedData.directRoutingSbcCost = 0;
            break;
          case "international":
            updatedData.phoneSystemPrice = calculationEngine.getPrice("phone_system_license", "unitPrice");
            updatedData.callingPlanPrice = calculationEngine.getPrice("calling_plan_international", "unitPrice");
            updatedData.directRoutingSbcCost = 0;
            break;
          case "direct_routing":
            updatedData.phoneSystemPrice = calculationEngine.getPrice("phone_system_license", "unitPrice");
            updatedData.callingPlanPrice = 0;
            updatedData.directRoutingSbcCost = calculationEngine.getPrice("direct_routing_sbc", users);
            break;
          case "operator_connect":
            updatedData.phoneSystemPrice = calculationEngine.getPrice("phone_system_license", "unitPrice");
            updatedData.callingPlanPrice = calculationEngine.getPrice("operator_connect", "unitPrice");
            updatedData.directRoutingSbcCost = 0;
            break;
        }
      }
      
      // M365 Lizenz: Setze Lizenzpreis
      if (formData.license_type) {
        const licenseMap: Record<string, string> = {
          "business_basic": "m365_business_basic",
          "business_standard": "m365_business_standard",
          "business_premium": "m365_business_premium",
          "e3": "m365_e3",
          "e5": "m365_e5",
        };
        const tableId = licenseMap[formData.license_type];
        if (tableId) {
          updatedData.licensePrice = calculationEngine.getPrice(tableId, "price");
        }
        
        // Volumenrabatt
        if (formData.users) {
          const users = Number(formData.users) || 0;
          updatedData.volumeDiscountRate = calculationEngine.getPrice("volume_discount", users);
        }
      }
      
      // IT-Outsourcing: Setze Support-Tier Preis
      if (formData.support_tier) {
        const tierMap: Record<string, string> = {
          "tier1": "support_tier1",
          "tier2": "support_tier2",
          "tier3": "support_tier3",
        };
        const tableId = tierMap[formData.support_tier];
        if (tableId) {
          updatedData.support_tier_price = calculationEngine.getPrice(tableId, "unitPrice");
        }
      }
      
      // Cloud Migration: Setze Cloud-VM Kosten
      if (formData.cloud_provider && formData.server_size && formData.servers) {
        const providerMap: Record<string, string> = {
          "azure": "azure_vm_cost",
          "aws": "aws_ec2_cost",
          "google": "azure_vm_cost", // Fallback
        };
        const tableId = providerMap[formData.cloud_provider];
        if (tableId) {
          const servers = Number(formData.servers) || 0;
          const baseCost = calculationEngine.getPrice(tableId, servers);
          const serverSize = Number(formData.server_size) || 1;
          updatedData.cloud_vm_cost = baseCost * serverSize;
        }
        
        // Migrationskosten
        if (formData.migration_service) {
          const migrationMap: Record<string, number> = {
            "self": 0,
            "basic": 300,
            "full": 500,
          };
          const servers = Number(formData.servers) || 0;
          updatedData.migration_service_cost = (migrationMap[formData.migration_service] || 0) * servers;
        }
      }
      
      // Security Audit: Setze Audit-Kosten
      if (formData.audit_type && formData.users) {
        const auditMap: Record<string, { base: number; perUser: number }> = {
          "basic": { base: 5000, perUser: 10 },
          "standard": { base: 10000, perUser: 20 },
          "premium": { base: 20000, perUser: 30 },
        };
        const audit = auditMap[formData.audit_type];
        if (audit) {
          updatedData.base_audit_cost = audit.base;
          updatedData.per_user_cost = audit.perUser;
        }
      }
      
      // Summiere Multi-Select Werte
      // Für telephony_requirements, additional_features, services, etc.
      if (Array.isArray(formData.telephony_requirements)) {
        const step = steps.find(s => s.config?.id === "telephony_requirements");
        if (step) {
          const options = step.config.options || [];
          updatedData.telephony_requirements_sum = formData.telephony_requirements.reduce((sum: number, id: string) => {
            const option = options.find((o: any) => o.id === id);
            return sum + (option?.value || 0);
          }, 0);
        }
      }
      
      if (Array.isArray(formData.additional_features)) {
        const step = steps.find(s => s.config?.id === "additional_features");
        if (step) {
          const options = step.config.options || [];
          updatedData.additional_features_sum = formData.additional_features.reduce((sum: number, id: string) => {
            const option = options.find((o: any) => o.id === id);
            return sum + (option?.value || 0);
          }, 0);
        }
      }
      
      if (Array.isArray(formData.services)) {
        const step = steps.find(s => s.config?.id === "services");
        if (step) {
          const options = step.config.options || [];
          updatedData.services_sum = formData.services.reduce((sum: number, id: string) => {
            const option = options.find((o: any) => o.id === id);
            return sum + (option?.value || 0);
          }, 0);
        }
      }
      
      calculationEngine.setVariables(updatedData);
    }
  }, [formData, calculationEngine, steps]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      await tracker.trackEvent("step_complete", leadMagnet.id, {
        step_id: steps[currentStep].id,
      });
      setCurrentStep(currentStep + 1);
    } else {
      await handleCalculate();
    }
  };

  const handleCalculate = async () => {
    if (!calculationEngine) {
      console.error("Berechnungs-Engine nicht initialisiert");
      return;
    }

    try {
      // Stelle sicher, dass alle Variablen gesetzt sind
      // (Der useEffect sollte das bereits tun, aber wir aktualisieren hier nochmal)
      calculationEngine.setVariables(formData);
      
      // Lade Preise und setze sie erneut (wie im useEffect)
      const updatedData = { ...formData };
      
      // Teams Telephony: Setze Preise basierend auf Lösungstyp
      if (formData.solution_type && formData.users) {
        const users = Number(formData.users) || 0;
        switch (formData.solution_type) {
          case "domestic":
            updatedData.phoneSystemPrice = calculationEngine.getPrice("phone_system_license", "unitPrice");
            updatedData.callingPlanPrice = calculationEngine.getPrice("calling_plan_domestic", "unitPrice");
            updatedData.directRoutingSbcCost = 0;
            break;
          case "international":
            updatedData.phoneSystemPrice = calculationEngine.getPrice("phone_system_license", "unitPrice");
            updatedData.callingPlanPrice = calculationEngine.getPrice("calling_plan_international", "unitPrice");
            updatedData.directRoutingSbcCost = 0;
            break;
          case "direct_routing":
            updatedData.phoneSystemPrice = calculationEngine.getPrice("phone_system_license", "unitPrice");
            updatedData.callingPlanPrice = 0;
            updatedData.directRoutingSbcCost = calculationEngine.getPrice("direct_routing_sbc", users);
            break;
          case "operator_connect":
            updatedData.phoneSystemPrice = calculationEngine.getPrice("phone_system_license", "unitPrice");
            updatedData.callingPlanPrice = calculationEngine.getPrice("operator_connect", "unitPrice");
            updatedData.directRoutingSbcCost = 0;
            break;
        }
      }
      
      // Setze alle aktualisierten Daten
      calculationEngine.setVariables(updatedData);
      
      // Debug: Zeige Kontext
      console.log("Berechnungs-Kontext:", calculationEngine.getContext());
      
      // Führe alle Berechnungen durch
      const outputs = calculationEngine.getOutputs();
      
      console.log("Berechnungs-Ergebnisse:", outputs);
      
      setResults(outputs);
      setCompleted(true);

      await tracker.trackEvent("conversion", leadMagnet.id, {
        results: outputs,
        formData,
      });

      await tracker.updateSubmissionStatus("completed", {
        results: outputs,
        formData,
      });
    } catch (error) {
      console.error("Berechnungsfehler:", error);
      console.error("FormData:", formData);
      console.error("Engine Context:", calculationEngine?.getContext());
      alert("Fehler bei der Berechnung. Bitte überprüfen Sie Ihre Eingaben. Details in der Konsole.");
    }
  };

  const renderStepContent = (step: FlowStep) => {
    const componentType = step.component_type;
    const config = step.config || {};

    switch (componentType) {
      case "form":
        const fields = config.fields || [];
        return (
          <div className="space-y-4">
            {fields.map((field: any) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </Label>
                {field.type === "select" ? (
                  <Select
                    value={formData[field.id] || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.id]: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || "Auswählen"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.id}
                    type={field.type || "text"}
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.id]:
                          field.type === "number"
                            ? parseFloat(e.target.value) || 0
                            : e.target.value,
                      }))
                    }
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                )}
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case "slider":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{config.label || "Wert"}</Label>
              <Slider
                value={[formData[config.id] || config.min || 0]}
                min={config.min || 0}
                max={config.max || 100}
                step={config.step || 1}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    [config.id]: value[0],
                  }))
                }
              />
              <div className="text-center text-sm text-muted-foreground">
                {formData[config.id] || config.min || 0} {config.unit || ""}
              </div>
            </div>
            {config.description && (
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            )}
          </div>
        );

      case "multi_select":
        const options = config.options || [];
        return (
          <div className="space-y-2">
            {options.map((option: any) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => {
                  const current = formData[config.id] || [];
                  const newValue = current.includes(option.id)
                    ? current.filter((id: string) => id !== option.id)
                    : [...current, option.id];
                  setFormData((prev) => ({
                    ...prev,
                    [config.id]: newValue,
                  }));
                }}
              >
                <input
                  type="checkbox"
                  checked={(formData[config.id] || []).includes(option.id)}
                  onChange={() => {}}
                  className="h-5 w-5"
                />
                <label className="flex-1 cursor-pointer">
                  {option.label}
                  {option.description && (
                    <span className="block text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        );

      case "radio_group":
        const radioOptions = config.options || [];
        return (
          <div className="space-y-2">
            {radioOptions.map((option: any) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    [config.id]: option.id,
                  }))
                }
              >
                <input
                  type="radio"
                  name={config.id}
                  checked={formData[config.id] === option.id}
                  onChange={() => {}}
                  className="h-5 w-5"
                />
                <label className="flex-1 cursor-pointer">
                  {option.label}
                  {option.description && (
                    <span className="block text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Unbekannter Komponenten-Typ: {componentType}</div>;
    }
  };

  if (completed && results) {
    const config = (leadMagnet.config as CalculatorConfig) || {};
    const outputs = config.outputs || [];

    return (
      <div className="container mx-auto max-w-2xl p-6">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ihr Ergebnis</CardTitle>
            <CardDescription>
              Basierend auf Ihren Angaben haben wir folgende Berechnung
              durchgeführt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {outputs.length > 0 ? (
              <div className="space-y-4">
                {outputs.map((output: any) => {
                  const result = results[output.id];
                  if (!result) return null;

                  return (
                    <div
                      key={output.id}
                      className="p-4 border rounded-lg bg-muted/50"
                    >
                      <h3 className="font-semibold mb-2">{result.label}</h3>
                      <div className="text-3xl font-bold text-primary">
                        {result.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-5xl font-bold mb-2 text-primary">
                  {Object.values(results)[0]?.value || "N/A"}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-center">
                Möchten Sie mehr erfahren? Kontaktieren Sie uns für eine
                individuelle Beratung.
              </p>
            </div>
            <Button className="w-full" size="lg">
              Jetzt Kontakt aufnehmen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (steps.length === 0) {
    return <div>Lädt...</div>;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{step.title}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} / {steps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            {step.description && (
              <CardDescription>{step.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {renderStepContent(step)}
            <div className="flex space-x-2 pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Zurück
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1" size="lg">
                {currentStep < steps.length - 1 ? "Weiter" : "Berechnen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
