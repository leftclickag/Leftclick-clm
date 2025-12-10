/**
 * Haptic Feedback Utilities
 * Vibration API for mobile devices
 */

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error" | "warning";

// Vibration patterns in milliseconds
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [50, 50, 100],
  error: [100, 50, 100, 50, 100],
  warning: [30, 50, 30],
};

/**
 * Check if haptic feedback is supported
 */
export function supportsHaptics(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "vibrate" in navigator &&
    typeof navigator.vibrate === "function"
  );
}

/**
 * Trigger haptic feedback
 * @param pattern - The haptic pattern to use
 */
export function haptic(pattern: HapticPattern = "medium"): void {
  if (!supportsHaptics()) return;

  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (e) {
    // Silently fail if vibration is not allowed
  }
}

/**
 * Custom vibration pattern
 * @param pattern - Array of vibration/pause durations in ms
 */
export function customHaptic(pattern: number[]): void {
  if (!supportsHaptics()) return;

  try {
    navigator.vibrate(pattern);
  } catch (e) {
    // Silently fail
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): void {
  if (!supportsHaptics()) return;
  navigator.vibrate(0);
}

/**
 * React hook for haptic feedback
 */
export function useHaptics() {
  const supported = supportsHaptics();

  return {
    supported,
    trigger: haptic,
    custom: customHaptic,
    stop: stopHaptic,
    light: () => haptic("light"),
    medium: () => haptic("medium"),
    heavy: () => haptic("heavy"),
    success: () => haptic("success"),
    error: () => haptic("error"),
    warning: () => haptic("warning"),
  };
}

