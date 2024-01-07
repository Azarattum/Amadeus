import type { DB } from "../data/schema";
import { sql } from "crstore";

export const settings = ({ replicated }: DB) =>
  replicated(
    (db) =>
      db
        .selectFrom("settings")
        .select(["key", sql`json_extract(value, '$')`.as("value")]),
    {
      async store(db, key: string, value: unknown, collection = "settings") {
        if (collection !== "settings") {
          await db.schema
            .createTable(collection)
            .ifNotExists()
            .addColumn("key", "text", (x) => x.primaryKey().notNull())
            .addColumn("value", "text")
            .execute();
          await db.schema
            .createIndex(collection + "_value")
            .ifNotExists()
            .on(collection)
            .column("value")
            .execute();
        }
        await db
          .insertInto(collection as any)
          .onConflict((x) => x.doUpdateSet({ value: JSON.stringify(value) }))
          .values({ key, value: JSON.stringify(value) })
          .execute();
      },
      async extract(db, key: string, collection = "settings") {
        return db
          .selectFrom(collection as any)
          .select("value")
          .where("key", "=", key)
          .executeTakeFirstOrThrow()
          .then((x) => JSON.parse(x.value));
      },
      async lookup(db, value: unknown, collection = "settings") {
        return db
          .selectFrom(collection as any)
          .select("key")
          .where("value", "=", JSON.stringify(value))
          .executeTakeFirstOrThrow()
          .then((x) => x.key);
      },
    },
  );
