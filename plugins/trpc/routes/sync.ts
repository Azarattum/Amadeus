import { observable } from "@trpc/server/observable";
import { number, object, string } from "superstruct";
import { info, procedure, router } from "../plugin";

export const sync = router({
  push: procedure.input(string()).mutation(async ({ input, ctx }) => {
    return ctx.persistence().merge(input).then();
  }),
  pull: procedure
    .input(object({ version: number(), client: string() }))
    .subscription(({ input, ctx }) =>
      observable<string>(({ next }) => {
        info(`${ctx.name} subscribed to database changes.`);
        const promise = ctx.persistence().subscribe(["*"], next, input).then();
        return async () => {
          info(`${ctx.name} unsubscribed from database changes.`);
          (await promise)();
        };
      }),
    ),
});
