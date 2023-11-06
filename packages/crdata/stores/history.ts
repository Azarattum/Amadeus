import type { DB } from "../data/schema";

export const history = ({ replicated }: DB) =>
  replicated((db) => db.selectFrom("history").orderBy("date", "desc").selectAll(), {
    async log(db, query: string) {
      if (!query.trim()) return;
      await db
        .insertInto("history")
        .onConflict((x) => x.doUpdateSet({ date: Date.now() }))
        .values({ date: Date.now(), query })
        .execute();
    },
    get(db) {
      return db
        .selectFrom("history")
        .selectAll()
        .orderBy("date", "desc")
        .execute();
    },
    async clear(db) {
      await db.deleteFrom("history").execute();
    },
  });
