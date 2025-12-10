"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sparkles, ArrowRight, UserPlus, Mail, Lock, User, Hash } from "lucide-react";

// Force dynamic rendering to avoid static prerendering issues with useSearchParams
export const dynamic = "force-dynamic";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCodeParam = searchParams.get("code");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    inviteCode: inviteCodeParam || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null);

  // Validiere Invite Code
  const { data: inviteValidation, isLoading: validatingCode } =
    trpc.inviteCodes.validate.useQuery(
      { code: formData.inviteCode },
      {
        enabled: formData.inviteCode.length > 5,
      }
    );

  useEffect(() => {
    if (inviteValidation) {
      setInviteCodeValid(inviteValidation.valid);
      if (!inviteValidation.valid) {
        const message = 'message' in inviteValidation ? inviteValidation.message : "Ungültiger Invite Code";
        setError(message || "Ungültiger Invite Code");
      } else {
        setError("");
      }
    }
  }, [inviteValidation]);

  const useInviteCode = trpc.inviteCodes.use.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validierung
    if (!formData.email || !formData.password || !formData.name || !formData.inviteCode) {
      setError("Bitte alle Felder ausfüllen");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      setLoading(false);
      return;
    }

    if (!inviteCodeValid) {
      setError("Bitte einen gültigen Invite Code eingeben");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Registriere Benutzer
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Registrierung fehlgeschlagen");

      // Verwende Invite Code
      await useInviteCode.mutateAsync({
        code: formData.inviteCode,
        userId: authData.user.id,
      });

      // Weiterleitung zum Dashboard
      router.push("/admin");
    } catch (err: any) {
      console.error("Registrierungsfehler:", err);
      setError(err.message || "Fehler bei der Registrierung");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md animate-scale-in">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-60 animate-pulse-glow" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 shadow-lg">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold gradient-text">LeftClick</h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Registrierung</p>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Erstelle deinen Account mit einem Invite Code
        </p>
      </div>

      <div className="relative rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
        
        {/* Card Border Glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" />

        <div className="relative p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Invite Code */}
            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-sm font-medium text-muted-foreground">Invite Code *</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Hash className="h-5 w-5" />
                </div>
                <Input
                  id="inviteCode"
                  type="text"
                  value={formData.inviteCode}
                  onChange={(e) =>
                    setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })
                  }
                  placeholder="INVITE-XXXXXXXXXX"
                  disabled={loading}
                  className={`h-12 pl-12 rounded-xl border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-50 text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all ${
                    formData.inviteCode.length > 5
                      ? inviteCodeValid
                        ? "border-green-500/50 focus:border-green-500/50"
                        : inviteCodeValid === false
                        ? "border-red-500/50 focus:border-red-500/50"
                        : ""
                      : ""
                  }`}
                />
              </div>
              {validatingCode && (
                <p className="text-xs text-muted-foreground pl-1">Validiere Code...</p>
              )}
              {inviteCodeValid && (
                <p className="text-xs text-green-500 pl-1">✓ Gültiger Invite Code</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Name *</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Max Mustermann"
                  disabled={loading}
                  className="h-12 pl-12 rounded-xl border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-50 text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">E-Mail *</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="max@beispiel.de"
                  disabled={loading}
                  className="h-12 pl-12 rounded-xl border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-50 text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Passwort */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Passwort *</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mindestens 8 Zeichen"
                  disabled={loading}
                  className="h-12 pl-12 rounded-xl border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-50 text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Passwort bestätigen */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">Passwort bestätigen *</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Passwort wiederholen"
                  disabled={loading}
                  className="h-12 pl-12 rounded-xl border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-50 text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Fehleranzeige */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500 dark:text-red-400 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="glow"
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold group"
              disabled={loading || !inviteCodeValid}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registriere...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Registrieren
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10 dark:border-white/10 light:border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card/60 backdrop-blur-sm px-4 text-sm text-muted-foreground">
                Bereits einen Account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/auth/login" 
              className="text-purple-500 hover:text-purple-400 font-medium transition-colors"
            >
              Zum Login
            </a>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Powered by LeftClick CLM
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterLoading() {
  return (
    <div className="w-full max-w-md p-8 text-center">
      <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Laden...</p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-[80px] animate-float pointer-events-none" style={{ animationDelay: "-5s" }} />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full flex justify-center px-4">
        <Suspense fallback={<RegisterLoading />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
