"use client";

import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// 🎯 ONBOARDING TOUR / WALKTHROUGH
// ============================================

interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string | ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  highlight?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
  showProgress?: boolean;
  showSkip?: boolean;
}

export function OnboardingTour({
  steps,
  isOpen: externalIsOpen,
  onComplete,
  onSkip,
  storageKey = "onboarding_completed",
  showProgress = true,
  showSkip = true,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if tour has been completed before
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    } else {
      const completed = localStorage.getItem(storageKey);
      if (!completed) {
        setIsOpen(true);
      }
    }
  }, [externalIsOpen, storageKey]);

  // Find and highlight target element
  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return;

    const step = steps[currentStep];
    const targetEl = document.querySelector(step.target);

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll into view if needed
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add highlight class
      if (step.highlight !== false) {
        targetEl.classList.add("tour-highlight");
      }
    }

    return () => {
      const el = document.querySelector(step.target);
      el?.classList.remove("tour-highlight");
    };
  }, [isOpen, currentStep, steps]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(storageKey, "true");
    onComplete?.();
  }, [storageKey, onComplete]);

  const handleSkip = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(storageKey, "true");
    onSkip?.();
  }, [storageKey, onSkip]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!isOpen || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const placement = step.placement || "bottom";

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!targetRect) return {};

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate

    switch (placement) {
      case "top":
        return {
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          top: targetRect.top - tooltipHeight - padding,
        };
      case "bottom":
        return {
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          top: targetRect.bottom + padding,
        };
      case "left":
        return {
          left: targetRect.left - tooltipWidth - padding,
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
        };
      case "right":
        return {
          left: targetRect.right + padding,
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[99998]">
        {/* Dark overlay with hole for target */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#tour-mask)"
          />
        </svg>

        {/* Highlight border */}
        {targetRect && (
          <motion.div
            className="absolute border-2 border-primary rounded-lg pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          >
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 border-2 border-primary rounded-lg"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={tooltipRef}
          key={currentStep}
          className="fixed z-[99999] w-80"
          style={getTooltipStyle()}
          initial={{ opacity: 0, y: placement === "top" ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: placement === "top" ? 10 : -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium text-sm">
                  Schritt {currentStep + 1} von {steps.length}
                </span>
              </div>
              {showSkip && (
                <button
                  onClick={handleSkip}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <div className="text-muted-foreground text-sm mb-4">
                {step.content}
              </div>

              {/* Custom Action */}
              {step.action && (
                <Button
                  onClick={step.action.onClick}
                  variant="outline"
                  size="sm"
                  className="mb-4"
                >
                  {step.action.label}
                </Button>
              )}

              {/* Progress */}
              {showProgress && (
                <div className="flex gap-1 mb-4">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full ${
                        index <= currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Zurück
                </button>

                <Button onClick={handleNext} size="sm">
                  {currentStep === steps.length - 1 ? "Fertig" : "Weiter"}
                  {currentStep < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div
            className={`absolute w-3 h-3 bg-card border-border rotate-45 ${
              placement === "top"
                ? "bottom-[-6px] left-1/2 -translate-x-1/2 border-r border-b"
                : placement === "bottom"
                ? "top-[-6px] left-1/2 -translate-x-1/2 border-l border-t"
                : placement === "left"
                ? "right-[-6px] top-1/2 -translate-y-1/2 border-r border-t"
                : "left-[-6px] top-1/2 -translate-y-1/2 border-l border-b"
            }`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Global styles for highlight */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 99997 !important;
        }
      `}</style>
    </>
  );
}

// ============================================
// 🎯 HOOK FOR TOUR CONTROL
// ============================================

export function useOnboardingTour(storageKey: string = "onboarding_completed") {
  const [isOpen, setIsOpen] = useState(false);

  const startTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setIsOpen(true);
  }, [storageKey]);

  const endTour = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  }, [storageKey]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const hasCompleted = useCallback(() => {
    return localStorage.getItem(storageKey) === "true";
  }, [storageKey]);

  return {
    isOpen,
    setIsOpen,
    startTour,
    endTour,
    resetTour,
    hasCompleted,
  };
}

