# 🎆 Spicy Animations & Effects Guide

Diese Dokumentation zeigt alle verfügbaren Animationen und Effekte für das LeftClick CLM System.

## Installation

Die Effekte benötigen `framer-motion` und `canvas-confetti`:

```bash
npm install framer-motion canvas-confetti
```

---

## 🎉 Celebration Effects

### `useCelebration()` Hook

Trigger verschiedene Feier-Animationen.

```tsx
import { useCelebration } from "@/components/effects";

function MyComponent() {
  const { celebrate } = useCelebration();

  return (
    <button onClick={() => celebrate({ type: "epic", intensity: "insane" })}>
      🎉 Party!
    </button>
  );
}
```

#### Celebration Types:

| Type | Beschreibung |
|------|--------------|
| `confetti` | Klassischer Konfetti-Regen |
| `fireworks` | Feuerwerk-Effekt |
| `stars` | Stern-Explosion |
| `emoji` | Emoji-Regen (anpassbar) |
| `snow` | Schneefall |
| `hearts` | Herzen aufsteigend |
| `money` | Geldregen 💰 |
| `epic` | ALLES ZUSAMMEN! |

#### Intensity Levels:
- `low` - Dezent
- `medium` - Normal
- `high` - Party
- `insane` - MEGA PARTY! 🔥

---

### `SuccessOverlay`

Vollbild Success-Animation.

```tsx
import { SuccessOverlay } from "@/components/effects";

<SuccessOverlay
  show={isComplete}
  title="🎉 Geschafft!"
  subtitle="Du bist der Beste!"
  variant="epic" // "minimal" | "standard" | "epic"
  onComplete={() => setIsComplete(false)}
/>
```

---

### `EpicCompletion`

Die ULTIMATIVE Completion-Screen Komponente!

```tsx
import { EpicCompletion } from "@/components/public/epic-completion";

<EpicCompletion
  show={isComplete}
  data={{
    score: 95,
    maxScore: 100,
    timeSpent: 142, // Sekunden
    percentile: 15, // Top 15%
    achievements: [
      { name: "Speed Runner", icon: "⚡", color: "#FFD700" },
      { name: "Perfektionist", icon: "🎯", color: "#10B981" },
    ],
  }}
  theme="rainbow" // "default" | "gold" | "purple" | "green" | "rainbow"
  onDownloadPdf={() => {}}
  onShare={() => {}}
  onContinue={() => {}}
/>
```

---

### `ParticleBackground`

Animierter Partikel-Hintergrund.

```tsx
import { ParticleBackground } from "@/components/effects";

<ParticleBackground
  variant="fireflies" // "stars" | "bubbles" | "fireflies" | "snow" | "matrix"
  density={50}
  color="#6366F1"
/>
```

---

## ✨ Micro Interactions

### `TiltCard`

3D-Karte die sich zur Maus neigt.

```tsx
import { TiltCard } from "@/components/effects";

<TiltCard intensity={15} glare scale={1.05}>
  <div className="p-8 bg-white rounded-xl">
    Hover mich!
  </div>
</TiltCard>
```

---

### `MagneticButton`

Button der zur Maus gezogen wird.

```tsx
import { MagneticButton } from "@/components/effects";

<MagneticButton
  className="px-6 py-3 bg-indigo-600 text-white rounded-xl"
  onClick={() => {}}
>
  Zieh mich!
</MagneticButton>
```

---

### `Typewriter`

Text mit Schreibmaschinen-Effekt.

```tsx
import { Typewriter } from "@/components/effects";

<Typewriter
  text="Willkommen bei LeftClick CLM!"
  speed={50}
  delay={500}
  cursor
  onComplete={() => console.log("Fertig!")}
/>
```

---

### `AnimatedCounter`

Zahlen mit Animation hochzählen.

```tsx
import { AnimatedCounter } from "@/components/effects";

<AnimatedCounter
  target={1234567}
  duration={2000}
  prefix="€"
  suffix=" gespart"
  decimals={0}
/>
```

---

### `GradientText`

Animierter Farbverlauf auf Text.

```tsx
import { GradientText } from "@/components/effects";

<GradientText
  colors={["#6366F1", "#8B5CF6", "#EC4899", "#22D3EE"]}
  speed={3}
  className="text-4xl font-bold"
>
  Rainbow Text!
</GradientText>
```

---

### `Spinner`

Loading Spinner mit verschiedenen Varianten.

```tsx
import { Spinner } from "@/components/effects";

<Spinner
  size="lg" // "sm" | "md" | "lg" | "xl"
  variant="orbit" // "default" | "dots" | "bars" | "pulse" | "orbit"
  color="#6366F1"
/>
```

---

### `ScrollReveal`

Elemente beim Scrollen einblenden.

```tsx
import { ScrollReveal } from "@/components/effects";

<ScrollReveal
  direction="up" // "up" | "down" | "left" | "right" | "none"
  distance={50}
  delay={0.2}
  duration={0.6}
>
  <div>Ich erscheine beim Scrollen!</div>
</ScrollReveal>
```

---

## 🎬 Advanced Animations

### `StepTransition`

Smooth Übergänge zwischen Steps.

```tsx
import { StepTransition } from "@/components/effects";

<StepTransition step={currentStep} direction="forward">
  <StepContent />
</StepTransition>
```

---

### `StaggerContainer` & `StaggerItem`

Elemente nacheinander einblenden.

```tsx
import { StaggerContainer, StaggerItem } from "@/components/effects";

<StaggerContainer staggerDelay={0.1}>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>
```

---

### `Spotlight`

Spotlight-Effekt der Maus folgt.

```tsx
import { Spotlight } from "@/components/effects";

<Spotlight spotlightColor="rgba(147, 51, 234, 0.15)">
  <div className="p-8 bg-gray-900 rounded-xl">
    Bewege die Maus!
  </div>
</Spotlight>
```

---

### `AttentionSeeker`

Aufmerksamkeits-Animationen.

```tsx
import { AttentionSeeker } from "@/components/effects";

<AttentionSeeker
  animation="heartBeat" // "bounce" | "shake" | "wobble" | "pulse" | "flash" | "rubberBand" | "heartBeat" | "jello"
  trigger="hover" // "hover" | "click" | "always" | "inView"
>
  <button>Klick mich!</button>
</AttentionSeeker>
```

---

### `GradientBorder`

Animierter Gradient-Rahmen.

```tsx
import { GradientBorder } from "@/components/effects";

<GradientBorder
  colors={["#6366F1", "#8B5CF6", "#EC4899", "#22D3EE"]}
  borderWidth={2}
  animated
>
  <div className="p-6 bg-black rounded-xl">
    Cooler Rahmen!
  </div>
</GradientBorder>
```

---

### `FloatingElement`

Schwebende Animation.

```tsx
import { FloatingElement } from "@/components/effects";

<FloatingElement duration={3} distance={15} delay={0}>
  <div className="h-20 w-20 bg-indigo-500 rounded-full" />
</FloatingElement>
```

---

### `PulseGlow`

Pulsierender Glow-Effekt.

```tsx
import { PulseGlow } from "@/components/effects";

<PulseGlow color="#6366F1" intensity="high">
  <button className="px-6 py-3 bg-indigo-600 rounded-xl">
    Glow Button
  </button>
</PulseGlow>
```

---

### `RevealText`

Text Buchstabe für Buchstabe einblenden.

```tsx
import { RevealText } from "@/components/effects";

<RevealText
  text="Dieser Text wird animiert!"
  variant="word" // "letter" | "word" | "line"
  delay={0.5}
/>
```

---

## 🎨 CSS Animation Classes

Zusätzlich gibt es CSS-Klassen in `globals.css`:

```css
/* Attention Seekers */
.animate-wiggle      /* Wackeln */
.animate-pop         /* Pop-Effekt */
.animate-shake-x     /* Horizontal schütteln */
.animate-rubber-band /* Gummiband-Effekt */
.animate-tada        /* Ta-da! */
.animate-heartbeat   /* Herzschlag */
.animate-jello       /* Wackelpudding */

/* Entrance Animations */
.animate-fade-in
.animate-scale-in
.animate-slide-in-left
.animate-slide-in-right
.animate-slide-in-up
.animate-slide-up-bounce
.animate-scale-rotate-in
.animate-blur-in

/* Special Effects */
.animate-glow-text    /* Glühender Text */
.animate-morph        /* Morphende Form */
.animate-burst        /* Burst-Effekt */
.animate-rainbow-border /* Regenbogen-Rahmen */

/* Animation Delays */
.animation-delay-100 bis .animation-delay-1000
```

---

## 🔊 Sound Effects (Optional)

Erstelle einen `/public/sounds/` Ordner mit:
- `success.mp3` - Erfolgs-Sound
- `confetti.mp3` - Konfetti-Sound
- `chime.mp3` - Glocken-Sound

---

## 💡 Best Practices

1. **Performance**: Nutze `will-change` CSS sparsam
2. **Accessibility**: Respektiere `prefers-reduced-motion`
3. **Mobile**: Teste auf Touch-Geräten
4. **Dosierung**: Weniger ist manchmal mehr!

---

## 🎮 Live Demo

Alle Effekte können im Storybook getestet werden:

```bash
npm run storybook
```

---

**Happy Animating! 🚀**

