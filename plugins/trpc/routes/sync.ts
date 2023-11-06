import { observable } from "@trpc/server/observable";
import { number, object, string } from "superstruct";
import { procedure, router, info } from "../plugin";

export const sync = router({
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
  push: procedure.input(string()).mutation(async ({ input, ctx }) => {
    return ctx.persistence().merge(input).then();
  }),
});
