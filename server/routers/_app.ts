import { router } from "../trpc";
import { publicProcedure } from "../trpc";
import { leadMagnetsRouter } from "./lead-magnets";
import { usersRouter } from "./users";
import { inviteCodesRouter } from "./invite-codes";
import { leadsRouter } from "./leads";
import { permissionsRouter } from "./permissions";
import { apiIntegrationsRouter } from "./api-integrations";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  leadMagnets: leadMagnetsRouter,
  users: usersRouter,
  inviteCodes: inviteCodesRouter,
  leads: leadsRouter,
  permissions: permissionsRouter,
  apiIntegrations: apiIntegrationsRouter,
});

export type AppRouter = typeof appRouter;

