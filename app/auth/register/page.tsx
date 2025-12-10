"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";

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
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrierung</h1>
        <p className="text-gray-600">
          Erstelle deinen Account mit einem Invite Code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invite Code */}
        <div>
          <Label htmlFor="inviteCode">Invite Code *</Label>
          <Input
            id="inviteCode"
            type="text"
            value={formData.inviteCode}
            onChange={(e) =>
              setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })
            }
            placeholder="INVITE-XXXXXXXXXX"
            disabled={loading}
            className={
              formData.inviteCode.length > 5
                ? inviteCodeValid
                  ? "border-green-500"
                  : inviteCodeValid === false
                  ? "border-red-500"
                  : ""
                : ""
            }
          />
          {validatingCode && (
            <p className="text-sm text-gray-500 mt-1">Validiere Code...</p>
          )}
          {inviteCodeValid && (
            <p className="text-sm text-green-600 mt-1">✓ Gültiger Invite Code</p>
          )}
        </div>

        {/* Name */}
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Max Mustermann"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="max@beispiel.de"
            disabled={loading}
          />
        </div>

        {/* Passwort */}
        <div>
          <Label htmlFor="password">Passwort *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Mindestens 8 Zeichen"
            disabled={loading}
          />
        </div>

        {/* Passwort bestätigen */}
        <div>
          <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Passwort wiederholen"
            disabled={loading}
          />
        </div>

        {/* Fehleranzeige */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !inviteCodeValid}
        >
          {loading ? "Registriere..." : "Registrieren"}
        </Button>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Bereits einen Account?{" "}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Zum Login
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}

function RegisterLoading() {
  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrierung</h1>
        <p className="text-gray-600">Laden...</p>
      </div>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Suspense fallback={<RegisterLoading />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
