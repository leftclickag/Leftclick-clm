import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createAdminClient } from "@/lib/supabase/server";
import { PermissionsService } from "@/lib/permissions/permissions-service";

// Prüfe ob User Admin-Rechte hat
async function checkAdminPermission(userId: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  return data && ["admin", "super_admin"].includes(data.role);
}

// Prüfe ob User Super-Admin ist
async function checkSuperAdminPermission(userId: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "super_admin";
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
      // Prüfe Berechtigung
      const hasPermission = await PermissionsService.hasPermission('users.view');
      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung für diese Aktion",
        });
      }

      const adminClient = createAdminClient();
      const { page, pageSize, search } = input;
      const offset = (page - 1) * pageSize;

      // Query für users mit optionaler Suche
      let query = adminClient
        .from("users")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`email.ilike.%${search}%`);
      }

      const { data: usersData, error: usersError, count } = await query
        .range(offset, offset + pageSize - 1);

      if (usersError) {
        console.error("❌ Fehler beim Laden der Benutzer:", usersError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Fehler beim Laden der Benutzer: ${usersError.message}`,
        });
      }

      // Hole Auth-User Details für jeden Benutzer
      const users = [];
      if (usersData) {
        for (const user of usersData) {
          try {
            const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(
              user.id
            );

            if (authError) {
              console.error(`Fehler beim Laden von User ${user.id}:`, authError);
              continue;
            }

            if (authUser.user) {
              users.push({
                ...authUser.user,
                user_roles: {
                  role: user.role,
                },
              });
            }
          } catch (e) {
            console.error(`Exception beim Laden von User ${user.id}:`, e);
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

      // Hole User
      const { data: userData } = await adminClient
        .from("users")
        .select("*")
        .eq("id", input.userId)
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

      return {
        ...authUser.user,
        user_roles: userData
          ? { role: userData.role }
          : { role: "user" },
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
      // Prüfe Berechtigung
      const hasPermission = await PermissionsService.hasPermission('users.create');
      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung Benutzer zu erstellen",
        });
      }

      const adminClient = createAdminClient();
      console.log("📝 Creating user:", input.email);

      // Hole Tenant des aktuellen Users
      const { data: currentUserData } = await adminClient
        .from("users")
        .select("tenant_id")
        .eq("id", ctx.user.id)
        .single();

      const tenantId = currentUserData?.tenant_id || '00000000-0000-0000-0000-000000000001';

      // 1. Benutzer in Auth erstellen
      const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          name: input.name,
        },
      });

      if (createError || !authUser.user) {
        console.error("❌ Auth createUser error:", createError);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Fehler beim Erstellen: ${createError?.message}`,
        });
      }

      console.log("✅ Auth user created:", authUser.user.id);

      // 2. Eintrag in users Tabelle erstellen/aktualisieren
      const { error: userError } = await adminClient
        .from("users")
        .upsert({
          id: authUser.user.id,
          email: input.email,
          role: input.role,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (userError) {
        console.error("❌ User table error:", userError);
        // Cleanup: User wieder löschen
        await adminClient.auth.admin.deleteUser(authUser.user.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Fehler beim Zuweisen der Rolle: ${userError.message}`,
        });
      }

      console.log("✅ User created successfully with role:", input.role);
      return { success: true, user: authUser.user };
    }),

  // Benutzer aktualisieren
  update: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        name: z.string().optional(),
        password: z.string().min(6).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const adminClient = createAdminClient();

      // Prüfe Berechtigung
      const isAdmin = await checkAdminPermission(ctx.user.id);
      const isSelf = ctx.user.id === input.userId;

      if (!isAdmin && !isSelf) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung Benutzer zu bearbeiten",
        });
      }

      if (!input.name && !input.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mindestens ein Feld muss angegeben werden",
        });
      }

      const updateData: any = {};

      if (input.name) {
        updateData.user_metadata = { name: input.name };
      }

      if (input.password) {
        updateData.password = input.password;
      }

      const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
        input.userId,
        updateData
      );

      if (updateError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Fehler beim Aktualisieren: ${updateError.message}`,
        });
      }

      return { success: true, user: updatedUser.user };
    }),

  // Rolle aktualisieren
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(["user", "admin", "super_admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prüfe Berechtigung
      const hasPermission = await PermissionsService.hasPermission('users.manage_roles');
      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung Rollen zu ändern",
        });
      }

      // Verhindere Selbst-Degradierung
      if (ctx.user.id === input.userId) {
        const currentRole = await PermissionsService.getCurrentUserRole();
        if (currentRole === 'super_admin' && input.role !== 'super_admin') {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Du kannst deine eigene Rolle nicht herabstufen",
          });
        }
      }

      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from("users")
        .update({
          role: input.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.userId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Aktualisieren der Rolle",
        });
      }

      return { success: true };
    }),

  // Benutzer löschen
  delete: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Prüfe Berechtigung
      const hasPermission = await PermissionsService.hasPermission('users.delete');
      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine Berechtigung Benutzer zu löschen",
        });
      }

      // Verhindere Selbstlöschung
      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Du kannst dich nicht selbst löschen",
        });
      }

      const adminClient = createAdminClient();
      const { error } = await adminClient.auth.admin.deleteUser(input.userId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Löschen des Benutzers",
        });
      }

      // users Eintrag wird durch CASCADE gelöscht

      return { success: true };
    }),

  // Statistiken
  stats: protectedProcedure.query(async ({ ctx }) => {
    const hasPermission = await PermissionsService.hasPermission('users.view');
    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Keine Berechtigung",
      });
    }

    const adminClient = createAdminClient();

    // Gesamtanzahl
    const { count: totalUsers } = await adminClient
      .from("users")
      .select("*", { count: "exact", head: true });

    // Neue Benutzer letzte 30 Tage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newUsers } = await adminClient
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Benutzer nach Rolle
    const { data: roleStats } = await adminClient
      .from("users")
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
