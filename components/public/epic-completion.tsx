"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Download, 
  Share2, 
  ChevronRight, 
  Sparkles,
  Star,
  Crown,
  Zap,
  Heart,
  PartyPopper
} from "lucide-react";
import { useCelebration } from "@/components/effects/celebration-effects";
import { AnimatedCounter, GradientText, Typewriter } from "@/components/effects/micro-interactions";
import { Button } from "@/components/ui/button";

// ============================================
// 🎆 EPIC COMPLETION SCREEN
// ============================================

interface CompletionData {
  score?: number;
  maxScore?: number;
  timeSpent?: number; // in seconds
  percentile?: number;
  achievements?: Array<{
    name: string;
    icon: string;
    color: string;
    description?: string;
  }>;
  result?: Record<string, any>;
}

interface EpicCompletionProps {
  show: boolean;
  data?: CompletionData;
  onDownloadPdf?: () => void;
  onShare?: () => void;
  onContinue?: () => void;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  theme?: "default" | "gold" | "purple" | "green" | "rainbow";
}

export function EpicCompletion({
  show,
  data,
  onDownloadPdf,
  onShare,
  onContinue,
  headline = "🎉 Geschafft!",
  subheadline = "Du hast alle Schritte erfolgreich abgeschlossen!",
  ctaText = "Weiter",
  theme = "default",
}: EpicCompletionProps) {
  const { celebrate } = useCelebration();
  const [phase, setPhase] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeColors = {
    default: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#22D3EE" },
    gold: { primary: "#F59E0B", secondary: "#D97706", accent: "#FCD34D" },
    purple: { primary: "#8B5CF6", secondary: "#7C3AED", accent: "#C4B5FD" },
    green: { primary: "#10B981", secondary: "#059669", accent: "#34D399" },
    rainbow: { primary: "#EC4899", secondary: "#8B5CF6", accent: "#22D3EE" },
  };

  const colors = themeColors[theme];

  useEffect(() => {
    if (!show) {
      setPhase(0);
      setShowContent(false);
      return;
    }

    // Phase 1: Background fade in
    setPhase(1);

    // Phase 2: Celebration effects
    setTimeout(() => {
      setPhase(2);
      celebrate({
        type: "epic",
        intensity: "insane",
        colors: [colors.primary, colors.secondary, colors.accent, "#FFD700"],
      });
    }, 300);

    // Phase 3: Content appears
    setTimeout(() => {
      setPhase(3);
      setShowContent(true);
    }, 800);

    // Phase 4: Stats animate
    setTimeout(() => {
      setPhase(4);
    }, 1500);

    // Phase 5: Achievements
    setTimeout(() => {
      setPhase(5);
    }, 2200);

    // Phase 6: CTA
    setTimeout(() => {
      setPhase(6);
    }, 3000);
  }, [show, celebrate, colors]);

  if (!show && phase === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 50%, ${colors.accent}20 100%)`,
            }}
          />

          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
              style={{ background: colors.primary }}
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
              style={{ background: colors.accent }}
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            />
          </div>

          {/* Backdrop blur */}
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />

          {/* Content Container */}
          <motion.div
            className="relative z-10 max-w-2xl w-full mx-4 text-center"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={showContent ? { scale: 1, opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Success Icon */}
            <motion.div
              className="relative mx-auto mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={phase >= 3 ? { scale: 1, rotate: 0 } : {}}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {/* Glow rings */}
              <motion.div
                className="absolute inset-0 -m-8 rounded-full"
                style={{ background: `${colors.primary}40` }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 -m-4 rounded-full"
                style={{ background: `${colors.primary}30` }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />

              {/* Main icon container */}
              <div
                className="relative h-32 w-32 mx-auto rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  boxShadow: `0 20px 60px ${colors.primary}50`,
                }}
              >
                <Trophy className="h-16 w-16 text-white" />

                {/* Sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${10 + Math.random() * 80}%`,
                      left: `${10 + Math.random() * 80}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                {theme === "rainbow" ? (
                  <GradientText colors={["#EC4899", "#8B5CF6", "#22D3EE", "#10B981"]}>
                    {headline}
                  </GradientText>
                ) : (
                  headline
                )}
              </h1>
              <p className="text-xl text-white/80 mb-8">
                <Typewriter text={subheadline} speed={30} cursor={false} />
              </p>
            </motion.div>

            {/* Stats Grid */}
            {data && (
              <motion.div
                className="grid grid-cols-3 gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 4 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                {data.score !== undefined && (
                  <StatCard
                    icon={<Star className="h-6 w-6" />}
                    value={
                      <AnimatedCounter
                        target={data.score}
                        suffix={data.maxScore ? `/${data.maxScore}` : ""}
                        duration={1500}
                      />
                    }
                    label="Punkte"
                    color={colors.primary}
                    delay={0}
                  />
                )}
                {data.timeSpent !== undefined && (
                  <StatCard
                    icon={<Zap className="h-6 w-6" />}
                    value={formatTime(data.timeSpent)}
                    label="Zeit"
                    color={colors.secondary}
                    delay={0.1}
                  />
                )}
                {data.percentile !== undefined && (
                  <StatCard
                    icon={<Crown className="h-6 w-6" />}
                    value={
                      <>
                        Top{" "}
                        <AnimatedCounter target={100 - data.percentile} suffix="%" duration={1500} />
                      </>
                    }
                    label="Ranking"
                    color={colors.accent}
                    delay={0.2}
                  />
                )}
              </motion.div>
            )}

            {/* Achievements */}
            {data?.achievements && data.achievements.length > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 5 ? { opacity: 1, y: 0 } : {}}
              >
                <p className="text-sm font-medium text-white/60 mb-4 flex items-center justify-center gap-2">
                  <PartyPopper className="h-4 w-4" />
                  Freigeschaltete Achievements
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {data.achievements.map((achievement, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={phase >= 5 ? { scale: 1, rotate: 0 } : {}}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                        delay: i * 0.15,
                      }}
                    >
                      <div
                        className="h-16 w-16 rounded-full flex items-center justify-center text-3xl shadow-lg mb-2"
                        style={{
                          backgroundColor: achievement.color,
                          boxShadow: `0 0 30px ${achievement.color}60`,
                        }}
                      >
                        {achievement.icon}
                      </div>
                      <span className="text-xs font-medium text-white/80">
                        {achievement.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 6 ? { opacity: 1, y: 0 } : {}}
            >
              {onDownloadPdf && (
                <Button
                  onClick={onDownloadPdf}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF herunterladen
                </Button>
              )}
              {onShare && (
                <Button
                  onClick={onShare}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
              )}
              {onContinue && (
                <Button
                  onClick={onContinue}
                  className="bg-white text-gray-900 hover:bg-white/90 font-bold shadow-xl"
                >
                  {ctaText}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </motion.div>

            {/* Floating hearts (optional for "love" theme) */}
            {theme === "rainbow" && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-pink-500"
                    style={{
                      left: `${Math.random() * 100}%`,
                      bottom: "-20px",
                    }}
                    animate={{
                      y: [0, -window.innerHeight - 100],
                      x: [0, Math.random() * 100 - 50],
                      rotate: [0, Math.random() * 360],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    <Heart className="h-6 w-6 fill-current" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  color,
  delay,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
    >
      <div
        className="h-10 w-10 rounded-full mx-auto mb-2 flex items-center justify-center"
        style={{ backgroundColor: `${color}30`, color }}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </motion.div>
  );
}

// ============================================
// 🎯 QUICK SUCCESS TOAST
// ============================================

interface SuccessToastProps {
  show: boolean;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export function SuccessToast({
  show,
  message = "Erfolgreich gespeichert!",
  duration = 3000,
  onClose,
}: SuccessToastProps) {
  const { celebrate } = useCelebration();

  useEffect(() => {
    if (show) {
      celebrate({ type: "confetti", intensity: "low" });
      const timer = setTimeout(() => onClose?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [show, celebrate, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-[99999]"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <motion.div
              className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

