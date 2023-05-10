import { Uniqueified } from "@amadeus-music/protocol";
import { Page, number } from "@amadeus-music/core";
import { procedure, router } from "../plugin";

const streams = new Map<number, () => void>();
function stream<T, U>(
  next: (_: Stream<Uniqueified<T>, U>) => void,
  pages: AsyncGenerator<Page<T>>,
  detail?: U
) {
  const id = (Math.random() * 2 ** 32) >>> 0;
  (async () => {
    for await (const page of pages) {
      next({
        progress: page.progress,
        results: page.items,
        page: page.number,
        detail,
        id,
      });
      streams.set(id, async () => {
        await page.loaded;
        page.next();
      });
    }
  })();
  return () => (pages as any).executor.controller.abort();
}

const next = router({
  next: procedure.input(number()).mutation(({ input }) => {
    streams.get(input)?.();
  }),
});

type Stream<T, U = undefined> = {
  id: number;
  detail?: U;
  page: number;
  results: T[];
  progress: number;
};

export { stream, next };
export type { Stream };
