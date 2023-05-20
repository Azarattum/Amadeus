import { info, search as searchFor, procedure, router } from "../plugin";
import type { Artist, Album, Track } from "@amadeus-music/protocol";
import { observable } from "@trpc/server/observable";
import { number, object, string } from "superstruct";
import { stream, type Stream } from "./stream";

const searchProcedure = procedure.input(
  object({ query: string(), page: number() })
);

export const search = router({
  tracks: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<Track>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" tracks...`);
      return stream(next, searchFor("track", query, page));
    })
  ),
  artists: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<Artist>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" artists...`);
      return stream(next, searchFor("artist", query, page));
    })
  ),
  albums: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<Album>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" albums...`);
      return stream(next, searchFor("album", query, page));
    })
  ),
});
