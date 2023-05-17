import {
  Album,
  ArtistDetails,
  TrackDetails,
  Unique,
} from "@amadeus-music/protocol";
import { info, procedure, router, expand as expandOf } from "../plugin";
import { observable } from "@trpc/server/observable";
import { number, object } from "superstruct";
import { Stream, stream } from "./stream";

const expandProcedure = procedure.input(
  object({ id: number(), page: number() })
);

export const expand = router({
  artist: expandProcedure.subscription(async ({ input: { id, page }, ctx }) => {
    const artist = await ctx.cache().artists.get(id);
    info(`${ctx.name} requested artist "${artist.title}".`);
    return observable<Stream<TrackDetails, ArtistDetails>>(({ next }) => {
      return stream(next, expandOf("artist", artist, page), artist);
    });
  }),
  album: expandProcedure.subscription(async ({ input: { id, page }, ctx }) => {
    const album = await ctx.cache().albums.get(id);
    info(`${ctx.name} requested album "${album.title}".`);
    return observable<Stream<TrackDetails, Unique<Album>>>(({ next }) => {
      return stream(next, expandOf("album", album, page), album);
    });
  }),
});
