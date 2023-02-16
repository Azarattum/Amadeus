import { DB } from "../data/schema";
import { sql } from "crstore";

export const settings = ({ store }: DB) =>
  store(
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
            .addColumn("key", "text", (x) => x.primaryKey())
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
    }
  );
