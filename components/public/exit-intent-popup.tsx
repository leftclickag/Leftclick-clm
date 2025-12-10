"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Gift, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ExitIntentConfig {
  enabled: boolean;
  headline: string;
  subheadline?: string;
  cta_text: string;
  dismiss_text: string;
  incentive_type?: "discount" | "bonus" | "reminder" | "custom";
  incentive_value?: string;
  background_color?: string;
  overlay_opacity?: number;
  delay_seconds?: number;
  show_only_once?: boolean;
}

interface ExitIntentPopupProps {
  config: ExitIntentConfig;
  leadMagnetId: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export function ExitIntentPopup({
  config,
  leadMagnetId,
  onAccept,
  onDismiss,
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [canShow, setCanShow] = useState(false);

  // Delay before popup can show
  useEffect(() => {
    if (!config.enabled) return;

    const timer = setTimeout(() => {
      setCanShow(true);
    }, (config.delay_seconds || 0) * 1000);

    return () => clearTimeout(timer);
  }, [config.delay_seconds, config.enabled]);

  // Check if already shown
  useEffect(() => {
    if (config.show_only_once) {
      const shown = localStorage.getItem(`exit_intent_shown_${leadMagnetId}`);
      if (shown) {
        setHasTriggered(true);
      }
    }
  }, [leadMagnetId, config.show_only_once]);

  const handleExitIntent = useCallback(() => {
    if (!config.enabled || hasTriggered || !canShow) return;

    setIsVisible(true);
    setHasTriggered(true);

    if (config.show_only_once) {
      localStorage.setItem(`exit_intent_shown_${leadMagnetId}`, "true");
    }
  }, [config.enabled, config.show_only_once, hasTriggered, canShow, leadMagnetId]);

  // Listen for exit intent event from tracker
  useEffect(() => {
    const handleEvent = () => handleExitIntent();
    window.addEventListener("exitIntent", handleEvent);
    return () => window.removeEventListener("exitIntent", handleEvent);
  }, [handleExitIntent]);

  // Mouse leave detection (backup)
  useEffect(() => {
    if (!config.enabled || hasTriggered) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && canShow) {
        handleExitIntent();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [config.enabled, hasTriggered, canShow, handleExitIntent]);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  const overlayOpacity = config.overlay_opacity ?? 0.5;

  const getIncentiveIcon = () => {
    switch (config.incentive_type) {
      case "discount":
        return "🏷️";
      case "bonus":
        return "🎁";
      case "reminder":
        return "⏰";
      default:
        return "✨";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: overlayOpacity }}
        onClick={handleDismiss}
      />

      {/* Popup Card */}
      <Card
        className="relative z-10 w-full max-w-md animate-in zoom-in-95 fade-in duration-300 shadow-2xl"
        style={{ backgroundColor: config.background_color || "#FFFFFF" }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="text-center pb-2 pt-8">
          {config.incentive_type && (
            <div className="mx-auto mb-4 text-5xl animate-bounce">
              {getIncentiveIcon()}
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-gray-900">
            {config.headline}
          </CardTitle>
          {config.subheadline && (
            <CardDescription className="text-base mt-2">
              {config.subheadline}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4 pt-2 pb-6">
          {/* Incentive highlight */}
          {config.incentive_value && (
            <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-center text-white">
              <p className="text-sm font-medium opacity-90">Dein Bonus:</p>
              <p className="text-2xl font-bold">{config.incentive_value}</p>
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleAccept}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30"
          >
            {config.cta_text}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Dismiss link */}
          <button
            onClick={handleDismiss}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            {config.dismiss_text}
          </button>
        </CardContent>

        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-yellow-400 animate-ping opacity-75" />
        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-pink-400 animate-pulse" />
      </Card>
    </div>
  );
}

// Hook for easy integration
export function useExitIntent(leadMagnetId: string) {
  const [showPopup, setShowPopup] = useState(false);
  const [config, setConfig] = useState<ExitIntentConfig | null>(null);

  useEffect(() => {
    // Fetch exit intent config
    fetch(`/api/exit-intent/${leadMagnetId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.enabled) {
          setConfig(data);
        }
      })
      .catch(console.error);
  }, [leadMagnetId]);

  return {
    config,
    showPopup,
    setShowPopup,
  };
}

