"use client";

import { useState, useEffect } from "react";
import { signIn, signInWithMicrosoft } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { getSSOSettings } from "@/app/actions/sso-settings";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ssoConfig, setSsoConfig] = useState<{ enabled: boolean; clientId: string; tenantId: string } | null>(null);

  useEffect(() => {
    getSSOSettings().then(setSsoConfig);
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("Login fehlgeschlagen. Bitte erneut versuchen.");
      console.error("Email login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await signInWithMicrosoft();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Microsoft Login fehlgeschlagen.");
      console.error("Microsoft login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-[80px] animate-float" style={{ animationDelay: "-5s" }} />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 animate-scale-in">
        {/* Logo */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-60 animate-pulse-glow" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold gradient-text">LeftClick</h1>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">CLM Platform</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
          
          {/* Card Border Glow */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" />

          <div className="relative p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Willkommen zurück</h2>
              <p className="text-muted-foreground">Melde dich an, um fortzufahren</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  E-Mail Adresse
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Passwort
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="glow"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-semibold group"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Wird geladen...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Anmelden
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            {ssoConfig?.enabled && ssoConfig?.clientId && ssoConfig?.tenantId && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card/60 backdrop-blur-sm px-4 text-sm text-muted-foreground">
                      oder fortfahren mit
                    </span>
                  </div>
                </div>

                {/* Microsoft Login */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-12 rounded-xl group"
                  onClick={handleMicrosoftLogin}
                  disabled={loading}
                >
                  <svg className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 23 23" fill="currentColor">
                    <path d="M0 0h11.377v11.372H0zm11.377 0H23v11.372H11.377zm0 11.628H23V23H11.377zm-11.377 0h11.377V23H0z" />
                  </svg>
                  Microsoft 365
                </Button>
              </>
            )}

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

        {/* Registration Link */}
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-sm text-muted-foreground">
            Noch kein Account?{" "}
            <a 
              href="/auth/register" 
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Jetzt registrieren
            </a>
          </p>
        </div>

        {/* Bottom Info */}
        <p className="mt-4 text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Mit der Anmeldung akzeptierst du unsere Nutzungsbedingungen
        </p>
      </div>
    </div>
  );
}
