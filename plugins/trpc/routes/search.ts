import type {
  ArtistDetails,
  AlbumDetails,
  TrackDetails,
} from "@amadeus-music/protocol";
import { info, search as searchFor, procedure, router } from "../plugin";
import { observable } from "@trpc/server/observable";
import { number, object, string } from "superstruct";
import { stream, type Stream } from "./stream";

const searchProcedure = procedure.input(
  object({ query: string(), page: number() })
);

export const search = router({
  tracks: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<TrackDetails>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" tracks...`);
      return stream(next, searchFor("track", query, page));
    })
  ),
  artists: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<ArtistDetails>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" artists...`);
      return stream(next, searchFor("artist", query, page));
    })
  ),
  albums: searchProcedure.subscription(({ input: { query, page }, ctx }) =>
    observable<Stream<AlbumDetails>>(({ next }) => {
      info(`${ctx.name} is searching for "${query}" albums...`);
      return stream(next, searchFor("album", query, page));
    })
  ),
});
