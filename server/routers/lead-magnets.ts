import { z } from "zod";
import { router, adminProcedure } from "../trpc";

const leadMagnetSchema = z.object({
  type: z.enum(["ebook", "checklist", "quiz", "calculator"]),
  title: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
  active: z.boolean().default(true),
  config: z.record(z.string(), z.any()).default({}),
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

      // Extract steps from config if present
      const { config, ...inputWithoutConfig } = input;
      const steps = config?.steps;
      const configWithoutSteps = config ? { ...config } : {};
      delete configWithoutSteps.steps;

      const { data, error } = await ctx.supabase
        .from("lead_magnets")
        .insert({
          ...inputWithoutConfig,
          config: configWithoutSteps,
          tenant_id: userProfile?.tenant_id,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // If steps were provided, insert them into flow_steps table
      if (steps && Array.isArray(steps) && steps.length > 0) {
        const flowStepsToInsert = steps.map((step: any) => ({
          lead_magnet_id: data.id,
          step_number: step.step_number,
          title: step.title,
          description: step.description || null,
          component_type: step.component_type,
          config: step.config || {},
        }));

        const { error: stepsError } = await ctx.supabase
          .from("flow_steps")
          .insert(flowStepsToInsert);

        if (stepsError) throw new Error(stepsError.message);
      }

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
      const { id, config, ...updateData } = input;
      
      // Extract steps from config if present
      const steps = config?.steps;
      const configWithoutSteps = config ? { ...config } : {};
      delete configWithoutSteps.steps;
      
      // Update the lead magnet without steps in config
      const { data, error } = await ctx.supabase
        .from("lead_magnets")
        .update({
          ...updateData,
          config: configWithoutSteps,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // If steps were provided, update flow_steps table
      if (steps && Array.isArray(steps)) {
        // Delete existing flow steps
        await ctx.supabase
          .from("flow_steps")
          .delete()
          .eq("lead_magnet_id", id);

        // Insert new flow steps
        if (steps.length > 0) {
          const flowStepsToInsert = steps.map((step: any) => ({
            lead_magnet_id: id,
            step_number: step.step_number,
            title: step.title,
            description: step.description || null,
            component_type: step.component_type,
            config: step.config || {},
          }));

          const { error: stepsError } = await ctx.supabase
            .from("flow_steps")
            .insert(flowStepsToInsert);

          if (stepsError) throw new Error(stepsError.message);
        }
      }

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

