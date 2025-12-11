"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StepEffects } from "@/types/wizard-builder";
import {
  Sparkles,
  Zap,
  Volume2,
  Settings,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface StepEffectsConfigProps {
  effects: StepEffects;
  onChange: (effects: StepEffects) => void;
}

const ENTRY_ANIMATIONS = [
  { value: "none", label: "Keine" },
  { value: "slide", label: "Slide (von rechts)" },
  { value: "fade", label: "Fade (Einblenden)" },
  { value: "scale", label: "Scale (Vergrößern)" },
];

const EXIT_ANIMATIONS = [
  { value: "none", label: "Keine" },
  { value: "slide", label: "Slide (nach links)" },
  { value: "fade", label: "Fade (Ausblenden)" },
  { value: "scale", label: "Scale (Verkleinern)" },
];

export function StepEffectsConfig({
  effects,
  onChange,
}: StepEffectsConfigProps) {
  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          Schritt-Effekte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Eintritts-Animation */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Eintritts-Animation
          </Label>
          <select
            value={effects.entryAnimation || "none"}
            onChange={(e) =>
              onChange({
                ...effects,
                entryAnimation: e.target.value as StepEffects["entryAnimation"],
              })
            }
            className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            {ENTRY_ANIMATIONS.map((anim) => (
              <option key={anim.value} value={anim.value}>
                {anim.label}
              </option>
            ))}
          </select>
        </div>

        {/* Austritts-Animation */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Austritts-Animation
          </Label>
          <select
            value={effects.exitAnimation || "none"}
            onChange={(e) =>
              onChange({
                ...effects,
                exitAnimation: e.target.value as StepEffects["exitAnimation"],
              })
            }
            className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            {EXIT_ANIMATIONS.map((anim) => (
              <option key={anim.value} value={anim.value}>
                {anim.label}
              </option>
            ))}
          </select>
        </div>

        {/* Celebration Options */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="celebration"
              checked={effects.celebration || false}
              onCheckedChange={(checked) =>
                onChange({ ...effects, celebration: checked === true })
              }
            />
            <Label htmlFor="celebration" className="cursor-pointer flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Konfetti bei Abschluss
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="progressCelebration"
              checked={effects.progressCelebration || false}
              onCheckedChange={(checked) =>
                onChange({
                  ...effects,
                  progressCelebration: checked === true,
                })
              }
            />
            <Label htmlFor="progressCelebration" className="cursor-pointer flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              Fortschritts-Celebration
            </Label>
          </div>
        </div>

        {/* Sound Effects */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Volume2 className="h-3 w-3" />
            Sound-Effekt (optional)
          </Label>
          <input
            type="text"
            value={effects.soundEffect || ""}
            onChange={(e) =>
              onChange({ ...effects, soundEffect: e.target.value })
            }
            placeholder="z.B. success.mp3 oder URL"
            className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Dateiname im /public/sounds/ Ordner oder vollständige URL
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

