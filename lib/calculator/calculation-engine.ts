import { evaluate } from "mathjs";
import type {
  CalculatorConfig,
  Calculation,
  Condition,
  PriceTable,
  Variable,
} from "@/types/lead-magnet";

export interface CalculationContext {
  [key: string]: any;
}

export class CalculationEngine {
  private config: CalculatorConfig;
  private context: CalculationContext = {};

  constructor(config: CalculatorConfig) {
    this.config = config;
  }

  /**
   * Setzt einen Wert im Berechnungskontext
   */
  setVariable(id: string, value: any): void {
    this.context[id] = value;
  }

  /**
   * Setzt mehrere Werte auf einmal
   */
  setVariables(variables: Record<string, any>): void {
    Object.assign(this.context, variables);
  }

  /**
   * Holt einen Wert aus dem Kontext
   */
  getVariable(id: string): any {
    return this.context[id];
  }

  /**
   * Holt einen Preis aus einer Preistabelle
   * @param tableId - ID der Preistabelle
   * @param keyOrValue - Für "flat": String-Key, für "tiered" und "per_unit": numerischer Wert
   */
  getPrice(tableId: string, keyOrValue: string | number): number {
    const table = this.config.priceTables?.find((t) => t.id === tableId);
    if (!table) {
      console.warn(`Preistabelle ${tableId} nicht gefunden`);
      return 0;
    }

    switch (table.type) {
      case "flat":
        if (typeof keyOrValue === "string") {
          return (table.data[keyOrValue] as number) || 0;
        }
        return 0;
      case "tiered":
        if (typeof keyOrValue === "number") {
          return this.getTieredPrice(table, keyOrValue);
        }
        return 0;
      case "per_unit":
        if (typeof keyOrValue === "number") {
          return this.getPerUnitPrice(table, keyOrValue);
        }
        // Fallback: Wenn String übergeben wird, versuche unitPrice zu holen
        if (keyOrValue === "unitPrice") {
          return (table.data.unitPrice as number) || 0;
        }
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Berechnet Preis basierend auf Tiered-Pricing
   */
  private getTieredPrice(table: PriceTable, value: number): number {
    const tiers = table.data.tiers as Array<{
      min: number;
      max?: number;
      price: number;
    }>;
    if (!tiers) return 0;

    for (const tier of tiers) {
      if (value >= tier.min && (tier.max === undefined || value <= tier.max)) {
        return tier.price;
      }
    }
    return tiers[tiers.length - 1]?.price || 0;
  }

  /**
   * Berechnet Preis basierend auf Per-Unit-Pricing
   */
  private getPerUnitPrice(table: PriceTable, units: number): number {
    const unitPrice = table.data.unitPrice as number;
    if (!unitPrice) return 0;
    return units * unitPrice;
  }

  /**
   * Führt eine Berechnung durch
   */
  calculate(calculationId: string): number {
    const calculation = this.config.calculations?.find(
      (c) => c.id === calculationId
    );
    if (!calculation) {
      throw new Error(`Berechnung ${calculationId} nicht gefunden`);
    }

    // Prüfe Abhängigkeiten
    for (const dep of calculation.dependsOn) {
      if (this.context[dep] === undefined) {
        throw new Error(
          `Abhängigkeit ${dep} für Berechnung ${calculationId} nicht erfüllt`
        );
      }
    }

    return this.evaluateFormula(calculation.formula);
  }

  /**
   * Führt alle Berechnungen in der richtigen Reihenfolge durch
   */
  calculateAll(): Record<string, number> {
    const results: Record<string, number> = {};
    const calculated = new Set<string>();

    // Topologisches Sortieren basierend auf Abhängigkeiten
    const calculations = this.config.calculations || [];
    const remaining = [...calculations];

    while (remaining.length > 0) {
      let progress = false;

      for (let i = remaining.length - 1; i >= 0; i--) {
        const calc = remaining[i];
        const canCalculate = calc.dependsOn.every(
          (dep) =>
            this.context[dep] !== undefined || calculated.has(dep)
        );

        if (canCalculate) {
          // Setze berechnete Werte in den Kontext
          for (const dep of calc.dependsOn) {
            if (calculated.has(dep) && this.context[dep] === undefined) {
              this.context[dep] = results[dep];
            }
          }

          const result = this.calculate(calc.id);
          results[calc.id] = result;
          this.context[calc.id] = result;
          calculated.add(calc.id);
          remaining.splice(i, 1);
          progress = true;
        }
      }

      if (!progress) {
        throw new Error(
          "Zirkuläre Abhängigkeiten oder fehlende Werte in Berechnungen"
        );
      }
    }

    return results;
  }

  /**
   * Prüft Bedingungen und führt entsprechende Aktionen aus
   */
  evaluateConditions(): void {
    for (const condition of this.config.conditions || []) {
      const conditionResult = this.evaluateFormula(condition.if);
      if (conditionResult) {
        const thenResult = this.evaluateFormula(condition.then);
        // Ergebnis kann in Kontext gespeichert werden
        this.context[`${condition.id}_result`] = thenResult;
      } else if (condition.else) {
        const elseResult = this.evaluateFormula(condition.else);
        this.context[`${condition.id}_result`] = elseResult;
      }
    }
  }

  /**
   * Wertet eine Formel sicher aus
   */
  evaluateFormula(formula: string): number {
    try {
      // Ersetze Variablen im Kontext
      let processedFormula = formula;
      
      // Sortiere Variablennamen nach Länge (längere zuerst), um Konflikte zu vermeiden
      const sortedKeys = Object.keys(this.context).sort((a, b) => b.length - a.length);
      
      for (const key of sortedKeys) {
        const value = this.context[key];
        // Ersetze nur vollständige Variablennamen (nicht Teilstrings)
        const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "g");
        
        if (value === null || value === undefined) {
          // Überspringe null/undefined Werte
          continue;
        } else if (typeof value === "number") {
          if (isNaN(value) || !isFinite(value)) {
            console.warn(`Variable ${key} hat ungültigen numerischen Wert: ${value}`);
            processedFormula = processedFormula.replace(regex, "0");
          } else {
            processedFormula = processedFormula.replace(regex, value.toString());
          }
        } else if (typeof value === "boolean") {
          processedFormula = processedFormula.replace(regex, value ? "1" : "0");
        } else if (Array.isArray(value)) {
          // Für Arrays: Summe oder Länge
          processedFormula = processedFormula.replace(regex, value.length.toString());
        } else if (typeof value === "string") {
          // Versuche String zu Number zu konvertieren
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && isFinite(numValue)) {
            processedFormula = processedFormula.replace(regex, numValue.toString());
          }
        }
      }

      // Prüfe ob noch Variablen in der Formel sind (nicht ersetzt wurden)
      const remainingVars = processedFormula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g);
      if (remainingVars && remainingVars.length > 0) {
        const uniqueVars = [...new Set(remainingVars)];
        // Filtere bekannte Funktionen und Konstanten
        const knownFunctions = ['sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs', 'max', 'min', 'min', 'max'];
        const missingVars = uniqueVars.filter(v => !knownFunctions.includes(v.toLowerCase()));
        if (missingVars.length > 0) {
          console.warn(`Fehlende Variablen in Formel ${formula}:`, missingVars);
          // Ersetze fehlende Variablen mit 0
          for (const varName of missingVars) {
            processedFormula = processedFormula.replace(new RegExp(`\\b${varName}\\b`, "g"), "0");
          }
        }
      }

      // Verwende mathjs für sichere Auswertung
      const result = evaluate(processedFormula);
      
      if (typeof result !== "number" || isNaN(result) || !isFinite(result)) {
        console.warn(`Formel ${formula} ergab ungültiges Ergebnis:`, result);
        return 0;
      }
      
      return result;
    } catch (error) {
      console.error(`Fehler bei Formelauswertung: ${formula}`, error);
      console.error("Kontext:", this.context);
      return 0; // Return 0 statt Error zu werfen, damit UI nicht crasht
    }
  }

  /**
   * Berechnet alle Outputs
   */
  getOutputs(): Record<string, any> {
    const outputs: Record<string, any> = {};
    const calculationResults = this.calculateAll();
    this.evaluateConditions();

    for (const output of this.config.outputs || []) {
      const value = this.evaluateFormula(output.formula);
      outputs[output.id] = {
        label: output.label,
        value: this.formatOutput(value, output.format, output.unit),
        rawValue: value,
      };
    }

    return outputs;
  }

  /**
   * Formatiert einen Output-Wert
   */
  private formatOutput(
    value: number,
    format?: string,
    unit?: string
  ): string {
    switch (format) {
      case "currency":
        return `${value.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} €`;
      case "percentage":
        return `${value.toFixed(2)}%`;
      case "number":
        return value.toLocaleString("de-DE");
      default:
        return unit ? `${value} ${unit}` : value.toString();
    }
  }

  /**
   * Gibt den vollständigen Kontext zurück
   */
  getContext(): CalculationContext {
    return { ...this.context };
  }

  /**
   * Setzt den Kontext zurück
   */
  reset(): void {
    this.context = {};
  }
}

