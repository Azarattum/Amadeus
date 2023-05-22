import { type Page, number } from "@amadeus-music/core";
import { procedure, router } from "../plugin";

const streams = new Map<number, () => void>();
function stream<T, U>(
  next: (_: Stream<T, U>) => void,
  pages: AsyncGenerator<Page<T>>,
  detail?: U | (() => Promise<U> | U)
) {
  const id = (Math.random() * 2 ** 32) >>> 0;
  (async () => {
    let requested = 0;
    for await (const page of pages) {
      next({
        detail: typeof detail === "function" ? await (detail as any)() : detail,
        progress: page.progress,
        results: page.items,
        page: page.number,
        id,
      });
      if (page.progress >= 1 && requested > page.number) page.next();
      else {
        streams.set(id, () => {
          if (requested === page.number) requested += 1;
          if (page.progress >= 1) page.next();
          streams.delete(id);
        });
      }
      if (page.completed) page.close();
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
