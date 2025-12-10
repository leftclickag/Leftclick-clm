import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export async function signIn(email: string, password: string) {
  console.log('🔐 signIn called with email:', email);
  const supabase = createClient();
  console.log('✅ Supabase client created');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  console.log('📊 signIn result:', { 
    hasData: !!data, 
    hasUser: !!data?.user,
    error: error?.message || 'none' 
  });
  
  return { data, error };
}

export async function signUp(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function enableMFA() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
  });
  return { data, error };
}

export async function verifyMFA(
  factorId: string,
  challengeId: string,
  code: string
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });
  return { data, error };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

