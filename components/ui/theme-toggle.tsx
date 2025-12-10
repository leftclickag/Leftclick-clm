"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Verhindere Hydration-Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3",
        className
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
          <div className="h-5 w-5 animate-pulse rounded bg-white/10" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Theme</span>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
        "text-muted-foreground hover:text-white",
        className
      )}
    >
      {/* Hover Background */}
      <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Icon Container mit Animation */}
      <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition-all duration-300 group-hover:bg-white/10">
        <div className="relative h-5 w-5">
          {/* Sun Icon */}
          <Sun 
            className={cn(
              "absolute inset-0 h-5 w-5 transition-all duration-500",
              isDark 
                ? "rotate-0 scale-100 text-muted-foreground group-hover:text-amber-400" 
                : "rotate-90 scale-0"
            )} 
          />
          {/* Moon Icon */}
          <Moon 
            className={cn(
              "absolute inset-0 h-5 w-5 transition-all duration-500",
              isDark 
                ? "-rotate-90 scale-0" 
                : "rotate-0 scale-100 text-purple-400"
            )} 
          />
        </div>
      </div>

      {/* Label */}
      <span className="relative z-10">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>

      {/* Toggle Switch Indicator */}
      <div className="relative z-10 ml-auto">
        <div className={cn(
          "relative h-6 w-11 rounded-full transition-all duration-300",
          isDark 
            ? "bg-white/10" 
            : "bg-gradient-to-r from-purple-500 to-cyan-500"
        )}>
          <div className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300",
            isDark 
              ? "left-0.5 bg-muted-foreground" 
              : "left-5 bg-white shadow-lg shadow-purple-500/30"
          )} />
        </div>
      </div>
    </button>
  );
}

