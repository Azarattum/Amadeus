import { album, source, asset, artist } from "../operations/cte";
import type { Album } from "@amadeus-music/protocol";
import { pushAlbums } from "../operations/push";
import { sanitize } from "../operations/utils";
import type { DB } from "../data/schema";

export const albums = ({ store }: DB) =>
  store(
    (db) =>
      db
        .with("source", source)
        .with("asset", asset)
        .with("artist", artist)
        .with("album", album)
        .selectFrom("album")
        .selectAll()
        .orderBy("album.title"),
    {
      async push(db, albums: Album[]) {
        await pushAlbums(db, albums);
      },
      async search(db, query: string, limit = 10, offset = 0) {
        if (!query) return [];
        return db
          .with("source", source)
          .with("asset", asset)
          .with("artist", artist)
          .with("album", album)
          .selectFrom("albums_fts" as any)
          .where("albums_fts", "match", sanitize(query))
          .orderBy("rank")
          .innerJoin("album", "album.id", "albums_fts.rowid")
          .selectAll()
          .limit(limit)
          .offset(offset)
          .$castTo<Album>()
          .execute();
      },
      get(db, id: number) {
        return db
          .with("source", source)
          .with("asset", asset)
          .with("artist", artist)
          .with("album", album)
          .selectFrom("album")
          .selectAll()
          .where("album.id", "=", id)
          .$castTo<Album>()
          .executeTakeFirstOrThrow();
      },
    }
  );
