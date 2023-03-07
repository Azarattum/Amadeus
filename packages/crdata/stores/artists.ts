import { DB } from "../data/schema";

export const artists = ({ store }: DB) =>
  store((db) => db.selectFrom("artists").selectAll(), {
    async get(db, id: number) {
      return db
        .selectFrom("artists")
        .where("artists.id", "=", id)
        .selectAll()
        .executeTakeFirstOrThrow();
    },
  });
