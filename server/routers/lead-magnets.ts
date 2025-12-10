import { z } from "zod";
import { router, adminProcedure } from "../trpc";

const leadMagnetSchema = z.object({
  type: z.enum(["ebook", "checklist", "quiz", "calculator"]),
  title: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
  active: z.boolean().default(true),
  config: z.record(z.any()).default({}),
});

export const leadMagnetsRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("lead_magnets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("lead_magnets")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  create: adminProcedure
    .input(leadMagnetSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase.auth.getUser();
      const { data: userProfile } = await ctx.supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.user?.id)
        .single();

      const { data, error } = await ctx.supabase
        .from("lead_magnets")
        .insert({
          ...input,
          tenant_id: userProfile?.tenant_id,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        ...leadMagnetSchema.partial().shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const { data, error } = await ctx.supabase
        .from("lead_magnets")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("lead_magnets")
        .delete()
        .eq("id", input.id);

      if (error) throw new Error(error.message);
      return { success: true };
    }),
});

