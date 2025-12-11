// Preis- und Variablen-Manager
export interface PriceVariable {
  id: string;
  name: string;           // "Phone System Lizenz"
  variableName: string;   // "phoneSystemPrice"
  value: number;          // 8.00
  unit: string;           // "EUR/User/Monat"
  category: string;       // "Lizenzen"
  description?: string;
  usedIn: string[];       // IDs der Berechnungen die diese Variable nutzen
}

// Feld-Validierung
export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

// Feld-Typen
export type FieldType = 
  | "text" 
  | "number" 
  | "email" 
  | "tel" 
  | "select" 
  | "multi_select" 
  | "radio_group" 
  | "checkbox_group" 
  | "slider" 
  | "textarea" 
  | "date";

// Wizard-Feld
export interface WizardField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  variableName: string; // Für Berechnungen
  visibility: "normal" | "optional" | "advanced" | "hidden";
  validation: FieldValidation;
  options?: Array<{ value: string; label: string }>; // Für Select/Radio
  defaultValue?: any;
  helpText?: string;
  showInQuickMode?: boolean; // Im Schnell-Modus anzeigen?
  showInExpertMode?: boolean; // Im Experten-Modus anzeigen?
  resultType?: "total" | "chart_pie" | "chart_bar" | "table" | "summary"; // Für Ergebnis-Felder
}

// Schritt-Effekte
export interface StepEffects {
  entryAnimation?: "slide" | "fade" | "scale" | "none";
  exitAnimation?: "slide" | "fade" | "scale" | "none";
  celebration?: boolean; // Konfetti bei Abschluss
  progressCelebration?: boolean;
  soundEffect?: string; // URL oder ID
}

// Wizard-Schritt
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  isRequired: boolean;
  isSkippable: boolean;
  skipDefaultValues?: Record<string, any>; // Default-Werte wenn übersprungen
  fields: WizardField[];
  calculations: string[]; // IDs der zugehörigen Berechnungen
  effects: StepEffects;
  isResultStep?: boolean; // Ist dies die Ergebnis-Seite?
}

// E-Mail Einstellungen
export interface EmailSettings {
  sendToVisitor: boolean;
  sendToTeam: boolean;
  teamEmail?: string;
  templateId?: string;
  customSubject?: string;
  customBody?: string;
}

// PDF Einstellungen
export interface PDFSettings {
  generate: boolean;
  attachToEmail: boolean;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  sections: {
    inputSummary: boolean;
    calculationDetails: boolean;
    charts: boolean;
    recommendations: boolean;
    customSections?: Array<{
      title: string;
      content: string;
    }>;
  };
}

// Kontaktdaten-Gate
export interface ContactGateSettings {
  required: boolean;
  fields: Array<"name" | "email" | "phone" | "company">;
  teaserType: "blurred_total" | "partial_results" | "chart_preview" | "custom_text";
  teaserText?: string;
  showBeforeContact: {
    totalResult: boolean;
    partialResults: boolean;
    chartPreview: boolean;
  };
}

// Diagramm-Konfiguration
export type ChartType = "bar" | "pie" | "line" | "comparison";

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  dataSource: string[]; // IDs der Berechnungen
  colors?: string[];
  position: "top" | "middle" | "bottom";
  showLegend?: boolean;
  showLabels?: boolean;
}

// Lead-Magnet Settings
export interface LeadMagnetSettings {
  email: EmailSettings;
  pdf: PDFSettings;
  contactGate: ContactGateSettings;
  priceVariables: PriceVariable[];
  charts: ChartConfig[];
  expertModeEnabled: boolean; // Besucher kann zwischen Schnell/Experten wählen
}

// Berechnung (erweitert)
export interface Calculation {
  id: string;
  formula: string;
  label?: string;
  dependsOn?: string[];
  description?: string;
}

// Output (erweitert)
export interface Output {
  id: string;
  label: string;
  formula: string;
  format: "currency" | "percentage" | "number" | "text";
  unit?: string;
}

// Komplette Wizard-Konfiguration
export interface WizardBuilderConfig {
  wizardMode: boolean;
  showProgress: boolean;
  expertModeEnabled: boolean;
  steps: WizardStep[];
  calculations: Calculation[];
  outputs: Output[];
  settings: LeadMagnetSettings;
}

