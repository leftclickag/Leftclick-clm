"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tracker } from "@/lib/tracking/tracker";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { LeadMagnet } from "@/types/lead-magnet";
import type { FlowStep } from "@/types/lead-magnet";

interface ChecklistWidgetProps {
  leadMagnet: LeadMagnet;
}

export function ChecklistWidget({ leadMagnet }: ChecklistWidgetProps) {
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadSteps() {
      const supabase = createClient();
      const { data } = await supabase
        .from("flow_steps")
        .select("*")
        .eq("lead_magnet_id", leadMagnet.id)
        .order("step_number", { ascending: true });

      if (data) {
        setSteps(data);
        await tracker.trackEvent("start", leadMagnet.id);
      }
    }
    loadSteps();
  }, [leadMagnet.id]);

  useEffect(() => {
    // Calculate score
    let total = 0;
    let weight = 0;
    steps.forEach((step) => {
      const questions = step.config?.questions || [];
      questions.forEach((q: any) => {
        weight += q.weight || 0;
        if (answers[q.id]) {
          total += q.weight || 0;
        }
      });
    });
    setScore(total);
    setTotalWeight(weight);
  }, [answers, steps]);

  const handleAnswer = (questionId: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      await tracker.trackEvent("step_complete", leadMagnet.id, {
        step_id: steps[currentStep].id,
      });
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    const percentage = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
    const threshold = leadMagnet.config?.threshold || 70;
    
    await tracker.trackEvent("conversion", leadMagnet.id, {
      score: percentage,
      threshold,
    });
    
    await tracker.updateSubmissionStatus("completed", {
      score: percentage,
      answers,
    });

    setCompleted(true);
  };

  if (completed) {
    const percentage = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
    const threshold = leadMagnet.config?.threshold || 70;
    const belowThreshold = percentage < threshold;

    return (
      <div className="container mx-auto max-w-2xl p-6">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{Math.round(percentage)}%</div>
              <p className="text-muted-foreground">Readiness-Score</p>
            </div>
            {belowThreshold ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-center">
                  {leadMagnet.config?.belowThresholdMessage ||
                    "Sie sind noch nicht vollständig bereit. Wir helfen Ihnen gerne dabei!"}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-center">
                  {leadMagnet.config?.aboveThresholdMessage ||
                    "Gut gemacht! Sie sind bereit für den nächsten Schritt."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (steps.length === 0) {
    return <div>Lädt...</div>;
  }

  const step = steps[currentStep];
  const questions = step.config?.questions || [];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{step.title}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} / {steps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            {step.description && (
              <CardDescription>{step.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q: any) => (
              <div
                key={q.id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <input
                  type="checkbox"
                  id={q.id}
                  checked={answers[q.id] || false}
                  onChange={(e) => handleAnswer(q.id, e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
                <label htmlFor={q.id} className="flex-1 cursor-pointer">
                  {q.text}
                </label>
              </div>
            ))}
            <Button
              onClick={handleNext}
              className="w-full"
              size="lg"
            >
              {currentStep < steps.length - 1 ? "Weiter" : "Abschließen"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

