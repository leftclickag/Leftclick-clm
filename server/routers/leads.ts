import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const leadsRouter = router({
  // Liste aller Leads mit Lead-Magnet Informationen
  list: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
        status: z.enum(["all", "completed", "in_progress", "started", "abandoned"]).default("all"),
        leadMagnetId: z.string().uuid().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, status, leadMagnetId, search } = input;
      const offset = (page - 1) * pageSize;

      // Baue Query mit Joins
      let query = ctx.supabase
        .from("submissions")
        .select(
          `
          *,
          lead_magnets!inner(id, title, type, slug)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      // Filter nach Status
      if (status !== "all") {
        query = query.eq("status", status);
      }

      // Filter nach Lead Magnet
      if (leadMagnetId) {
        query = query.eq("lead_magnet_id", leadMagnetId);
      }

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      // Formatiere die Daten für die Anzeige
      const leads = (data || []).map((submission: any) => ({
        id: submission.id,
        status: submission.status,
        contactInfo: submission.contact_info || {},
        data: submission.data || {},
        leadMagnet: {
          id: submission.lead_magnets?.id,
          title: submission.lead_magnets?.title,
          type: submission.lead_magnets?.type,
          slug: submission.lead_magnets?.slug,
        },
        // UTM Tracking
        utmSource: submission.utm_source,
        utmMedium: submission.utm_medium,
        utmCampaign: submission.utm_campaign,
        referrer: submission.referrer,
        // Device Info
        deviceType: submission.device_type,
        browser: submission.browser,
        country: submission.country,
        city: submission.city,
        // Timestamps
        createdAt: submission.created_at,
        updatedAt: submission.updated_at,
      }));

      return {
        leads,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    }),

  // Statistiken für Leads
  stats: adminProcedure.query(async ({ ctx }) => {
    const { data: total, count: totalCount } = await ctx.supabase
      .from("submissions")
      .select("*", { count: "exact", head: true });

    const { count: completedCount } = await ctx.supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const { count: inProgressCount } = await ctx.supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress");

    const { count: abandonedCount } = await ctx.supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "abandoned");

    // Leads pro Lead-Magnet
    const { data: leadsByMagnet } = await ctx.supabase
      .from("submissions")
      .select(
        `
        lead_magnet_id,
        lead_magnets!inner(title, type)
      `
      )
      .eq("status", "completed");

    // Gruppiere nach Lead-Magnet
    const magnetStats: Record<string, { title: string; type: string; count: number }> = {};
    (leadsByMagnet || []).forEach((item: any) => {
      const id = item.lead_magnet_id;
      if (!magnetStats[id]) {
        magnetStats[id] = {
          title: item.lead_magnets?.title || "Unbekannt",
          type: item.lead_magnets?.type || "unknown",
          count: 0,
        };
      }
      magnetStats[id].count++;
    });

    // Leads der letzten 7 Tage
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentLeads } = await ctx.supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", sevenDaysAgo.toISOString());

    return {
      totalLeads: totalCount || 0,
      completedLeads: completedCount || 0,
      inProgressLeads: inProgressCount || 0,
      abandonedLeads: abandonedCount || 0,
      recentLeads: recentLeads || 0,
      leadsByMagnet: Object.values(magnetStats),
    };
  }),

  // Einzelnen Lead abrufen
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("submissions")
        .select(
          `
          *,
          lead_magnets!inner(id, title, type, slug, config)
        `
        )
        .eq("id", input.id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  // Lead löschen
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("submissions")
        .delete()
        .eq("id", input.id);

      if (error) throw new Error(error.message);
      return { success: true };
    }),
});

