"use client";

import { useState, useEffect } from "react";
import { Shield, Check, X, ChevronDown, ChevronUp, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ConsentCategory {
  id: string;
  type: "necessary" | "analytics" | "marketing" | "third_party";
  title: string;
  description: string;
  required: boolean;
  defaultEnabled: boolean;
}

interface ConsentRecord {
  categoryId: string;
  granted: boolean;
  timestamp: string;
}

interface ConsentManagerProps {
  categories: ConsentCategory[];
  privacyPolicyUrl: string;
  onConsent: (consents: ConsentRecord[]) => void;
  variant?: "banner" | "modal" | "inline";
  position?: "bottom" | "top";
  brandColor?: string;
  companyName?: string;
}

const DEFAULT_CATEGORIES: ConsentCategory[] = [
  {
    id: "necessary",
    type: "necessary",
    title: "Notwendige Cookies",
    description:
      "Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.",
    required: true,
    defaultEnabled: true,
  },
  {
    id: "analytics",
    type: "analytics",
    title: "Analyse-Cookies",
    description:
      "Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie Informationen anonym sammeln.",
    required: false,
    defaultEnabled: false,
  },
  {
    id: "marketing",
    type: "marketing",
    title: "Marketing-Cookies",
    description:
      "Diese Cookies werden verwendet, um Werbung relevanter für Sie und Ihre Interessen zu gestalten.",
    required: false,
    defaultEnabled: false,
  },
];

export function ConsentManager({
  categories = DEFAULT_CATEGORIES,
  privacyPolicyUrl,
  onConsent,
  variant = "banner",
  position = "bottom",
  brandColor = "#6366F1",
  companyName = "Unternehmen",
}: ConsentManagerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initial[cat.id] = cat.required || cat.defaultEnabled;
    });
    return initial;
  });

  // Check if consent already given
  useEffect(() => {
    const stored = localStorage.getItem("clm_consent");
    if (!stored) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(stored);
        setConsents(parsed.consents || {});
      } catch {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsents: Record<string, boolean> = {};
    categories.forEach((cat) => {
      allConsents[cat.id] = true;
    });
    saveConsents(allConsents);
  };

  const handleRejectAll = () => {
    const requiredOnly: Record<string, boolean> = {};
    categories.forEach((cat) => {
      requiredOnly[cat.id] = cat.required;
    });
    saveConsents(requiredOnly);
  };

  const handleSavePreferences = () => {
    saveConsents(consents);
  };

  const saveConsents = (consentData: Record<string, boolean>) => {
    const timestamp = new Date().toISOString();
    const records: ConsentRecord[] = Object.entries(consentData).map(
      ([categoryId, granted]) => ({
        categoryId,
        granted,
        timestamp,
      })
    );

    // Store in localStorage
    localStorage.setItem(
      "clm_consent",
      JSON.stringify({
        consents: consentData,
        timestamp,
        version: 1,
      })
    );

    // Callback to parent
    onConsent(records);

    setIsVisible(false);
  };

  const toggleCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category?.required) return;

    setConsents((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (!isVisible) return null;

  const positionClasses = position === "bottom" ? "bottom-0" : "top-0";

  // Banner variant
  if (variant === "banner") {
    return (
      <div
        className={`fixed ${positionClasses} left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300`}
      >
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Main banner */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${brandColor}15` }}
                >
                  <Cookie className="h-6 w-6" style={{ color: brandColor }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    🍪 Wir nutzen Cookies
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Wir verwenden Cookies und ähnliche Technologien, um Ihnen das
                    beste Erlebnis auf unserer Website zu bieten.{" "}
                    <a
                      href={privacyPolicyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-900"
                    >
                      Mehr erfahren
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1 lg:flex-none"
                >
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  Einstellungen
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRejectAll}
                  className="flex-1 lg:flex-none"
                >
                  Nur Notwendige
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  style={{ backgroundColor: brandColor }}
                  className="flex-1 lg:flex-none text-white hover:opacity-90"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Alle akzeptieren
                </Button>
              </div>
            </div>
          </div>

          {/* Expandable details */}
          {showDetails && (
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="space-y-4 max-w-3xl">
                {categories.map((category) => (
                  <ConsentCategoryItem
                    key={category.id}
                    category={category}
                    enabled={consents[category.id]}
                    onToggle={() => toggleCategory(category.id)}
                    brandColor={brandColor}
                  />
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSavePreferences}
                  style={{ backgroundColor: brandColor }}
                  className="text-white hover:opacity-90"
                >
                  Auswahl speichern
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modal variant
  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleRejectAll}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${brandColor}15` }}
              >
                <Shield className="h-8 w-8" style={{ color: brandColor }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Datenschutz-Einstellungen
                </h2>
                <p className="text-sm text-gray-500">{companyName}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Wir respektieren Ihre Privatsphäre. Wählen Sie aus, welche Cookies
              Sie akzeptieren möchten.
            </p>

            <div className="space-y-3 mb-6">
              {categories.map((category) => (
                <ConsentCategoryItem
                  key={category.id}
                  category={category}
                  enabled={consents[category.id]}
                  onToggle={() => toggleCategory(category.id)}
                  brandColor={brandColor}
                  compact
                />
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleAcceptAll}
                style={{ backgroundColor: brandColor }}
                className="w-full text-white hover:opacity-90"
              >
                <Check className="h-4 w-4 mr-2" />
                Alle akzeptieren
              </Button>
              <Button
                variant="outline"
                onClick={handleSavePreferences}
                className="w-full"
              >
                Auswahl speichern
              </Button>
              <button
                onClick={handleRejectAll}
                className="text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                Nur notwendige Cookies verwenden
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              <a
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600"
              >
                Datenschutzerklärung
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (for embedding in forms)
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <div className="flex items-start gap-3 mb-4">
        <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-gray-900">Datenschutz</h4>
          <p className="text-sm text-gray-600">
            Bitte wählen Sie Ihre Datenschutz-Präferenzen
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {categories
          .filter((c) => !c.required)
          .map((category) => (
            <div key={category.id} className="flex items-start gap-3">
              <Checkbox
                id={category.id}
                checked={consents[category.id]}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <Label htmlFor={category.id} className="text-sm cursor-pointer">
                <span className="font-medium">{category.title}</span>
                <span className="text-gray-500 block text-xs">
                  {category.description}
                </span>
              </Label>
            </div>
          ))}
      </div>
    </div>
  );
}

// Sub-component for category items
interface ConsentCategoryItemProps {
  category: ConsentCategory;
  enabled: boolean;
  onToggle: () => void;
  brandColor: string;
  compact?: boolean;
}

function ConsentCategoryItem({
  category,
  enabled,
  onToggle,
  brandColor,
  compact = false,
}: ConsentCategoryItemProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "necessary":
        return "🔒";
      case "analytics":
        return "📊";
      case "marketing":
        return "📢";
      case "third_party":
        return "🔗";
      default:
        return "🍪";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        enabled ? "bg-green-50" : "bg-gray-100"
      }`}
    >
      <button
        onClick={onToggle}
        disabled={category.required}
        className={`flex-shrink-0 h-6 w-11 rounded-full transition-colors relative ${
          enabled ? "bg-green-500" : "bg-gray-300"
        } ${category.required ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span>{getTypeIcon(category.type)}</span>
          <span className="font-medium text-gray-900">{category.title}</span>
          {category.required && (
            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
              Erforderlich
            </span>
          )}
        </div>
        {!compact && (
          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
        )}
      </div>
    </div>
  );
}

// Hook for checking consent status
export function useConsent() {
  const [consents, setConsents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("clm_consent");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConsents(parsed.consents || {});
      } catch {
        // Invalid data
      }
    }
  }, []);

  const hasConsent = (categoryId: string): boolean => {
    return consents[categoryId] === true;
  };

  const resetConsent = () => {
    localStorage.removeItem("clm_consent");
    window.location.reload();
  };

  return { consents, hasConsent, resetConsent };
}

