import { expand as expandOf, procedure, router, info } from "../plugin";
import type { Artist, Album, Track } from "@amadeus-music/protocol";
import { observable } from "@trpc/server/observable";
import { type Stream, stream } from "./stream";
import { number, object } from "superstruct";

const expandProcedure = procedure.input(
  object({ page: number(), id: number() }),
);

export const expand = router({
  artist: expandProcedure.subscription(async ({ input: { page, id }, ctx }) => {
    const fallback = async () => ctx.cache().artists.get(id);
    const getArtist = async () =>
      ctx.persistence().artists.get(id).then(null, fallback);

    const artist = await getArtist();
    info(`${ctx.name} requested artist "${artist.title}".`);
    return observable<Stream<Track, Artist>>(({ next }) => {
      return stream(next, expandOf("artist", artist, page), fallback);
    });
  }),
  album: expandProcedure.subscription(async ({ input: { page, id }, ctx }) => {
    const fallback = async () => ctx.cache().albums.get(id);
    const getAlbum = async () =>
      ctx.persistence().albums.get(id).then(null, fallback);

    const album = await getAlbum();
    info(`${ctx.name} requested album "${album.title}".`);
    return observable<Stream<Track, Album>>(({ next }) => {
      return stream(next, expandOf("album", album, page), fallback);
    });
  }),
});
