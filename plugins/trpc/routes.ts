import { any, array, number, object, string } from "superstruct";
import { observable } from "@trpc/server/observable";
import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "./context";
import { info } from "./plugin";

const { router, procedure, middleware } = initTRPC.context<Context>().create();

const auth = middleware(({ next, ctx }) => {
  if (!ctx.persistence) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next<Required<Context>>({ ctx });
});

const app = router({
  push: procedure
    .use(auth)
    .input(array(any()))
    .mutation(async ({ input, ctx }) => {
      info(`${ctx.name} pushed new changes.`);
      return ctx.persistence.merge(input).then();
    }),
  pull: procedure
    .use(auth)
    .input(object({ version: number(), client: string() }))
    .subscription(({ input, ctx }) =>
      observable<any[]>(({ next }) => {
        info(`${ctx.name} subscribed to database changes.`);
        const promise = ctx.persistence.subscribe(["*"], next, input).then();
        return async () => {
          info(`${ctx.name} unsubscribed from database changes.`);
          (await promise)();
        };
      })
    ),
});

export { app };
export type App = typeof app;
