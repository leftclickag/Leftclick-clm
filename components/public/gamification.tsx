"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Star, Zap, Target, Medal, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

// ============================================
// PROGRESS BAR WITH ANIMATIONS
// ============================================
interface AnimatedProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showPercentage?: boolean;
  showStepCount?: boolean;
  variant?: "default" | "gradient" | "segments" | "dots";
  className?: string;
}

export function AnimatedProgressBar({
  currentStep,
  totalSteps,
  showPercentage = true,
  showStepCount = true,
  variant = "gradient",
  className = "",
}: AnimatedProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Segments variant
  if (variant === "segments") {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex gap-1.5 mb-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                i < currentStep
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : "bg-gray-200"
              }`}
              style={{
                transitionDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
        {showStepCount && (
          <p className="text-xs text-gray-500 text-center">
            Schritt {currentStep} von {totalSteps}
          </p>
        )}
      </div>
    );
  }

  // Dots variant
  if (variant === "dots") {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-center gap-3 mb-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 ${
                i < currentStep
                  ? "h-3 w-3 bg-green-500 scale-110"
                  : i === currentStep
                  ? "h-4 w-4 bg-indigo-500 animate-pulse"
                  : "h-3 w-3 bg-gray-300"
              } rounded-full`}
            />
          ))}
        </div>
        {showStepCount && (
          <p className="text-sm text-gray-600 text-center font-medium">
            {currentStep === totalSteps
              ? "🎉 Fertig!"
              : `Nur noch ${totalSteps - currentStep} ${
                  totalSteps - currentStep === 1 ? "Schritt" : "Schritte"
                }!`}
          </p>
        )}
      </div>
    );
  }

  // Default and gradient variants
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {showStepCount && (
          <span className="text-sm font-medium text-gray-700">
            Schritt {currentStep}/{totalSteps}
          </span>
        )}
        {showPercentage && (
          <span className="text-sm font-bold text-indigo-600">
            {animatedPercentage}%
          </span>
        )}
      </div>
      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            variant === "gradient"
              ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              : "bg-indigo-500"
          }`}
          style={{ width: `${animatedPercentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
      {/* Encouraging message */}
      {percentage >= 75 && percentage < 100 && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Fast geschafft! Du bist auf der Zielgeraden!
        </p>
      )}
    </div>
  );
}

// ============================================
// CONFETTI CELEBRATION
// ============================================
interface ConfettiCelebrationProps {
  trigger: boolean;
  variant?: "default" | "fireworks" | "stars" | "emoji";
}

export function ConfettiCelebration({
  trigger,
  variant = "default",
}: ConfettiCelebrationProps) {
  const triggerConfetti = useCallback(() => {
    switch (variant) {
      case "fireworks":
        // Fireworks effect
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);

          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
          });
        }, 250);
        break;

      case "stars":
        // Star-shaped confetti
        const starDefaults = {
          spread: 360,
          ticks: 100,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
          shapes: ["star"],
          colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
        };

        confetti({
          ...starDefaults,
          particleCount: 50,
          scalar: 1.2,
          shapes: ["star"],
        });

        confetti({
          ...starDefaults,
          particleCount: 25,
          scalar: 0.75,
          shapes: ["circle"],
        });
        break;

      case "emoji":
        // Emoji confetti
        confetti({
          particleCount: 30,
          spread: 100,
          origin: { y: 0.6 },
          shapes: ["circle"],
          colors: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42"],
        });
        break;

      default:
        // Classic confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Side cannons
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
          });
        }, 200);
    }
  }, [variant]);

  useEffect(() => {
    if (trigger) {
      triggerConfetti();
    }
  }, [trigger, triggerConfetti]);

  return null;
}

// ============================================
// ACHIEVEMENT BADGE
// ============================================
interface AchievementBadgeProps {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
}

export function AchievementBadge({
  name,
  description,
  icon = "🏆",
  color = "#FFD700",
  earned = true,
  earnedAt,
  size = "md",
  showAnimation = false,
}: AchievementBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(showAnimation);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  const sizeClasses = {
    sm: "h-12 w-12 text-lg",
    md: "h-16 w-16 text-2xl",
    lg: "h-24 w-24 text-4xl",
  };

  return (
    <div
      className={`flex flex-col items-center gap-2 ${
        isAnimating ? "animate-in zoom-in duration-500" : ""
      }`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg transition-all ${
          earned
            ? "opacity-100"
            : "opacity-40 grayscale"
        } ${isAnimating ? "animate-bounce" : ""}`}
        style={{
          backgroundColor: earned ? color : "#E5E7EB",
          boxShadow: earned ? `0 0 20px ${color}40` : "none",
        }}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className={`font-semibold ${earned ? "text-gray-900" : "text-gray-400"}`}>
          {name}
        </p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        {earnedAt && earned && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Erreicht am {new Date(earnedAt).toLocaleDateString("de-DE")}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPLETION SCREEN
// ============================================
interface CompletionScreenProps {
  headline?: string;
  subheadline?: string;
  achievements?: Array<{
    name: string;
    icon: string;
    color: string;
  }>;
  stats?: {
    timeSpent?: number; // seconds
    score?: number;
    percentile?: number;
  };
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function CompletionScreen({
  headline = "🎉 Gratulation!",
  subheadline = "Du hast es geschafft!",
  achievements = [],
  stats,
  ctaText = "Weiter",
  onCtaClick,
  className = "",
}: CompletionScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} Sekunden`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} Min.`;
  };

  return (
    <div
      className={`text-center py-8 px-4 ${className} ${
        showContent ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "opacity-0"
      }`}
    >
      <ConfettiCelebration trigger={showConfetti} variant="fireworks" />

      {/* Trophy animation */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-orange-500/30 animate-in zoom-in duration-700">
          <Trophy className="h-12 w-12 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">{headline}</h2>
      <p className="text-lg text-gray-600 mb-8">{subheadline}</p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          {stats.timeSpent && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {formatTime(stats.timeSpent)}
              </p>
              <p className="text-xs text-gray-500">Zeit</p>
            </div>
          )}
          {stats.score && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">{stats.score}</p>
              <p className="text-xs text-gray-500">Punkte</p>
            </div>
          )}
          {stats.percentile && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-purple-600">
                Top {100 - stats.percentile}%
              </p>
              <p className="text-xs text-gray-500">Ranking</p>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-4">
            🏅 Verdiente Achievements
          </p>
          <div className="flex justify-center gap-6">
            {achievements.map((achievement, i) => (
              <AchievementBadge
                key={i}
                name={achievement.name}
                icon={achievement.icon}
                color={achievement.color}
                size="sm"
                showAnimation
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {onCtaClick && (
        <button
          onClick={onCtaClick}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
        >
          {ctaText}
          <PartyPopper className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// ============================================
// SCORE DISPLAY
// ============================================
interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  label?: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ScoreDisplay({
  score,
  maxScore,
  label = "Punkte",
  animated = true,
  size = "md",
}: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    const duration = 1000;
    const start = displayScore;
    const diff = score - start;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, animated]);

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  return (
    <div className="text-center">
      <div className={`font-bold ${sizeClasses[size]} text-indigo-600`}>
        {displayScore}
        {maxScore && (
          <span className="text-gray-400 text-lg font-normal">/{maxScore}</span>
        )}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

// Add shimmer animation to global CSS
// Add this to globals.css:
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
// .animate-shimmer {
//   animation: shimmer 2s infinite;
// }

