"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, Flame } from "lucide-react";

// ============================================
// ⏰ COUNTDOWN TIMER
// ============================================

interface CountdownTimerProps {
  targetDate: Date | string;
  onComplete?: () => void;
  variant?: "default" | "compact" | "flip" | "urgency";
  showLabels?: boolean;
  showDays?: boolean;
  className?: string;
  urgencyThreshold?: number; // Minutes before showing urgency
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({
  targetDate,
  onComplete,
  variant = "default",
  showLabels = true,
  showDays = true,
  className = "",
  urgencyThreshold = 60, // 1 hour
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  const target = useMemo(() => new Date(targetDate), [targetDate]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [target, onComplete]);

  const isUrgent = timeLeft.total > 0 && timeLeft.total <= urgencyThreshold * 60 * 1000;

  if (isComplete) {
    return (
      <div className={`text-center ${className}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-green-500"
        >
          ✓ Zeit abgelaufen!
        </motion.div>
      </div>
    );
  }

  // Flip variant
  if (variant === "flip") {
    return (
      <div className={`flex gap-2 ${className}`}>
        {showDays && timeLeft.days > 0 && (
          <FlipUnit value={timeLeft.days} label="Tage" />
        )}
        <FlipUnit value={timeLeft.hours} label="Std" />
        <FlipUnit value={timeLeft.minutes} label="Min" />
        <FlipUnit value={timeLeft.seconds} label="Sek" />
      </div>
    );
  }

  // Urgency variant
  if (variant === "urgency") {
    return (
      <motion.div
        className={`relative overflow-hidden rounded-xl p-4 ${
          isUrgent
            ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30"
            : "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
        } ${className}`}
        animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1, repeat: isUrgent ? Infinity : 0 }}
      >
        {isUrgent && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative flex items-center gap-3">
          {isUrgent ? (
            <Flame className="h-6 w-6 text-red-500 animate-pulse" />
          ) : (
            <Clock className="h-6 w-6 text-indigo-400" />
          )}

          <div>
            <p className={`text-sm font-medium ${isUrgent ? "text-red-400" : "text-indigo-400"}`}>
              {isUrgent ? "⚡ Nur noch wenig Zeit!" : "Angebot endet in"}
            </p>
            <div className="flex gap-2 text-2xl font-bold">
              {showDays && timeLeft.days > 0 && (
                <span>{timeLeft.days}d</span>
              )}
              <span>{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="animate-pulse">:</span>
              <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="animate-pulse">:</span>
              <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1 font-mono ${className}`}>
        <Clock className="h-4 w-4" />
        {showDays && timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{String(timeLeft.hours).padStart(2, "0")}</span>:
        <span>{String(timeLeft.minutes).padStart(2, "0")}</span>:
        <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex gap-4 ${className}`}>
      {showDays && timeLeft.days > 0 && (
        <TimeUnit value={timeLeft.days} label="Tage" showLabels={showLabels} />
      )}
      <TimeUnit value={timeLeft.hours} label="Stunden" showLabels={showLabels} />
      <TimeUnit value={timeLeft.minutes} label="Minuten" showLabels={showLabels} />
      <TimeUnit value={timeLeft.seconds} label="Sekunden" showLabels={showLabels} isSeconds />
    </div>
  );
}

// Time Unit Component
function TimeUnit({
  value,
  label,
  showLabels,
  isSeconds = false,
}: {
  value: number;
  label: string;
  showLabels: boolean;
  isSeconds?: boolean;
}) {
  return (
    <div className="text-center">
      <motion.div
        className="relative bg-card border border-border rounded-xl px-4 py-3 min-w-[70px]"
        animate={isSeconds ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: isSeconds ? Infinity : 0 }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            className="text-3xl font-bold tabular-nums"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </motion.div>
      {showLabels && (
        <span className="text-xs text-muted-foreground mt-1 block">{label}</span>
      )}
    </div>
  );
}

// Flip Unit Component
function FlipUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ perspective: "200px" }}>
        {/* Top half */}
        <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              className="text-2xl font-bold text-white tabular-nums"
              initial={{ rotateX: -90 }}
              animate={{ rotateX: 0 }}
              exit={{ rotateX: 90 }}
              transition={{ duration: 0.3 }}
            >
              {String(value).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
      <span className="text-xs text-muted-foreground mt-1 block">{label}</span>
    </div>
  );
}

// ============================================
// 🎯 OFFER BANNER WITH COUNTDOWN
// ============================================

interface OfferBannerProps {
  title: string;
  description?: string;
  targetDate: Date | string;
  ctaText?: string;
  onCtaClick?: () => void;
  discount?: string;
  className?: string;
}

export function OfferBanner({
  title,
  description,
  targetDate,
  ctaText = "Jetzt sichern",
  onCtaClick,
  discount,
  className = "",
}: OfferBannerProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "200% 200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative flex flex-col md:flex-row items-center gap-6">
        {/* Discount Badge */}
        {discount && (
          <motion.div
            className="flex-shrink-0 bg-white text-purple-600 rounded-full px-4 py-2 font-bold text-lg shadow-xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {discount}
          </motion.div>
        )}

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
          {description && <p className="text-white/80">{description}</p>}
        </div>

        {/* Countdown */}
        <div className="flex-shrink-0">
          <CountdownTimer
            targetDate={targetDate}
            variant="compact"
            showDays={false}
            className="text-white text-xl"
          />
        </div>

        {/* CTA */}
        {onCtaClick && (
          <motion.button
            onClick={onCtaClick}
            className="flex-shrink-0 bg-white text-purple-600 px-6 py-3 rounded-xl font-bold shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {ctaText} →
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

