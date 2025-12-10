import { createClient } from "@/lib/supabase/client";

export async function signInWithMicrosoft() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: "email openid profile",
    },
  });
  return { data, error };
}

export async function handleMicrosoftCallback() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

