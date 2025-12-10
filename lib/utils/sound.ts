/**
 * Sound Effect Utilities
 * Play sounds for UI interactions
 */

type SoundEffect =
  | "success"
  | "error"
  | "click"
  | "pop"
  | "whoosh"
  | "chime"
  | "coin"
  | "levelUp"
  | "notification";

interface SoundConfig {
  volume?: number;
  playbackRate?: number;
}

// Sound effect URLs
const SOUND_URLS: Record<SoundEffect, string> = {
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  click: "/sounds/click.mp3",
  pop: "/sounds/pop.mp3",
  whoosh: "/sounds/whoosh.mp3",
  chime: "/sounds/chime.mp3",
  coin: "/sounds/coin.mp3",
  levelUp: "/sounds/level-up.mp3",
  notification: "/sounds/notification.mp3",
};

// Audio cache
const audioCache: Map<string, HTMLAudioElement> = new Map();

// User preference
let soundEnabled = true;

/**
 * Check if Web Audio is supported
 */
export function supportsSounds(): boolean {
  return typeof window !== "undefined" && "Audio" in window;
}

/**
 * Enable/disable sounds globally
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("clm_sounds_enabled", String(enabled));
  }
}

/**
 * Check if sounds are enabled
 */
export function isSoundEnabled(): boolean {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("clm_sounds_enabled");
    if (stored !== null) {
      return stored === "true";
    }
  }
  return soundEnabled;
}

/**
 * Preload a sound for faster playback
 */
export function preloadSound(effect: SoundEffect): void {
  if (!supportsSounds()) return;

  const url = SOUND_URLS[effect];
  if (!audioCache.has(url)) {
    const audio = new Audio(url);
    audio.preload = "auto";
    audioCache.set(url, audio);
  }
}

/**
 * Preload all sounds
 */
export function preloadAllSounds(): void {
  Object.keys(SOUND_URLS).forEach((effect) => {
    preloadSound(effect as SoundEffect);
  });
}

/**
 * Play a sound effect
 */
export async function playSound(
  effect: SoundEffect,
  config: SoundConfig = {}
): Promise<void> {
  if (!supportsSounds() || !isSoundEnabled()) return;

  const { volume = 0.3, playbackRate = 1 } = config;
  const url = SOUND_URLS[effect];

  try {
    let audio = audioCache.get(url);

    if (!audio) {
      audio = new Audio(url);
      audioCache.set(url, audio);
    }

    // Clone to allow multiple simultaneous plays
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = volume;
    clone.playbackRate = playbackRate;

    await clone.play();
  } catch (e) {
    // Silently fail - browser might block autoplay
    console.debug("Sound playback failed:", e);
  }
}

/**
 * Play a success sound with optional haptic
 */
export async function playSuccessSound(
  config: SoundConfig & { haptic?: boolean } = {}
): Promise<void> {
  const { haptic: useHaptic = true, ...soundConfig } = config;

  await playSound("success", soundConfig);

  if (useHaptic && typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([50, 50, 100]);
  }
}

/**
 * Play an error sound with optional haptic
 */
export async function playErrorSound(
  config: SoundConfig & { haptic?: boolean } = {}
): Promise<void> {
  const { haptic: useHaptic = true, ...soundConfig } = config;

  await playSound("error", soundConfig);

  if (useHaptic && typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
}

/**
 * React hook for sound effects
 */
export function useSounds() {
  return {
    supported: supportsSounds(),
    enabled: isSoundEnabled(),
    setEnabled: setSoundEnabled,
    play: playSound,
    success: playSuccessSound,
    error: playErrorSound,
    click: () => playSound("click", { volume: 0.2 }),
    pop: () => playSound("pop", { volume: 0.25 }),
    whoosh: () => playSound("whoosh", { volume: 0.2 }),
    chime: () => playSound("chime", { volume: 0.3 }),
    coin: () => playSound("coin", { volume: 0.25 }),
    levelUp: () => playSound("levelUp", { volume: 0.35 }),
    notification: () => playSound("notification", { volume: 0.3 }),
    preload: preloadSound,
    preloadAll: preloadAllSounds,
  };
}

/**
 * Generate a simple beep using Web Audio API
 */
export function beep(
  frequency: number = 440,
  duration: number = 100,
  volume: number = 0.3
): void {
  if (typeof window === "undefined" || !isSoundEnabled()) return;

  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration / 1000
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    // Silently fail
  }
}

/**
 * Play a "level up" melody
 */
export function playLevelUpMelody(): void {
  if (!isSoundEnabled()) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => beep(freq, 150, 0.2), i * 100);
  });
}

/**
 * Play a "success" chord
 */
export function playSuccessChord(): void {
  if (!isSoundEnabled()) return;

  // C major chord
  beep(261.63, 300, 0.15); // C4
  beep(329.63, 300, 0.15); // E4
  beep(392.0, 300, 0.15); // G4
}

/**
 * Play an "error" buzz
 */
export function playErrorBuzz(): void {
  if (!isSoundEnabled()) return;

  beep(150, 100, 0.3);
  setTimeout(() => beep(100, 150, 0.3), 120);
}

