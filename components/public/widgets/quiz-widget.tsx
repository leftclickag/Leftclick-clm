"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tracker } from "@/lib/tracking/tracker";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { LeadMagnet, FlowStep } from "@/types/lead-magnet";
import { CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";

interface QuizWidgetProps {
  leadMagnet: LeadMagnet;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect?: boolean;
    points?: number;
  }[];
  explanation?: string;
}

export function QuizWidget({ leadMagnet }: QuizWidgetProps) {
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSteps() {
      const supabase = createClient();
      const { data } = await supabase
        .from("flow_steps")
        .select("*")
        .eq("lead_magnet_id", leadMagnet.id)
        .order("step_number", { ascending: true });

      if (data && data.length > 0) {
        setSteps(data);
        // Tracking: Quiz gestartet
        await tracker.trackEvent("start", leadMagnet.id);
      }
      setLoading(false);
    }
    loadSteps();
  }, [leadMagnet.id]);

  // Berechne Gesamtpunktzahl beim Laden
  useEffect(() => {
    let total = 0;
    steps.forEach((step) => {
      const questions = step.config?.questions || [];
      questions.forEach((q: QuizQuestion) => {
        const maxPoints = Math.max(
          ...q.options.map((o) => o.points || (o.isCorrect ? 1 : 0))
        );
        total += maxPoints;
      });
    });
    setTotalPoints(total);
  }, [steps]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleConfirm = async () => {
    if (!selectedOption) return;

    const step = steps[currentStep];
    const questions = step.config?.questions || [];
    const question = questions[0] as QuizQuestion; // Ein Frage pro Step

    // Finde die gewählte Option
    const selectedOpt = question.options.find((o) => o.id === selectedOption);
    const isCorrect = selectedOpt?.isCorrect || false;
    const points = selectedOpt?.points || (isCorrect ? 1 : 0);

    // Speichere Antwort
    setAnswers((prev) => ({
      ...prev,
      [question.id]: selectedOption,
    }));

    // Aktualisiere Score
    setScore((prev) => prev + points);

    // Zeige Ergebnis
    setShowResult(true);

    // Tracking: Step abgeschlossen
    await tracker.trackEvent("step_complete", leadMagnet.id, {
      step_id: step.id,
      question_id: question.id,
      answer: selectedOption,
      is_correct: isCorrect,
      points,
    });
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const threshold = leadMagnet.config?.passThreshold || 70;

    // Tracking: Quiz abgeschlossen
    await tracker.trackEvent("conversion", leadMagnet.id, {
      score,
      totalPoints,
      percentage,
      threshold,
      passed: percentage >= threshold,
    });

    // Status auf completed setzen
    await tracker.updateSubmissionStatus("completed", {
      score,
      totalPoints,
      percentage,
      answers,
      passed: percentage >= threshold,
    });

    // Trigger API-Push an externe Systeme
    const submissionId = tracker.getSubmissionId();
    if (submissionId) {
      const { triggerLeadPush } = await import("@/lib/api-integration/trigger-push");
      triggerLeadPush(submissionId, "lead.completed");
    }

    setCompleted(true);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
    tracker.clearSession();
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Keine Steps gefunden
  if (steps.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <Card className="shadow-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Keine Quiz-Fragen gefunden.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed State
  if (completed) {
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const threshold = leadMagnet.config?.passThreshold || 70;
    const passed = percentage >= threshold;

    return (
      <div className="container mx-auto max-w-2xl p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl overflow-hidden">
            <div className={`h-2 ${passed ? "bg-green-500" : "bg-amber-500"}`} />
            <CardHeader className="text-center pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    passed
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-amber-100 dark:bg-amber-900/30"
                  }`}
                >
                  <Trophy
                    className={`h-10 w-10 ${
                      passed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                    }`}
                  />
                </div>
              </motion.div>
              <CardTitle className="text-2xl">
                {passed
                  ? leadMagnet.config?.passTitle || "Herzlichen Glückwunsch!"
                  : leadMagnet.config?.failTitle || "Quiz abgeschlossen"}
              </CardTitle>
              <CardDescription>
                {passed
                  ? leadMagnet.config?.passSubtitle || "Sie haben das Quiz bestanden!"
                  : leadMagnet.config?.failSubtitle || "Versuchen Sie es erneut!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Anzeige */}
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl font-bold mb-2"
                >
                  {Math.round(percentage)}%
                </motion.div>
                <p className="text-muted-foreground">
                  {score} von {totalPoints} Punkten erreicht
                </p>
              </div>

              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      passed ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                </div>
                {/* Threshold Marker */}
                <div
                  className="absolute top-1 h-4 w-0.5 bg-foreground/50"
                  style={{ left: `${threshold}%` }}
                />
              </div>

              {/* Nachricht */}
              <div
                className={`p-4 rounded-lg ${
                  passed
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                }`}
              >
                <p className="text-center">
                  {passed
                    ? leadMagnet.config?.passMessage ||
                      "Ausgezeichnet! Sie haben das Quiz mit Bravour bestanden."
                    : leadMagnet.config?.failMessage ||
                      "Sie haben das Quiz nicht bestanden. Versuchen Sie es erneut!"}
                </p>
              </div>

              {/* Restart Button */}
              {!passed && leadMagnet.config?.allowRetry !== false && (
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Quiz wiederholen
                </Button>
              )}

              {/* CTA Button */}
              {passed && leadMagnet.config?.ctaUrl && (
                <Button
                  asChild
                  className="w-full"
                  size="lg"
                >
                  <a href={leadMagnet.config.ctaUrl}>
                    {leadMagnet.config.ctaText || "Weiter"}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Quiz Fragen
  const step = steps[currentStep];
  const questions = step.config?.questions || [];
  const question = questions[0] as QuizQuestion;
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!question) {
    return <div>Keine Frage gefunden</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="h-2 bg-secondary">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">
                  Frage {currentStep + 1} von {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {score} Punkte
                </span>
              </div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
              {step.description && (
                <CardDescription>{step.description}</CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Frage */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-lg font-medium">{question.text}</p>
              </div>

              {/* Optionen */}
              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const isCorrect = option.isCorrect;
                  const showCorrectness = showResult;

                  let optionClass =
                    "p-4 rounded-lg border-2 transition-all cursor-pointer ";

                  if (showCorrectness) {
                    if (isCorrect) {
                      optionClass +=
                        "border-green-500 bg-green-50 dark:bg-green-900/20";
                    } else if (isSelected && !isCorrect) {
                      optionClass +=
                        "border-red-500 bg-red-50 dark:bg-red-900/20";
                    } else {
                      optionClass += "border-border opacity-50";
                    }
                  } else {
                    optionClass += isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-accent";
                  }

                  return (
                    <motion.div
                      key={option.id}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                      className={optionClass}
                      onClick={() => !showResult && handleSelectOption(option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.text}</span>
                        {showCorrectness && (
                          <span>
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : isSelected ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : null}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Erklärung */}
              {showResult && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <p className="text-sm">
                    <strong>Erklärung:</strong> {question.explanation}
                  </p>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="pt-4">
                {!showResult ? (
                  <Button
                    onClick={handleConfirm}
                    className="w-full"
                    size="lg"
                    disabled={!selectedOption}
                  >
                    Antwort bestätigen
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="w-full" size="lg">
                    {currentStep < steps.length - 1
                      ? "Nächste Frage"
                      : "Quiz abschließen"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

