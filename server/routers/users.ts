import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createClient } from "@/lib/supabase/server";

export const usersRouter = router({
  // Liste aller Benutzer (nur für Admins)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        search: z.string().optional(),
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

      const { page, pageSize, search } = input;
      const offset = (page - 1) * pageSize;

      // Hole alle user_roles
      const { data: userRolesData, error: rolesError, count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (rolesError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Laden der Benutzer",
        });
      }

      // Hole die User-Details aus auth.users über admin API
      const users = [];
      if (userRolesData) {
        for (const userRole of userRolesData) {
          const { data: authUser } = await supabase.auth.admin.getUserById(
            userRole.user_id
          );
          if (authUser.user) {
            users.push({
              ...authUser.user,
              user_roles: {
                role: userRole.role,
                permissions: userRole.permissions,
              },
            });
          }
        }
      }

      return {
        users,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };

    }),

  // Einzelner Benutzer
  get: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Prüfe ob User sich selbst oder als Admin andere ansieht
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", ctx.user.id)
        .single();

      const isAdmin = userRole && ["admin", "super_admin"].includes(userRole.role);
      const isSelf = ctx.user.id === input.userId;

      if (!isAdmin && !isSelf) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung für diese Aktion",
        });
      }

      // Hole User-Rolle
      const { data: userRoleData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", input.userId)
        .single();

      // Hole Auth User Details
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
        input.userId
      );

      if (authError || !authUser.user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Benutzer nicht gefunden",
        });
      }

      // Hole Invite Code Usage
      const { data: inviteUsage } = await supabase
        .from("invite_code_usage")
        .select(
          `
          invite_code_id,
          used_at,
          invite_codes (code)
        `
        )
        .eq("used_by", input.userId)
        .single();

      return {
        ...authUser.user,
        user_roles: userRoleData
          ? {
              role: userRoleData.role,
              permissions: userRoleData.permissions,
            }
          : { role: "user", permissions: [] },
        invite_code_usage: inviteUsage ? [inviteUsage] : [],
      };
    }),

  // Benutzer-Rolle aktualisieren
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(["user", "admin", "super_admin"]),
        permissions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Nur Super-Admins können Rollen ändern
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", ctx.user.id)
        .single();

      if (!userRole || userRole.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Super-Admins können Rollen ändern",
        });
      }

      // Verhindere, dass sich ein Admin selbst degradiert
      if (ctx.user.id === input.userId && input.role !== "super_admin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Du kannst deine eigene Rolle nicht ändern",
        });
      }

      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: input.userId,
          role: input.role,
          permissions: input.permissions || [],
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Aktualisieren der Rolle",
        });
      }

      return { success: true };
    }),

  // Benutzer deaktivieren/löschen
  delete: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Nur Super-Admins können Benutzer löschen
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", ctx.user.id)
        .single();

      if (!userRole || userRole.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Super-Admins können Benutzer löschen",
        });
      }

      // Verhindere Selbstlöschung
      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Du kannst dich nicht selbst löschen",
        });
      }

      // Lösche Benutzer aus auth.users (kaskadiert zu user_roles etc.)
      const { error } = await supabase.auth.admin.deleteUser(input.userId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Löschen des Benutzers",
        });
      }

      return { success: true };
    }),

  // Aktuelle Benutzer-Statistiken
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

    // Gesamtanzahl Benutzer aus user_roles
    const { count: totalUsers } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true });

    // Neue Benutzer letzte 30 Tage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newUsers } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Benutzer nach Rolle
    const { data: roleStats } = await supabase
      .from("user_roles")
      .select("role");

    const usersByRole = roleStats?.reduce((acc: Record<string, number>, curr) => {
      acc[curr.role] = (acc[curr.role] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      totalUsers: totalUsers || 0,
      newUsers: newUsers || 0,
      usersByRole,
    };
  }),
});

