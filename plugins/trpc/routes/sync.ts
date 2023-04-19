import { any, array, number, object, string } from "superstruct";
import { observable } from "@trpc/server/observable";
import { info, procedure, router } from "../plugin";

export const sync = router({
  push: procedure.input(array(any())).mutation(async ({ input, ctx }) => {
    info(`${ctx.name} pushed new changes.`);
    return ctx.persistence.merge(input).then();
  }),
  pull: procedure
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
