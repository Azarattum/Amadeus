import { Artist } from "@amadeus-music/protocol";
import { DB } from "../data/schema";

export const artists = ({ store }: DB) =>
  store((db) => db.selectFrom("artists").selectAll(), {
    async edit(db, id: number, artist: Partial<Artist>) {
      await db.updateTable("artists").where("id", "=", id).set(artist);
    },
    async follow(db, id: number) {
      await db
        .insertInto("following")
        .onConflict((x) => x.doNothing())
        .values({ artist: id, seen: null })
        .execute();
    },
    async unfollow(db, id: number) {
      await db.deleteFrom("following").where("artist", "=", id).execute();
    },
    get(db, id: number) {
      return db
        .selectFrom("artists")
        .where("artists.id", "=", id)
        .selectAll()
        .executeTakeFirstOrThrow();
    },
  });
