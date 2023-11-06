import { search as searchFor, procedure, router, info } from "../plugin";
import type { Artist, Album, Track } from "@amadeus-music/protocol";
import { observable } from "@trpc/server/observable";
import { number, object, string } from "superstruct";
import { type Stream, stream } from "./stream";

const searchProcedure = procedure.input(
  object({ query: string(), page: number() }),
);

export const search = router({
  artists: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<Artist>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" artists...`);
      return stream(next, searchFor("artist", query, page));
    }),
  ),
  tracks: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<Track>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" tracks...`);
      return stream(next, searchFor("track", query, page));
    }),
  ),
  albums: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<Album>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" albums...`);
      return stream(next, searchFor("album", query, page));
    }),
  ),
});
