"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import confetti from "canvas-confetti";

// ============================================
// 🎆 EPIC CELEBRATION EFFECTS
// ============================================

interface CelebrationConfig {
  type: "confetti" | "fireworks" | "stars" | "emoji" | "snow" | "hearts" | "money" | "epic";
  duration?: number;
  intensity?: "low" | "medium" | "high" | "insane";
  colors?: string[];
  emojis?: string[];
  sound?: boolean;
}

// Sound effects URLs (use free sounds or generate)
const SOUNDS = {
  success: "/sounds/success.mp3",
  confetti: "/sounds/confetti.mp3",
  chime: "/sounds/chime.mp3",
  firework: "/sounds/firework.mp3",
};

export function useCelebration() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((soundKey: keyof typeof SOUNDS) => {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(SOUNDS[soundKey]);
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore autoplay restrictions
    } catch {}
  }, []);

  const celebrate = useCallback(
    (config: CelebrationConfig = { type: "confetti" }) => {
      const {
        type,
        duration = 3000,
        intensity = "medium",
        colors = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#22D3EE"],
        emojis = ["🎉", "🎊", "⭐", "✨", "🔥", "💯"],
        sound = true,
      } = config;

      const particleCount = {
        low: 50,
        medium: 100,
        high: 200,
        insane: 500,
      }[intensity];

      if (sound) playSound("success");

      switch (type) {
        case "confetti":
          fireConfetti(colors, particleCount);
          break;
        case "fireworks":
          fireFireworks(colors, duration);
          break;
        case "stars":
          fireStars(colors, particleCount);
          break;
        case "emoji":
          fireEmojis(emojis, particleCount);
          break;
        case "snow":
          fireSnow(duration);
          break;
        case "hearts":
          fireHearts(duration);
          break;
        case "money":
          fireMoney(duration);
          break;
        case "epic":
          fireEpicCelebration(colors, emojis, duration);
          break;
      }
    },
    [playSound]
  );

  return { celebrate };
}

// Classic confetti burst
function fireConfetti(colors: string[], particleCount: number) {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors,
  };

  // Center burst
  confetti({
    ...defaults,
    particleCount,
    origin: { x: 0.5, y: 0.5 },
  });

  // Side cannons
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: particleCount / 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
    });
    confetti({
      ...defaults,
      particleCount: particleCount / 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
    });
  }, 100);

  // Top shower
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: particleCount / 2,
      angle: 270,
      spread: 120,
      origin: { x: 0.5, y: 0 },
      gravity: 1.2,
    });
  }, 200);
}

// Fireworks effect
function fireFireworks(colors: string[], duration: number) {
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 45, spread: 360, ticks: 60, zIndex: 9999, colors };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 100 * (timeLeft / duration);
    
    // Random firework positions
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
    });
  }, 200);
}

// Starfield effect
function fireStars(colors: string[], particleCount: number) {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 20,
    colors,
    shapes: ["star"] as confetti.Shape[],
  };

  confetti({
    ...defaults,
    particleCount,
    scalar: 1.2,
  });

  confetti({
    ...defaults,
    particleCount: particleCount / 2,
    scalar: 0.75,
  });

  confetti({
    ...defaults,
    particleCount: particleCount / 3,
    scalar: 2,
  });
}

// Emoji rain
function fireEmojis(emojis: string[], particleCount: number) {
  const scalar = 2;
  const shapes = emojis.map((emoji) => confetti.shapeFromText({ text: emoji, scalar }));

  const defaults = {
    spread: 180,
    ticks: 200,
    gravity: 0.8,
    decay: 0.96,
    startVelocity: 25,
    shapes,
    scalar,
  };

  // Top shower
  confetti({
    ...defaults,
    particleCount,
    origin: { x: 0.5, y: 0 },
  });

  // Side bursts
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: particleCount / 3,
      origin: { x: 0.2, y: 0.6 },
      angle: 60,
    });
    confetti({
      ...defaults,
      particleCount: particleCount / 3,
      origin: { x: 0.8, y: 0.6 },
      angle: 120,
    });
  }, 300);
}

// Snow effect
function fireSnow(duration: number) {
  const animationEnd = Date.now() + duration;
  let skew = 1;

  const frame = () => {
    const timeLeft = animationEnd - Date.now();
    const ticks = Math.max(200, 500 * (timeLeft / duration));
    skew = Math.max(0.8, skew - 0.001);

    confetti({
      particleCount: 1,
      startVelocity: 0,
      ticks,
      gravity: 0.5,
      origin: {
        x: Math.random(),
        y: Math.random() * skew - 0.2,
      },
      colors: ["#ffffff", "#E0E7FF", "#C7D2FE"],
      shapes: ["circle"],
      scalar: Math.random() * 0.5 + 0.5,
      drift: Math.random() - 0.5,
    });

    if (timeLeft > 0) requestAnimationFrame(frame);
  };

  frame();
}

// Hearts effect
function fireHearts(duration: number) {
  const heart = confetti.shapeFromText({ text: "❤️", scalar: 2 });
  const animationEnd = Date.now() + duration;

  const frame = () => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return;

    confetti({
      particleCount: 2,
      angle: 90 + Math.random() * 30 - 15,
      spread: 45,
      origin: { x: Math.random(), y: 1 },
      shapes: [heart],
      scalar: 2,
      gravity: 0.6,
      drift: Math.random() - 0.5,
      ticks: 200,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

// Money rain 💰
function fireMoney(duration: number) {
  const money = confetti.shapeFromText({ text: "💰", scalar: 2 });
  const bill = confetti.shapeFromText({ text: "💵", scalar: 2 });
  const animationEnd = Date.now() + duration;

  const frame = () => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return;

    confetti({
      particleCount: 3,
      angle: 270,
      spread: 180,
      origin: { x: Math.random(), y: -0.1 },
      shapes: [money, bill],
      scalar: 2,
      gravity: 0.4,
      drift: Math.random() * 2 - 1,
      ticks: 300,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

// EPIC MEGA CELEBRATION! 🔥
function fireEpicCelebration(colors: string[], emojis: string[], duration: number) {
  // Phase 1: Center explosion
  fireConfetti(colors, 200);

  // Phase 2: Fireworks
  setTimeout(() => fireFireworks(colors, duration / 2), 500);

  // Phase 3: Star shower
  setTimeout(() => fireStars(colors, 150), 1000);

  // Phase 4: Emoji rain
  setTimeout(() => fireEmojis(emojis, 100), 1500);

  // Phase 5: Final burst
  setTimeout(() => {
    const end = Date.now() + 1000;
    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      
      confetti({
        particleCount: 100,
        spread: 360,
        startVelocity: 45,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors,
      });
    }, 100);
  }, 2000);
}

// ============================================
// 🎯 SUCCESS OVERLAY COMPONENT
// ============================================

interface SuccessOverlayProps {
  show: boolean;
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
  variant?: "minimal" | "standard" | "epic";
  celebrationType?: CelebrationConfig["type"];
}

export function SuccessOverlay({
  show,
  onComplete,
  title = "🎉 Geschafft!",
  subtitle = "Du bist der Hammer!",
  variant = "standard",
  celebrationType = "confetti",
}: SuccessOverlayProps) {
  const { celebrate } = useCelebration();
  const [visible, setVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setAnimationPhase(1);

      // Trigger celebration
      setTimeout(() => {
        celebrate({
          type: variant === "epic" ? "epic" : celebrationType,
          intensity: variant === "epic" ? "insane" : "high",
        });
      }, 300);

      // Animation phases
      setTimeout(() => setAnimationPhase(2), 500);
      setTimeout(() => setAnimationPhase(3), 1000);

      // Auto-dismiss
      if (variant !== "epic") {
        setTimeout(() => {
          setAnimationPhase(0);
          setTimeout(() => {
            setVisible(false);
            onComplete?.();
          }, 500);
        }, 3000);
      }
    }
  }, [show, celebrate, variant, celebrationType, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99998] flex items-center justify-center transition-all duration-500 ${
        animationPhase > 0 ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-500 ${
          animationPhase > 0 ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Content */}
      <div
        className={`relative text-center transition-all duration-700 ${
          animationPhase >= 2
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-50 opacity-0 translate-y-10"
        }`}
      >
        {/* Glow ring */}
        <div className="absolute inset-0 -m-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-20 blur-3xl animate-pulse" />

        {/* Success icon */}
        <div
          className={`relative mb-6 transition-all duration-500 delay-300 ${
            animationPhase >= 3 ? "scale-100" : "scale-0"
          }`}
        >
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
            <svg
              className="h-16 w-16 text-white animate-success-check"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                className="animate-draw-check"
              />
            </svg>
          </div>

          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-ping" />
          <div className="absolute inset-0 -m-2 rounded-full border-2 border-green-400/30 animate-ping animation-delay-200" />
        </div>

        {/* Text */}
        <h2
          className={`text-5xl font-black text-white mb-4 transition-all duration-500 delay-500 ${
            animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            textShadow: "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(147,51,234,0.5)",
          }}
        >
          {title}
        </h2>

        <p
          className={`text-xl text-white/80 transition-all duration-500 delay-700 ${
            animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {subtitle}
        </p>

        {/* Continue button for epic variant */}
        {variant === "epic" && animationPhase >= 3 && (
          <button
            onClick={() => {
              setAnimationPhase(0);
              setTimeout(() => {
                setVisible(false);
                onComplete?.();
              }, 500);
            }}
            className="mt-8 px-8 py-3 bg-white text-gray-900 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform animate-fade-in animation-delay-1000"
          >
            Weiter →
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// 💫 PARTICLE BACKGROUND
// ============================================

interface ParticleBackgroundProps {
  variant?: "stars" | "bubbles" | "fireflies" | "snow" | "matrix";
  density?: number;
  color?: string;
  className?: string;
}

export function ParticleBackground({
  variant = "stars",
  density = 50,
  color = "#6366F1",
  className = "",
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      opacitySpeed: number;
      hue?: number;
      char?: string;
    }

    const particles: Particle[] = [];

    // Initialize particles based on variant
    for (let i = 0; i < density; i++) {
      const particle: Particle = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: variant === "snow" ? Math.random() * 1 + 0.5 : (Math.random() - 0.5) * 0.5,
        opacity: Math.random(),
        opacitySpeed: Math.random() * 0.02 + 0.005,
      };

      if (variant === "fireflies") {
        particle.hue = Math.random() * 60 + 40; // Yellow-green hue
      }

      if (variant === "matrix") {
        particle.char = String.fromCharCode(0x30a0 + Math.random() * 96);
        particle.speedY = Math.random() * 3 + 1;
        particle.opacity = Math.random() * 0.5 + 0.5;
      }

      particles.push(particle);
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Update opacity (twinkle effect)
        if (variant !== "matrix") {
          p.opacity += p.opacitySpeed;
          if (p.opacity > 1 || p.opacity < 0.2) {
            p.opacitySpeed *= -1;
          }
        }

        // Draw based on variant
        switch (variant) {
          case "stars":
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
            ctx.fill();
            // Star glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.2})`;
            ctx.fill();
            break;

          case "bubbles":
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.strokeStyle = `${color}${Math.floor(p.opacity * 99)
              .toString()
              .padStart(2, "0")}`;
            ctx.lineWidth = 1;
            ctx.stroke();
            break;

          case "fireflies":
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
            gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.opacity})`);
            gradient.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            break;

          case "snow":
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
            ctx.fill();
            break;

          case "matrix":
            ctx.font = `${p.size * 5}px monospace`;
            ctx.fillStyle = `rgba(0, 255, 65, ${p.opacity})`;
            ctx.fillText(p.char!, p.x, p.y);
            // Random character change
            if (Math.random() < 0.01) {
              p.char = String.fromCharCode(0x30a0 + Math.random() * 96);
            }
            break;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [variant, density, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  );
}

