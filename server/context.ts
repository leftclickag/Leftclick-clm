import { createClient } from "@/lib/supabase/server";

export interface Context {
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export async function createContext(): Promise<Context> {
  const supabase = await createClient();
  return { supabase };
}

