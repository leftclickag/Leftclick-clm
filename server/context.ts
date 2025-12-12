import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface Context {
  supabase: Awaited<ReturnType<typeof createClient>>;
  /**
   * Wird in `protectedProcedure` gesetzt (siehe `server/trpc.ts`)
   */
  user?: User;
}

export async function createContext(): Promise<Context> {
  const supabase = await createClient();
  return { supabase };
}

