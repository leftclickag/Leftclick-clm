import { router } from "../trpc";
import { publicProcedure } from "../trpc";
import { leadMagnetsRouter } from "./lead-magnets";
import { usersRouter } from "./users";
import { inviteCodesRouter } from "./invite-codes";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  leadMagnets: leadMagnetsRouter,
  users: usersRouter,
  inviteCodes: inviteCodesRouter,
});

export type AppRouter = typeof appRouter;

