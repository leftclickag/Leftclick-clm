"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  Key,
  Save,
  Camera,
  Bell,
  Palette,
  Globe,
  CheckCircle,
  AlertCircle,
  Upload
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
  mfa_enabled: boolean;
  avatar_url: string | null;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Editable fields
  const [displayName, setDisplayName] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    weekly: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
        setAvatarUrl(profileData.avatar_url);
        
        // Get tenant info
        const { data: tenantData } = await supabase
          .from("tenants")
          .select("*")
          .eq("id", profileData.tenant_id)
          .single();
        
        if (tenantData) {
          setTenant(tenantData);
        }
      }
    }
    setLoading(false);
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine Bilddatei aus.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Die Datei ist zu groß. Maximal 5MB erlaubt.');
      return;
    }

    setUploading(true);
    const supabase = createClient();

    try {
      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${profile.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setProfile({ ...profile, avatar_url: publicUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Fehler beim Hochladen des Profilbilds.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-40" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Mein Profil</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Verwalte deine persönlichen Einstellungen
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="animate-fade-in flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <CheckCircle className="h-5 w-5" />
          <span>Änderungen erfolgreich gespeichert!</span>
        </div>
      )}

      <div className="grid gap-6">
        {/* Profile Picture & Basic Info */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20">
                <Camera className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Profil</CardTitle>
                <CardDescription>Deine persönlichen Informationen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profilbild"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {uploading ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
              
              {/* Name & Role */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Anzeigename</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Dein Name"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-muted-foreground">E-Mail</span>
                </div>
                <p className="font-medium">{profile?.email}</p>
              </div>
              
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-muted-foreground">Rolle</span>
                </div>
                <p className="font-medium capitalize">{profile?.role}</p>
              </div>
            </div>
          </CardContent>
        </GlowCard>

        {/* Organization */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20">
                <Building className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Organisation</CardTitle>
                <CardDescription>Dein Unternehmen und Workspace</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-muted-foreground">Organisation</span>
                </div>
                <p className="font-medium">{tenant?.name || "Nicht zugewiesen"}</p>
              </div>
              
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-muted-foreground">Workspace-URL</span>
                </div>
                <p className="font-medium font-mono text-sm">{tenant?.slug || "-"}</p>
              </div>
            </div>
          </CardContent>
        </GlowCard>

        {/* Notifications */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-500/20">
                <Bell className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Benachrichtigungen</CardTitle>
                <CardDescription>Wähle, wie du informiert werden möchtest</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "email", label: "E-Mail Benachrichtigungen", description: "Erhalte Updates per E-Mail", key: "email" as const },
              { id: "browser", label: "Browser Benachrichtigungen", description: "Push-Benachrichtigungen im Browser", key: "browser" as const },
              { id: "weekly", label: "Wöchentlicher Report", description: "Zusammenfassung deiner Analytics", key: "weekly" as const },
            ].map((option) => (
              <div 
                key={option.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <input
                  type="checkbox"
                  id={option.id}
                  checked={notifications[option.key]}
                  onChange={(e) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [option.key]: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border-white/20 bg-white/10 text-pink-500 focus:ring-pink-500/50"
                />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="font-medium cursor-pointer">{option.label}</Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </GlowCard>

        {/* Security */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <Key className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Sicherheit</CardTitle>
                <CardDescription>Passwort und Zwei-Faktor-Authentifizierung</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Key className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">Passwort ändern</p>
                  <p className="text-xs text-muted-foreground">Aktualisiere dein Passwort regelmäßig</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Ändern</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Shield className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">Zwei-Faktor-Authentifizierung</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.mfa_enabled ? "Aktiviert - Dein Konto ist geschützt" : "Nicht aktiviert"}
                  </p>
                </div>
              </div>
              <Button 
                variant={profile?.mfa_enabled ? "outline" : "neon"} 
                size="sm"
              >
                {profile?.mfa_enabled ? "Verwalten" : "Aktivieren"}
              </Button>
            </div>
          </CardContent>
        </GlowCard>

        {/* Account Info */}
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              Mitglied seit {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("de-DE", { 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              }) : "Unbekannt"}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <Button 
            variant="glow"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="min-w-[150px]"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Speichern...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Speichern
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

