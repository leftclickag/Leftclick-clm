"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// 💰 PRICING TABLE
// ============================================

interface PricingFeature {
  name: string;
  included: boolean | string;
  tooltip?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: PricingFeature[];
  cta: string;
  popular?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

interface PricingTableProps {
  plans: PricingPlan[];
  onSelect?: (planId: string, billing: "monthly" | "yearly") => void;
  currency?: string;
  className?: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfekt für Einsteiger",
    price: { monthly: 29, yearly: 290 },
    features: [
      { name: "5 Lead Magnets", included: true },
      { name: "1.000 Leads/Monat", included: true },
      { name: "E-Mail-Support", included: true },
      { name: "Analytics Basis", included: true },
      { name: "A/B Testing", included: false },
      { name: "Custom Branding", included: false },
      { name: "API-Zugang", included: false },
    ],
    cta: "Kostenlos testen",
    icon: <Zap className="h-6 w-6" />,
    color: "#10B981",
  },
  {
    id: "pro",
    name: "Professional",
    description: "Für wachsende Teams",
    price: { monthly: 79, yearly: 790 },
    features: [
      { name: "Unbegrenzte Lead Magnets", included: true },
      { name: "10.000 Leads/Monat", included: true },
      { name: "Priority Support", included: true },
      { name: "Analytics Pro", included: true },
      { name: "A/B Testing", included: true },
      { name: "Custom Branding", included: true },
      { name: "API-Zugang", included: false },
    ],
    cta: "Jetzt starten",
    popular: true,
    icon: <Sparkles className="h-6 w-6" />,
    color: "#8B5CF6",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Für große Unternehmen",
    price: { monthly: 199, yearly: 1990 },
    features: [
      { name: "Unbegrenzte Lead Magnets", included: true },
      { name: "Unbegrenzte Leads", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "Analytics Enterprise", included: true },
      { name: "A/B Testing", included: true },
      { name: "Custom Branding", included: true },
      { name: "API-Zugang", included: true },
    ],
    cta: "Kontakt aufnehmen",
    icon: <Crown className="h-6 w-6" />,
    color: "#F59E0B",
  },
];

export function PricingTable({
  plans = DEFAULT_PLANS,
  onSelect,
  currency = "€",
  className = "",
}: PricingTableProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const yearlyDiscount = 20; // percent

  return (
    <div className={className}>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span
          className={`font-medium ${
            billing === "monthly" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Monatlich
        </span>
        <button
          onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
          className={`relative h-8 w-14 rounded-full transition-colors ${
            billing === "yearly" ? "bg-primary" : "bg-muted"
          }`}
        >
          <motion.div
            className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
            animate={{ left: billing === "monthly" ? "4px" : "calc(100% - 28px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </button>
        <span
          className={`font-medium ${
            billing === "yearly" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Jährlich
          <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
            -{yearlyDiscount}%
          </span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-2xl border ${
              plan.popular
                ? "border-primary bg-gradient-to-b from-primary/5 to-transparent shadow-xl shadow-primary/10"
                : "border-border bg-card"
            } overflow-hidden`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                >
                  {plan.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  )}
                </div>
                {plan.popular && (
                  <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                    Beliebt
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {currency}
                    {billing === "monthly" ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-muted-foreground">
                    /{billing === "monthly" ? "Monat" : "Jahr"}
                  </span>
                </div>
                {billing === "yearly" && (
                  <p className="text-sm text-green-500 mt-1">
                    Du sparst {currency}
                    {(plan.price.monthly * 12 - plan.price.yearly).toFixed(0)} pro Jahr
                  </p>
                )}
              </div>

              {/* CTA */}
              <Button
                onClick={() => onSelect?.(plan.id, billing)}
                className={`w-full ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {typeof feature.included === "string"
                        ? feature.included
                        : feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 📊 COMPARISON TABLE
// ============================================

interface ComparisonFeature {
  name: string;
  category?: string;
  plans: Record<string, boolean | string>;
}

interface ComparisonTableProps {
  plans: { id: string; name: string }[];
  features: ComparisonFeature[];
  className?: string;
}

export function ComparisonTable({
  plans,
  features,
  className = "",
}: ComparisonTableProps) {
  const categories = [...new Set(features.map((f) => f.category).filter(Boolean))];

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 font-medium text-muted-foreground">Features</th>
            {plans.map((plan) => (
              <th key={plan.id} className="p-4 text-center font-bold">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.length > 0
            ? categories.map((category) => (
                <>
                  <tr key={category}>
                    <td
                      colSpan={plans.length + 1}
                      className="p-4 bg-muted/50 font-semibold text-sm uppercase tracking-wider"
                    >
                      {category}
                    </td>
                  </tr>
                  {features
                    .filter((f) => f.category === category)
                    .map((feature) => (
                      <FeatureRow key={feature.name} feature={feature} plans={plans} />
                    ))}
                </>
              ))
            : features.map((feature) => (
                <FeatureRow key={feature.name} feature={feature} plans={plans} />
              ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureRow({
  feature,
  plans,
}: {
  feature: ComparisonFeature;
  plans: { id: string; name: string }[];
}) {
  return (
    <tr className="border-b border-border">
      <td className="p-4 text-sm">{feature.name}</td>
      {plans.map((plan) => {
        const value = feature.plans[plan.id];
        return (
          <td key={plan.id} className="p-4 text-center">
            {typeof value === "boolean" ? (
              value ? (
                <Check className="h-5 w-5 text-green-500 mx-auto" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
              )
            ) : (
              <span className="text-sm">{value}</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

