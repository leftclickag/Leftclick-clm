export interface LeadMagnet {
  id: string;
  tenant_id: string;
  type: "ebook" | "checklist" | "quiz" | "calculator";
  title: string;
  description?: string;
  slug: string;
  active: boolean;
  config: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FlowStep {
  id: string;
  lead_magnet_id: string;
  step_number: number;
  title: string;
  description?: string;
  component_type: string;
  config: Record<string, any>;
  conditions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Erweiterte Kalkulator-Konfiguration
export interface Variable {
  id: string;
  name: string;
  type: "number" | "string" | "boolean" | "array";
  defaultValue?: any;
  description?: string;
}

export interface PriceTable {
  id: string;
  name: string;
  type: "flat" | "tiered" | "per_unit";
  data: Record<string, any>;
}

export interface Calculation {
  id: string;
  formula: string;
  dependsOn: string[];
  description?: string;
}

export interface Condition {
  id: string;
  if: string; // Bedingung als Formel
  then: string; // Aktion/Formel
  else?: string; // Alternative Aktion
}

export interface OutputConfig {
  id: string;
  label: string;
  formula: string;
  format?: "currency" | "number" | "percentage" | "text";
  unit?: string;
}

export interface CalculatorConfig {
  variables?: Variable[];
  priceTables?: PriceTable[];
  calculations?: Calculation[];
  conditions?: Condition[];
  outputs?: OutputConfig[];
}

