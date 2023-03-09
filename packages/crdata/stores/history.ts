import { DB } from "../data/schema";

export const history = ({ store }: DB) =>
  store((db) => db.selectFrom("history").selectAll(), {
    async log(db, query: string) {
      await db
        .insertInto("history")
        .onConflict((x) => x.doUpdateSet({ date: Date.now() }))
        .values({ query, date: Date.now() })
        .execute();
    },
    async clear(db) {
      await db.deleteFrom("history").execute();
    },
    get(db) {
      return db
        .selectFrom("history")
        .selectAll()
        .orderBy("date", "desc")
        .execute();
    },
  });
