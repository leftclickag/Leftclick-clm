import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export const inviteCodesRouter = router({
  // Liste aller Invite Codes (nur für Admins)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        activeOnly: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Prüfe Admin-Berechtigung
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", ctx.user.id)
        .single();

      if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung für diese Aktion",
        });
      }

      const { page, pageSize, activeOnly } = input;
      const offset = (page - 1) * pageSize;

      let query = supabase
        .from("invite_codes")
        .select(
          `
          *,
          invite_code_usage(count)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Laden der Invite Codes",
        });
      }

      return {
        inviteCodes: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    }),

  // Neuen Invite Code erstellen
  create: protectedProcedure
    .input(
      z.object({
        maxUses: z.number().min(1).default(1),
        expiresInDays: z.number().min(1).max(365).optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Prüfe Admin-Berechtigung
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", ctx.user.id)
        .single();

      if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung für diese Aktion",
        });
      }

      // Generiere einzigartigen Code
      const code = `INVITE-${nanoid(10).toUpperCase()}`;

      // Berechne Ablaufdatum wenn angegeben
      let expiresAt = null;
      if (input.expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
      }

      const { data, error } = await supabase
        .from("invite_codes")
        .insert({
          code,
          created_by: ctx.user.id,
          max_uses: input.maxUses,
          expires_at: expiresAt?.toISOString(),
          metadata: input.metadata || {},
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Erstellen des Invite Codes",
        });
      }

      return data;
    }),

  // Invite Code validieren (öffentlich für Registrierung)
  validate: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const supabase = await createClient();

      // Finde Code
      const { data, error } = await supabase
        .from("invite_codes")
        .select("*")
        .eq("code", input.code.toUpperCase())
        .single();

      if (error || !data) {
        return { valid: false, message: "Ungültiger Invite Code" };
      }

      // Prüfe ob aktiv
      if (!data.is_active) {
        return { valid: false, message: "Dieser Invite Code ist nicht mehr aktiv" };
      }

      // Prüfe Ablaufdatum
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, message: "Dieser Invite Code ist abgelaufen" };
      }

      // Prüfe max uses
      if (data.current_uses >= data.max_uses) {
        return { valid: false, message: "Dieser Invite Code wurde bereits vollständig verwendet" };
      }

      return { valid: true, inviteCode: data };
    }),

  // Invite Code verwenden (während Registrierung)
  use: publicProcedure
    .input(
      z.object({
        code: z.string(),
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      // Validiere Code zuerst
      const { data: inviteCode, error: findError } = await supabase
        .from("invite_codes")
        .select("*")
        .eq("code", input.code.toUpperCase())
        .single();

      if (findError || !inviteCode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ungültiger Invite Code",
        });
      }

      if (!inviteCode.is_active) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dieser Invite Code ist nicht mehr aktiv",
        });
      }

      if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dieser Invite Code ist abgelaufen",
        });
      }

      if (inviteCode.current_uses >= inviteCode.max_uses) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dieser Invite Code wurde bereits vollständig verwendet",
        });
      }

      // Prüfe ob User schon einen Code verwendet hat
      const { data: existingUsage } = await supabase
        .from("invite_code_usage")
        .select("*")
        .eq("used_by", input.userId)
        .single();

      if (existingUsage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Du hast bereits einen Invite Code verwendet",
        });
      }

      // Füge Usage hinzu (Trigger updated automatisch current_uses)
      const { error: usageError } = await supabase
        .from("invite_code_usage")
        .insert({
          invite_code_id: inviteCode.id,
          used_by: input.userId,
        });

      if (usageError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Verwenden des Invite Codes",
        });
      }

      // Erstelle User-Rolle für neuen User
      await supabase.from("user_roles").insert({
        user_id: input.userId,
        role: "user",
        permissions: [],
      });

      return { success: true };
    }),

  // Invite Code deaktivieren
  deactivate: protectedProcedure
    .input(z.object({ codeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Prüfe Admin-Berechtigung
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", ctx.user.id)
        .single();

      if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung für diese Aktion",
        });
      }

      const { error } = await supabase
        .from("invite_codes")
        .update({ is_active: false })
        .eq("id", input.codeId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Deaktivieren des Invite Codes",
        });
      }

      return { success: true };
    }),

  // Invite Code löschen
  delete: protectedProcedure
    .input(z.object({ codeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Prüfe Admin-Berechtigung
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", ctx.user.id)
        .single();

      if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung für diese Aktion",
        });
      }

      const { error } = await supabase
        .from("invite_codes")
        .delete()
        .eq("id", input.codeId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Löschen des Invite Codes",
        });
      }

      return { success: true };
    }),

  // Statistiken
  stats: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient();

    // Prüfe Admin-Berechtigung
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", ctx.user.id)
      .single();

    if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Keine Berechtigung für diese Aktion",
      });
    }

    // Gesamtanzahl Codes
    const { count: totalCodes } = await supabase
      .from("invite_codes")
      .select("*", { count: "exact", head: true });

    // Aktive Codes
    const { count: activeCodes } = await supabase
      .from("invite_codes")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Verwendete Codes
    const { count: usedCodes } = await supabase
      .from("invite_code_usage")
      .select("*", { count: "exact", head: true });

    return {
      totalCodes: totalCodes || 0,
      activeCodes: activeCodes || 0,
      usedCodes: usedCodes || 0,
    };
  }),
});

