import { album, resource, artist } from "../operations/cte";
import { Album } from "@amadeus-music/protocol";
import { sanitize } from "../operations/utils";
import { pushAlbum } from "../operations/push";
import type { DB } from "../data/schema";

export const albums = ({ store }: DB) =>
  store(
    (db) =>
      db
        .with("resource", resource)
        .with("artist", artist)
        .with("album", album)
        .selectFrom("album")
        .selectAll()
        .orderBy("album.title"),
    {
      async push(db, albums: Album[]) {
        await Promise.all(albums.map((x) => pushAlbum(db, x)));
      },
      async search(db, query: string) {
        if (!query) return [];
        return db
          .with("resource", resource)
          .with("artist", artist)
          .with("album", album)
          .selectFrom("albums_fts" as any)
          .where("albums_fts", "match", sanitize(query))
          .orderBy("rank")
          .innerJoin("album", "album.id", "albums_fts.rowid")
          .selectAll()
          .execute();
      },
      get(db, id: number) {
        return db
          .with("resource", resource)
          .with("artist", artist)
          .with("album", album)
          .selectFrom("album")
          .selectAll()
          .where("album.id", "=", id)
          .executeTakeFirstOrThrow();
      },
    }
  );
