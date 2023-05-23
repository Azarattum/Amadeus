import { info, procedure, router, expand as expandOf } from "../plugin";
import type { Album, Artist, Track } from "@amadeus-music/protocol";
import { observable } from "@trpc/server/observable";
import { type Stream, stream } from "./stream";
import { number, object } from "superstruct";

const expandProcedure = procedure.input(
  object({ id: number(), page: number() })
);

export const expand = router({
  artist: expandProcedure.subscription(async ({ input: { id, page }, ctx }) => {
    const fallback = async () => ctx.cache().artists.get(id);
    const getArtist = async () =>
      ctx.persistence().artists.get(id).then(null, fallback);

    const artist = await getArtist();
    info(`${ctx.name} requested artist "${artist.title}".`);
    return observable<Stream<Track, Artist>>(({ next }) => {
      return stream(next, expandOf("artist", artist, page), fallback);
    });
  }),
  album: expandProcedure.subscription(async ({ input: { id, page }, ctx }) => {
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
