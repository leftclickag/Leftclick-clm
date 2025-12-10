"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ============================================
// 🚀 STEP TRANSITION WRAPPER
// ============================================

interface StepTransitionProps {
  children: ReactNode;
  step: number;
  direction?: "forward" | "backward";
}

export function StepTransition({ children, step, direction = "forward" }: StepTransitionProps) {
  const variants = {
    enter: (dir: string) => ({
      x: dir === "forward" ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: string) => ({
      x: dir === "forward" ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={step}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// 📦 STAGGER CONTAINER
// ============================================

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = "",
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 🌟 SPOTLIGHT EFFECT
// ============================================

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function Spotlight({
  children,
  className = "",
  spotlightColor = "rgba(147, 51, 234, 0.15)",
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// 🔄 MORPH NUMBER
// ============================================

interface MorphNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function MorphNumber({
  value,
  className = "",
  prefix = "",
  suffix = "",
}: MorphNumberProps) {
  const digits = String(value).split("");

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {prefix && <span>{prefix}</span>}
      {digits.map((digit, index) => (
        <span key={index} className="relative inline-block overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={digit}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="inline-block"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

// ============================================
// 💎 FLOATING ELEMENTS
// ============================================

interface FloatingElementProps {
  children: ReactNode;
  duration?: number;
  distance?: number;
  delay?: number;
  className?: string;
}

export function FloatingElement({
  children,
  duration = 3,
  distance = 10,
  delay = 0,
  className = "",
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ⚡ PULSE GLOW
// ============================================

interface PulseGlowProps {
  children: ReactNode;
  color?: string;
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function PulseGlow({
  children,
  color = "#6366F1",
  intensity = "medium",
  className = "",
}: PulseGlowProps) {
  const glowSizes = {
    low: ["0 0 10px", "0 0 20px"],
    medium: ["0 0 20px", "0 0 40px"],
    high: ["0 0 30px", "0 0 60px"],
  };

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        boxShadow: [
          `${glowSizes[intensity][0]} ${color}40`,
          `${glowSizes[intensity][1]} ${color}60`,
          `${glowSizes[intensity][0]} ${color}40`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 🎭 REVEAL TEXT
// ============================================

interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  variant?: "letter" | "word" | "line";
}

export function RevealText({
  text,
  className = "",
  delay = 0,
  variant = "word",
}: RevealTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const elements =
    variant === "letter"
      ? text.split("")
      : variant === "word"
      ? text.split(" ")
      : [text];

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((element, i) => (
        <motion.span
          key={i}
          className="inline-block overflow-hidden"
          style={{ marginRight: variant === "letter" ? 0 : "0.25em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : { y: "100%" }}
            transition={{
              duration: 0.5,
              delay: delay + i * 0.05,
              ease: [0.33, 1, 0.68, 1],
            }}
          >
            {element}
            {variant === "letter" && element === " " ? "\u00A0" : ""}
          </motion.span>
        </motion.span>
      ))}
    </span>
  );
}

// ============================================
// 🎪 ATTENTION SEEKER
// ============================================

interface AttentionSeekerProps {
  children: ReactNode;
  animation?:
    | "bounce"
    | "shake"
    | "wobble"
    | "pulse"
    | "flash"
    | "rubberBand"
    | "heartBeat"
    | "jello";
  trigger?: "hover" | "click" | "always" | "inView";
  className?: string;
}

export function AttentionSeeker({
  children,
  animation = "bounce",
  trigger = "hover",
  className = "",
}: AttentionSeekerProps) {
  const [isActive, setIsActive] = useState(trigger === "always");
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (trigger === "inView" && isInView) {
      setIsActive(true);
    }
  }, [trigger, isInView]);

  const animations = {
    bounce: {
      y: [0, -30, 0, -15, 0, -5, 0],
      transition: { duration: 1 },
    },
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 },
    },
    wobble: {
      rotate: [0, -5, 5, -5, 5, -2.5, 2.5, 0],
      x: [0, -25, 20, -15, 10, -5, 0],
      transition: { duration: 1 },
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 },
    },
    flash: {
      opacity: [1, 0, 1, 0, 1],
      transition: { duration: 1 },
    },
    rubberBand: {
      scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
      scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
      transition: { duration: 1 },
    },
    heartBeat: {
      scale: [1, 1.3, 1, 1.3, 1],
      transition: { duration: 1.3 },
    },
    jello: {
      skewX: [0, -12.5, 6.25, -3.125, 1.5625, -0.78125, 0.390625, -0.1953125, 0],
      skewY: [0, -12.5, 6.25, -3.125, 1.5625, -0.78125, 0.390625, -0.1953125, 0],
      transition: { duration: 1 },
    },
  };

  const handleHover = () => {
    if (trigger === "hover") setIsActive(true);
  };

  const handleClick = () => {
    if (trigger === "click") setIsActive(true);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onHoverStart={handleHover}
      onClick={handleClick}
      animate={isActive ? animations[animation] : {}}
      onAnimationComplete={() => {
        if (trigger !== "always") setIsActive(false);
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 🌈 GRADIENT BORDER
// ============================================

interface GradientBorderProps {
  children: ReactNode;
  colors?: string[];
  borderWidth?: number;
  animated?: boolean;
  className?: string;
}

export function GradientBorder({
  children,
  colors = ["#6366F1", "#8B5CF6", "#EC4899", "#22D3EE"],
  borderWidth = 2,
  animated = true,
  className = "",
}: GradientBorderProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-inherit"
        style={{
          padding: borderWidth,
          background: `linear-gradient(90deg, ${colors.join(", ")})`,
          backgroundSize: animated ? "200% 100%" : "100% 100%",
          borderRadius: "inherit",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        animate={
          animated
            ? {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// ============================================
// ⏳ SKELETON LOADER
// ============================================

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  className?: string;
  animate?: boolean;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  variant = "text",
  className = "",
  animate = true,
}: SkeletonProps) {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      animate={
        animate
          ? {
              opacity: [0.5, 1, 0.5],
            }
          : {}
      }
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// ============================================
// 🎯 FOCUS RING
// ============================================

interface FocusRingProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function FocusRing({
  children,
  color = "#6366F1",
  className = "",
}: FocusRingProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              boxShadow: `0 0 0 3px ${color}40`,
              borderRadius: "inherit",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

