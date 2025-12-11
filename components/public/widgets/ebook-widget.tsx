"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tracker } from "@/lib/tracking/tracker";
import { motion } from "framer-motion";
import type { LeadMagnet } from "@/types/lead-magnet";

interface EbookWidgetProps {
  leadMagnet: LeadMagnet;
}

export function EbookWidget({ leadMagnet }: EbookWidgetProps) {
  const [step, setStep] = useState<"intro" | "form" | "success">("intro");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const config = leadMagnet.config || {};
  const requireContactInfo = config.requireContactInfo !== false;
  const instantDownload = config.instantDownload === true;

  const handleStart = async () => {
    await tracker.trackEvent("start", leadMagnet.id);
    if (instantDownload && !requireContactInfo) {
      setStep("success");
      // Trigger download
    } else {
      setStep("form");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await tracker.trackEvent("conversion", leadMagnet.id, {
      email,
      name,
    });

    // Update submission with contact info
    await tracker.updateSubmissionStatus("completed", {
      email,
      name,
    });

    // Trigger API-Push an externe Systeme
    const submissionId = tracker.getSubmissionId();
    if (submissionId) {
      const { triggerLeadPush } = await import("@/lib/api-integration/trigger-push");
      triggerLeadPush(submissionId, "lead.completed");
    }

    // TODO: Send email or trigger download
    setStep("success");
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-2">
          {step === "intro" && (
            <>
              <CardHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {leadMagnet.title}
                  </CardTitle>
                </motion.div>
                {leadMagnet.description && (
                  <CardDescription className="text-lg">
                    {leadMagnet.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 text-center">
                  <p className="text-muted-foreground">
                    Holen Sie sich jetzt Ihr kostenloses E-Book
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  Jetzt herunterladen
                </Button>
              </CardContent>
            </>
          )}

          {step === "form" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader>
                <CardTitle>Kontaktinformationen</CardTitle>
                <CardDescription>
                  Bitte geben Sie Ihre Daten ein, um das E-Book zu erhalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Ihr Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="ihre@email.de"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? "Wird verarbeitet..." : "E-Book erhalten"}
                  </Button>
                </form>
              </CardContent>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-8"
            >
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-2xl mb-2">Vielen Dank!</CardTitle>
              <CardDescription className="text-base">
                {config.emailDelivery
                  ? "Sie erhalten das E-Book in Kürze per E-Mail."
                  : "Ihr Download startet gleich."}
              </CardDescription>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

