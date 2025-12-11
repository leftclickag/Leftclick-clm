"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// ============================================
// 🎭 ANIMATED ICONS
// ============================================

interface AnimatedIconProps {
  className?: string;
  color?: string;
  size?: number;
}

// Animated Checkmark
export function AnimatedCheck({ className = "", size = 24 }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Circle */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.5 }}
      />
      {/* Checkmark */}
      <motion.path
        d="M7 12l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
    </motion.svg>
  );
}

// Animated X (Error)
export function AnimatedX({ className = "", size = 24 }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
    </motion.svg>
  );
}

// Animated Warning
export function AnimatedWarning({ className = "", size = 24 }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M12 2L2 22h20L12 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d="M12 9v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.2, delay: 0.6 }}
      />
      <motion.circle
        cx="12"
        cy="17"
        r="1"
        fill="currentColor"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { scale: 1, opacity: 1 },
        }}
        transition={{ duration: 0.2, delay: 0.8 }}
      />
    </motion.svg>
  );
}

// Animated Loader
export function AnimatedLoader({ className = "", size = 24, color = "currentColor" }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="31.4 31.4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
    </motion.svg>
  );
}

// Animated Heart
export function AnimatedHeart({ className = "", size = 24 }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      />
    </motion.svg>
  );
}

// Animated Star
export function AnimatedStar({ className = "", size = 24, filled = false }: AnimatedIconProps & { filled?: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      whileHover={{ scale: 1.2, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      />
    </motion.svg>
  );
}

// Animated Bell (Notification)
export function AnimatedBell({ className = "", size = 24 }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </motion.svg>
  );
}

// Animated Send
export function AnimatedSend({ className = "", size = 24, isActive = false }: AnimatedIconProps & { isActive?: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={isActive ? { x: [0, 5, 0], scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </motion.svg>
  );
}

// Animated Hamburger Menu
export function AnimatedMenu({ isOpen = false, className = "", size = 24 }: AnimatedIconProps & { isOpen?: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <motion.line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 6 : 0,
        }}
        style={{ transformOrigin: "center" }}
      />
      <motion.line
        x1="3"
        y1="12"
        x2="21"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: isOpen ? 0 : 1, x: isOpen ? -20 : 0 }}
      />
      <motion.line
        x1="3"
        y1="18"
        x2="21"
        y2="18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -6 : 0,
        }}
        style={{ transformOrigin: "center" }}
      />
    </motion.svg>
  );
}

// Animated Play/Pause
export function AnimatedPlayPause({ isPlaying = false, className = "", size = 24 }: AnimatedIconProps & { isPlaying?: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {isPlaying ? (
        <>
          <motion.rect
            x="6"
            y="4"
            width="4"
            height="16"
            rx="1"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring" }}
          />
          <motion.rect
            x="14"
            y="4"
            width="4"
            height="16"
            rx="1"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          />
        </>
      ) : (
        <motion.path
          d="M8 5v14l11-7z"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
        />
      )}
    </motion.svg>
  );
}

// Animated Progress Circle
interface ProgressCircleProps extends AnimatedIconProps {
  progress: number; // 0-100
  strokeWidth?: number;
  showValue?: boolean;
}

export function AnimatedProgressCircle({
  progress,
  size = 60,
  strokeWidth = 4,
  className = "",
  showValue = true,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showValue && (
        <motion.span
          className="absolute text-sm font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(progress)}%
        </motion.span>
      )}
    </div>
  );
}

// Animated Sparkle
export function AnimatedSparkle({ className = "", size = 24 }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 15, -15, 0],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5L12 0z" />
    </motion.svg>
  );
}

// Animated Trophy
export function AnimatedTrophy({ className = "", size = 24 }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.path
        d="M4 22h16"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
      <motion.path
        d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
      <motion.path
        d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
      <motion.path
        d="M18 2H6v7a6 6 0 0 0 12 0V2Z"
        fill="currentColor"
        fillOpacity={0.1}
        variants={{
          hidden: { pathLength: 0, fillOpacity: 0 },
          visible: { pathLength: 1, fillOpacity: 0.1 },
        }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
    </motion.svg>
  );
}

