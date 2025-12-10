import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createAdminClient } from "@/lib/supabase/server";

// DEV MODE Helper - im Development alle authentifizierten User als Admin behandeln
const isDev = process.env.NODE_ENV === "development";

async function checkAdminPermission(userId: string): Promise<boolean> {
  // DEV MODE: Alle authentifizierten Benutzer sind Admins
  if (isDev) {
    console.log("✅ DEV MODE: Authentifizierter User wird als Admin behandelt (users router)");
    return true;
  }

  // Production: Verwende Admin Client um RLS zu umgehen
  const adminClient = createAdminClient();
  const { data: userRole } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  return userRole && ["admin", "super_admin"].includes(userRole.role);
}

async function checkSuperAdminPermission(userId: string): Promise<boolean> {
  // DEV MODE: Alle authentifizierten Benutzer sind Super Admins
  if (isDev) {
    console.log("✅ DEV MODE: Authentifizierter User wird als Super Admin behandelt (users router)");
    return true;
  }

  // Production: Verwende Admin Client um RLS zu umgehen
  const adminClient = createAdminClient();
  const { data: userRole } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  return userRole?.role === "super_admin";
}

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
      const adminClient = createAdminClient();

      // Prüfe Admin-Berechtigung
      const isAdmin = await checkAdminPermission(ctx.user.id);
      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung für diese Aktion",
        });
      }

      const { page, pageSize, search } = input;
      const offset = (page - 1) * pageSize;

      // Hole alle user_roles (mit Admin Client um RLS zu umgehen)
      const { data: userRolesData, error: rolesError, count } = await adminClient
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
          try {
            const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(
              userRole.user_id
            );
            
            if (authError) {
               console.error(`Fehler beim Laden von User ${userRole.user_id}:`, authError);
               continue;
            }

            if (authUser.user) {
              users.push({
                ...authUser.user,
                user_roles: {
                  role: userRole.role,
                  permissions: userRole.permissions,
                },
              });
            }
          } catch (e) {
             console.error(`Exception beim Laden von User ${userRole.user_id}:`, e);
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
      const adminClient = createAdminClient();

      // Prüfe ob User sich selbst oder als Admin andere ansieht
      const isAdmin = await checkAdminPermission(ctx.user.id);
      const isSelf = ctx.user.id === input.userId;

      if (!isAdmin && !isSelf) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung für diese Aktion",
        });
      }

      // Hole User-Rolle
      const { data: userRoleData } = await adminClient
        .from("user_roles")
        .select("*")
        .eq("user_id", input.userId)
        .single();

      // Hole Auth User Details
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(
        input.userId
      );

      if (authError || !authUser.user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Benutzer nicht gefunden",
        });
      }

      // Hole Invite Code Usage
      const { data: inviteUsage } = await adminClient
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

  // Benutzer erstellen
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Ungültige E-Mail-Adresse"),
        password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
        name: z.string().optional(),
        role: z.enum(["user", "admin", "super_admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const adminClient = createAdminClient();

      // Prüfe Berechtigung (nur Admin/Super Admin darf erstellen)
      const isAdmin = await checkAdminPermission(ctx.user.id);
      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung Benutzer zu erstellen",
        });
      }

      console.log("📝 Creating user:", input.email);

      // 1. Benutzer in Auth erstellen
      const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true, // Email direkt bestätigen
        user_metadata: {
          name: input.name,
        },
      });

      if (createError) {
        console.error("❌ Auth createUser error:", createError);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Fehler beim Erstellen: ${createError.message}`,
        });
      }

      if (!authUser.user) {
        console.error("❌ Auth user is null after creation");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Benutzer konnte nicht erstellt werden",
        });
      }

      console.log("✅ Auth user created:", authUser.user.id);

      // 2. Rolle zuweisen
      const { error: roleError } = await adminClient
        .from("user_roles")
        .insert({
          user_id: authUser.user.id,
          role: input.role,
          permissions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (roleError) {
        console.error("❌ Role assignment error:", roleError);
        // Cleanup: User wieder löschen wenn Rolle nicht gesetzt werden konnte
        await adminClient.auth.admin.deleteUser(authUser.user.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Fehler beim Zuweisen der Rolle: ${roleError.message}`,
        });
      }

      console.log("✅ User created successfully with role:", input.role);
      return { success: true, user: authUser.user };
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
      const adminClient = createAdminClient();

      // Nur Super-Admins können Rollen ändern
      const isSuperAdmin = await checkSuperAdminPermission(ctx.user.id);
      if (!isSuperAdmin) {
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

      // Verwende Admin Client für das Update um sicherzustellen, dass es funktioniert
      const { error } = await adminClient
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
      const adminClient = createAdminClient();

      // Nur Super-Admins können Benutzer löschen
      const isSuperAdmin = await checkSuperAdminPermission(ctx.user.id);
      if (!isSuperAdmin) {
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

      // Lösche Benutzer aus auth.users mit Admin Client
      const { error } = await adminClient.auth.admin.deleteUser(input.userId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Löschen des Benutzers",
        });
      }
      
      // user_roles wird durch foreign key cascade gelöscht, falls eingerichtet.
      // Wenn nicht, manuell löschen:
      await adminClient.from("user_roles").delete().eq("user_id", input.userId);

      return { success: true };
    }),

  // Aktuelle Benutzer-Statistiken
  stats: protectedProcedure.query(async ({ ctx }) => {
    const adminClient = createAdminClient();

    // Prüfe Admin-Berechtigung
    const isAdmin = await checkAdminPermission(ctx.user.id);
    if (!isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Keine Berechtigung für diese Aktion",
      });
    }

    // Gesamtanzahl Benutzer aus user_roles
    const { count: totalUsers } = await adminClient
      .from("user_roles")
      .select("*", { count: "exact", head: true });

    // Neue Benutzer letzte 30 Tage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newUsers } = await adminClient
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Benutzer nach Rolle
    const { data: roleStats } = await adminClient
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
