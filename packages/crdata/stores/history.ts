import { DB } from "../data/schema";

export const history = ({ store }: DB) =>
  store((db) => db.selectFrom("history").selectAll(), {
    async log(db, query: string) {
      await db
        .insertInto("history")
        .onConflict((x) => x.doUpdateSet({ query }))
        .values({ query, date: Date.now() })
        .execute();
    },
  });
