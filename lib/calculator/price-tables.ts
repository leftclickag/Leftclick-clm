import type { PriceTable } from "@/types/lead-magnet";

/**
 * Microsoft Teams Telephony Preistabellen
 */
export const microsoftTeamsPriceTables: PriceTable[] = [
  {
    id: "phone_system_license",
    name: "Microsoft Phone System Lizenz",
    type: "per_unit",
    data: {
      unitPrice: 8.0, // € pro User/Monat
      description: "Grundlizenz für Phone System",
    },
  },
  {
    id: "calling_plan_domestic",
    name: "Calling Plan Domestic",
    type: "per_unit",
    data: {
      unitPrice: 12.0, // € pro User/Monat
      description: "Nationale Anrufe",
    },
  },
  {
    id: "calling_plan_international",
    name: "Calling Plan International",
    type: "per_unit",
    data: {
      unitPrice: 24.0, // € pro User/Monat
      description: "Internationale Anrufe",
    },
  },
  {
    id: "direct_routing_sbc",
    name: "Direct Routing SBC Kosten",
    type: "tiered",
    data: {
      tiers: [
        { min: 1, max: 10, price: 500 }, // € pro Monat
        { min: 11, max: 50, price: 2000 },
        { min: 51, max: 100, price: 5000 },
        { min: 101, price: 10000 },
      ],
      description: "Session Border Controller Kosten",
    },
  },
  {
    id: "operator_connect",
    name: "Operator Connect",
    type: "per_unit",
    data: {
      unitPrice: 15.0, // € pro User/Monat
      description: "Operator Connect Lizenz",
    },
  },
];

/**
 * Microsoft 365 Lizenz-Preistabellen
 */
export const microsoft365PriceTables: PriceTable[] = [
  {
    id: "m365_business_basic",
    name: "Microsoft 365 Business Basic",
    type: "flat",
    data: {
      price: 5.0, // € pro User/Monat
      features: ["Exchange", "OneDrive", "Teams"],
    },
  },
  {
    id: "m365_business_standard",
    name: "Microsoft 365 Business Standard",
    type: "flat",
    data: {
      price: 10.5, // € pro User/Monat
      features: ["Exchange", "OneDrive", "Teams", "Office Apps"],
    },
  },
  {
    id: "m365_business_premium",
    name: "Microsoft 365 Business Premium",
    type: "flat",
    data: {
      price: 20.0, // € pro User/Monat
      features: [
        "Exchange",
        "OneDrive",
        "Teams",
        "Office Apps",
        "Security",
        "Device Management",
      ],
    },
  },
  {
    id: "m365_e3",
    name: "Microsoft 365 E3",
    type: "flat",
    data: {
      price: 32.0, // € pro User/Monat
      features: ["All Business Features", "Advanced Security", "Compliance"],
    },
  },
  {
    id: "m365_e5",
    name: "Microsoft 365 E5",
    type: "flat",
    data: {
      price: 52.0, // € pro User/Monat
      features: [
        "All E3 Features",
        "Advanced Threat Protection",
        "Advanced Compliance",
        "Power BI Pro",
      ],
    },
  },
  {
    id: "volume_discount",
    name: "Volumenrabatt",
    type: "tiered",
    data: {
      tiers: [
        { min: 1, max: 9, price: 0 }, // Kein Rabatt
        { min: 10, max: 49, price: 0.05 }, // 5% Rabatt
        { min: 50, max: 99, price: 0.1 }, // 10% Rabatt
        { min: 100, max: 249, price: 0.15 }, // 15% Rabatt
        { min: 250, price: 0.2 }, // 20% Rabatt
      ],
      description: "Rabatt basierend auf Anzahl Lizenzen",
    },
  },
];

/**
 * Cloud-Migration Preistabellen
 */
export const cloudMigrationPriceTables: PriceTable[] = [
  {
    id: "azure_vm_cost",
    name: "Azure VM Kosten",
    type: "tiered",
    data: {
      tiers: [
        { min: 1, max: 4, price: 100 }, // € pro Monat (kleine VMs)
        { min: 5, max: 8, price: 300 }, // € pro Monat (mittlere VMs)
        { min: 9, max: 16, price: 600 }, // € pro Monat (große VMs)
        { min: 17, price: 1200 }, // € pro Monat (sehr große VMs)
      ],
      description: "Kosten basierend auf vCPU-Anzahl",
    },
  },
  {
    id: "aws_ec2_cost",
    name: "AWS EC2 Kosten",
    type: "tiered",
    data: {
      tiers: [
        { min: 1, max: 2, price: 80 }, // € pro Monat
        { min: 3, max: 4, price: 250 },
        { min: 5, max: 8, price: 500 },
        { min: 9, price: 1000 },
      ],
      description: "Kosten basierend auf Instance-Größe",
    },
  },
  {
    id: "migration_service",
    name: "Migrations-Service",
    type: "per_unit",
    data: {
      unitPrice: 500, // € pro Server
      description: "Einmalige Migrationskosten pro Server",
    },
  },
];

/**
 * IT-Outsourcing Preistabellen
 */
export const itOutsourcingPriceTables: PriceTable[] = [
  {
    id: "support_tier1",
    name: "Support Tier 1",
    type: "per_unit",
    data: {
      unitPrice: 50, // € pro User/Monat
      description: "Basis-Support (8x5)",
    },
  },
  {
    id: "support_tier2",
    name: "Support Tier 2",
    type: "per_unit",
    data: {
      unitPrice: 100, // € pro User/Monat
      description: "Erweiterter Support (24x7)",
    },
  },
  {
    id: "support_tier3",
    name: "Support Tier 3",
    type: "per_unit",
    data: {
      unitPrice: 150, // € pro User/Monat
      description: "Premium Support mit Proaktiver Überwachung",
    },
  },
  {
    id: "security_services",
    name: "Security Services",
    type: "per_unit",
    data: {
      unitPrice: 30, // € pro User/Monat
      description: "IT-Security Services",
    },
  },
  {
    id: "cloud_services",
    name: "Cloud Services",
    type: "per_unit",
    data: {
      unitPrice: 40, // € pro User/Monat
      description: "Cloud-Management Services",
    },
  },
];

/**
 * Alle Preistabellen zusammenfassen
 */
export const allPriceTables: PriceTable[] = [
  ...microsoftTeamsPriceTables,
  ...microsoft365PriceTables,
  ...cloudMigrationPriceTables,
  ...itOutsourcingPriceTables,
];

/**
 * Holt eine Preistabelle nach ID
 */
export function getPriceTable(id: string): PriceTable | undefined {
  return allPriceTables.find((table) => table.id === id);
}

