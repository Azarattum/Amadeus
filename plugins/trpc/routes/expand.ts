import { info, procedure, router, expand as expandOf } from "../plugin";
import { Album, Artist, Track } from "@amadeus-music/protocol";
import { observable } from "@trpc/server/observable";
import { number, object } from "superstruct";
import { Stream, stream } from "./stream";

const expandProcedure = procedure.input(
  object({ id: number(), page: number() })
);

export const expand = router({
  artist: expandProcedure.subscription(async ({ input: { id, page }, ctx }) => {
    const getArtist = async () => ctx.cache().artists.get(id);
    const artist = await getArtist();
    info(`${ctx.name} requested artist "${artist.title}".`);
    return observable<Stream<Track, Artist>>(({ next }) => {
      return stream(next, expandOf("artist", artist, page), getArtist);
    });
  }),
  album: expandProcedure.subscription(async ({ input: { id, page }, ctx }) => {
    const getAlbum = async () => ctx.cache().albums.get(id);
    const album = await getAlbum();
    info(`${ctx.name} requested album "${album.title}".`);
    return observable<Stream<Track, Album>>(({ next }) => {
      return stream(next, expandOf("album", album, page), getAlbum);
    });
  }),
});
