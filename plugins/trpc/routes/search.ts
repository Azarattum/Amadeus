import type {
  ArtistDetails,
  AlbumDetails,
  TrackDetails,
  Uniqueified,
} from "@amadeus-music/protocol";
import { info, search as searchFor, procedure, router } from "../plugin";
import { observable } from "@trpc/server/observable";
import { number, object, string } from "superstruct";
import type { Page } from "@amadeus-music/core";

type SearchResult<T> = {
  id: number;
  page: number;
  results: T[];
  progress: number;
};
const searchProcedure = procedure.input(
  object({ query: string(), page: number() })
);

export const search = router({
  tracks: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<SearchResult<TrackDetails>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" tracks...`);
      return startSearch(next, searchFor("track", query, page));
    })
  ),
  artists: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<SearchResult<ArtistDetails>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" artists...`);
      return startSearch(next, searchFor("artist", query, page));
    })
  ),
  albums: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<SearchResult<AlbumDetails>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" albums...`);
      return startSearch(next, searchFor("album", query, page));
    })
  ),
  next: procedure.input(number()).mutation(({ input }) => {
    searches.get(input)?.();
  }),
});

const searches = new Map<number, () => void>();
function startSearch<T>(
  next: (_: SearchResult<Uniqueified<T>>) => void,
  pages: AsyncGenerator<Page<T>>
) {
  const id = (Math.random() * 2 ** 32) >>> 0;
  (async () => {
    for await (const page of pages) {
      next({
        id,
        page: page.number,
        results: page.items,
        progress: page.progress,
      });
      searches.set(id, async () => {
        await page.loaded;
        page.next();
      });
    }
  })();
  return () => (pages as any).executor.controller.abort();
}
