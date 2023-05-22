import type { MediaBase } from "@amadeus-music/protocol";
import { resource } from "../operations/cte";
import type { DB } from "../data/schema";
import { sql } from "crstore";

export const resources = ({ store }: DB) =>
  store(
    (db) => db.with("resource", resource).selectFrom("resource").selectAll(),
    {
      async prioritize(db, type: "art" | "source", resource: string) {
        const table = type === "art" ? "assets" : "sources";
        await db
          .updateTable(table)
          .set({ primary: sql`${sql.ref(type)} = ${resource}` })
          .where("owner", "=", (qb) =>
            qb.selectFrom(table).where(type, "=", resource).select("owner")
          )
          .execute();
      },
      get(db, owner: number) {
        return db
          .with("resource", resource)
          .selectFrom("resource")
          .select(["sources", "arts", "thumbnails"])
          .where("owner", "=", owner)
          .$castTo<MediaBase>()
          .executeTakeFirstOrThrow();
      },
    }
  );
