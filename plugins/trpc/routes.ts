import {
  any,
  array,
  literal,
  number,
  object,
  string,
  union,
} from "superstruct";
import type { TrackDetails } from "@amadeus-music/protocol";
import { observable } from "@trpc/server/observable";
import { TRPCError, initTRPC } from "@trpc/server";
import { info, loaders, search } from "./plugin";
import { Context } from "./context";

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
  search: procedure
    .use(auth)
    .input(
      object({
        type: union([literal("track")]),
        query: string(),
        page: number(),
      })
    )
    .subscription(({ input: { type, query, page }, ctx }) =>
      /// TODO: support arbitrary results (inferred from search type)
      observable<{ id: number; results: TrackDetails[] }>(({ next }) => {
        info(`${ctx.name} is searching for "${query}"...`);
        const id = (Math.random() * 2 ** 32) >>> 0;
        const pages = search(type, query, page);
        (async () => {
          /// TODO: this is messy, it needs a rewrite
          for await (const page of pages) {
            next({
              id,
              results: page.pages.flatMap((x) => x.items as TrackDetails[]),
            });
            loaders.set(id, async () => {
              await page.loaded;
              page.next();
            });
          }
        })();
        return () => pages.executor.controller.abort();
      })
    ),
  next: procedure
    .use(auth)
    .input(number())
    .mutation(({ input }) => {
      loaders.get(input)?.();
    }),
});

export { app };
export type App = typeof app;
