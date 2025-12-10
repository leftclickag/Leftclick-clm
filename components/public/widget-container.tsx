"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LeadMagnet } from "@/types/lead-magnet";
import { EbookWidget } from "@/components/public/widgets/ebook-widget";
import { ChecklistWidget } from "@/components/public/widgets/checklist-widget";
import { CalculatorWidget } from "@/components/public/widgets/calculator-widget";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

interface WidgetContainerProps {
  slug: string;
  tenantId?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export function WidgetContainer({ slug, tenantId, branding }: WidgetContainerProps) {
  const [leadMagnet, setLeadMagnet] = useState<LeadMagnet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [userOverride, setUserOverride] = useState<boolean | null>(null);
  const [allowUserToggle, setAllowUserToggle] = useState(true);

  useEffect(() => {
    async function loadLeadMagnet() {
      const supabase = createClient();
      let query = supabase
        .from("lead_magnets")
        .select("*")
        .eq("slug", slug)
        .eq("active", true);

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query.single();
      if (data) {
        setLeadMagnet(data);
        // Check if user toggle is allowed (default: true)
        setAllowUserToggle(data.config?.allowUserThemeToggle !== false);
      }
      setLoading(false);
    }

    loadLeadMagnet();
  }, [slug, tenantId]);

  // Handle theme mode
  useEffect(() => {
    if (!leadMagnet) return;

    // If user has manually toggled, use their preference
    if (userOverride !== null) {
      setIsDark(userOverride);
      return;
    }

    const themeMode: ThemeMode = leadMagnet.config?.themeMode || "system";

    if (themeMode === "dark") {
      setIsDark(true);
    } else if (themeMode === "light") {
      setIsDark(false);
    } else {
      // System preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        if (userOverride === null) setIsDark(e.matches);
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [leadMagnet, userOverride]);

  const toggleTheme = () => {
    setUserOverride(!isDark);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Lädt...</div>;
  }

  if (!leadMagnet) {
    return <div className="p-8 text-center">Lead-Magnet nicht gefunden</div>;
  }

  const style = {
    ...(branding?.primaryColor && {
      "--primary": branding.primaryColor,
    }),
  } as React.CSSProperties;

  return (
    <div 
      className={`widget-container ${isDark ? "dark" : ""}`} 
      style={style}
    >
      <div className={`min-h-screen transition-colors duration-300 relative ${
        isDark 
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" 
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900"
      }`}>
        {/* Theme Toggle Button */}
        {allowUserToggle && (
          <button
            onClick={toggleTheme}
            className={`fixed top-4 right-4 z-50 p-3 rounded-full transition-all duration-300 shadow-lg hover:scale-110 ${
              isDark 
                ? "bg-slate-700/80 hover:bg-slate-600/80 text-amber-400 shadow-amber-500/20" 
                : "bg-white/80 hover:bg-white text-slate-700 shadow-slate-500/20"
            } backdrop-blur-sm border ${
              isDark ? "border-slate-600" : "border-slate-200"
            }`}
            aria-label={isDark ? "Zu hellem Modus wechseln" : "Zu dunklem Modus wechseln"}
          >
            {isDark ? (
              <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>
        )}

        {leadMagnet.type === "ebook" && (
          <EbookWidget leadMagnet={leadMagnet} />
        )}
        {leadMagnet.type === "checklist" && (
          <ChecklistWidget leadMagnet={leadMagnet} />
        )}
        {leadMagnet.type === "calculator" && (
          <CalculatorWidget leadMagnet={leadMagnet} />
        )}
        {leadMagnet.type === "quiz" && (
          <QuizWidget leadMagnet={leadMagnet} />
        )}
      </div>
    </div>
  );
}

function QuizWidget({ leadMagnet }: { leadMagnet: LeadMagnet }) {
  return <div>Quiz Widget für {leadMagnet.title}</div>;
}

