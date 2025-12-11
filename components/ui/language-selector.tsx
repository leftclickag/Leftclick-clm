"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickTooltip } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { LOCALE_NAMES, LOCALE_FLAGS, SupportedLocale } from "@/lib/i18n/translations";

interface LanguageSelectorProps {
  variant?: "dropdown" | "buttons" | "minimal";
  showFlag?: boolean;
  showLabel?: boolean;
}

export function LanguageSelector({
  variant = "dropdown",
  showFlag = true,
  showLabel = true,
}: LanguageSelectorProps) {
  const { locale, setLocale, availableLocales, localeName, localeFlag } = useI18n();

  if (variant === "buttons") {
    return (
      <div className="flex gap-1">
        {availableLocales.map((loc) => (
          <QuickTooltip key={loc} content={`Sprache wechseln zu ${LOCALE_NAMES[loc]}`}>
            <Button
              variant={locale === loc ? "default" : "ghost"}
              size="sm"
              onClick={() => setLocale(loc)}
              className="px-2"
            >
              {showFlag && <span className="mr-1">{LOCALE_FLAGS[loc]}</span>}
              {loc.toUpperCase()}
            </Button>
          </QuickTooltip>
        ))}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <QuickTooltip content="Sprache wechseln">
        <button
          onClick={() => {
            const currentIndex = availableLocales.indexOf(locale);
            const nextIndex = (currentIndex + 1) % availableLocales.length;
            setLocale(availableLocales[nextIndex]);
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showFlag && <span>{localeFlag}</span>}
          <span>{locale.toUpperCase()}</span>
        </button>
      </QuickTooltip>
    );
  }

  // Dropdown variant (default)
  return (
    <QuickTooltip content="Wählen Sie Ihre bevorzugte Sprache">
      <Select value={locale} onValueChange={(v) => setLocale(v as SupportedLocale)}>
        <SelectTrigger className="w-auto min-w-[140px]">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <SelectValue>
              {showFlag && <span>{localeFlag}</span>}
              {showLabel && <span className="ml-1">{localeName}</span>}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableLocales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              <div className="flex items-center gap-2">
                {showFlag && <span>{LOCALE_FLAGS[loc]}</span>}
                <span>{LOCALE_NAMES[loc]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </QuickTooltip>
  );
}

