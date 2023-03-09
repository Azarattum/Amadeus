import { Artist } from "@amadeus-music/protocol";
import { DB } from "../data/schema";

export const artists = ({ store }: DB) =>
  store((db) => db.selectFrom("artists").selectAll(), {
    async edit(db, id: number, artist: Partial<Artist>) {
      await db.updateTable("artists").where("id", "=", id).set(artist);
    },
    get(db, id: number) {
      return db
        .selectFrom("artists")
        .where("artists.id", "=", id)
        .selectAll()
        .executeTakeFirstOrThrow();
    },
  });
