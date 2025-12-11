import { PriceVariable } from "@/types/wizard-builder";
import { allPriceTables } from "./price-tables";

/**
 * Konvertiert Preistabellen in PriceVariable-Format
 */
export function getDefaultPriceVariables(): PriceVariable[] {
  const variables: PriceVariable[] = [];

  allPriceTables.forEach((table) => {
    // Erstelle Variable-Name aus ID
    const variableName = table.id.replace(/-/g, "_");
    
    if (table.type === "per_unit") {
      variables.push({
        id: `var_${table.id}`,
        name: table.name,
        variableName: variableName,
        value: table.data.unitPrice || 0,
        unit: "CHF/User/Monat",
        category: getCategoryFromName(table.name),
        description: table.data.description,
        usedIn: [],
      });
    } else if (table.type === "flat") {
      variables.push({
        id: `var_${table.id}`,
        name: table.name,
        variableName: variableName,
        value: table.data.price || 0,
        unit: "CHF/User/Monat",
        category: getCategoryFromName(table.name),
        description: table.data.description,
        usedIn: [],
      });
    } else if (table.type === "tiered") {
      // Für tiered Preise nehmen wir den ersten Tier-Preis als Standard
      const firstTier = table.data.tiers?.[0];
      if (firstTier) {
        variables.push({
          id: `var_${table.id}`,
          name: table.name,
          variableName: variableName,
          value: firstTier.price || 0,
          unit: "CHF/Monat",
          category: getCategoryFromName(table.name),
          description: `${table.data.description} (Tier: ${firstTier.min}-${firstTier.max || "∞"})`,
          usedIn: [],
        });
      }
    }
  });

  return variables;
}

/**
 * Bestimmt die Kategorie basierend auf dem Namen
 */
function getCategoryFromName(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("microsoft") || lowerName.includes("m365") || lowerName.includes("teams")) {
    return "Microsoft";
  }
  if (lowerName.includes("azure") || lowerName.includes("aws") || lowerName.includes("cloud") || lowerName.includes("migration")) {
    return "Cloud";
  }
  if (lowerName.includes("support") || lowerName.includes("outsourcing") || lowerName.includes("security")) {
    return "IT-Services";
  }
  if (lowerName.includes("license") || lowerName.includes("lizenz")) {
    return "Lizenzen";
  }
  
  return "Sonstiges";
}

