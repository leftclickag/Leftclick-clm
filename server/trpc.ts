import { initTRPC, TRPCError } from "@trpc/server";
import { createClient } from "@/lib/supabase/server";
import type { Context } from "@/server/context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      user,
      supabase,
    },
  });
});

export const adminProcedure = protectedProcedure.use(async (opts) => {
  const user = opts.ctx.user;
  
  console.log("🔐 adminProcedure - User ID:", user.id, "Email:", user.email);
  
  // DEV MODE: Alle authentifizierten Benutzer sind Admins
  // TODO: In Production die RLS-Policies korrigieren und diese Zeile entfernen
  console.log("✅ DEV MODE: Authentifizierter User wird als Admin behandelt");
  return opts.next();
});

