import type { MediaBase } from "@amadeus-music/protocol";
import { source, asset } from "../operations/cte";
import type { DB } from "../data/schema";
import { sql } from "crstore";

export const resources = ({ replicated }: DB) =>
  replicated(
    (db) =>
      db
        .with("source", source)
        .with("asset", asset)
        .selectFrom("source")
        .leftJoin("asset", "asset.owner", "source.owner")
        .select([
          (qb) => qb.fn.coalesce("asset.arts", qb.val("[]")).as("arts"),
          (qb) =>
            qb.fn.coalesce("asset.thumbnails", qb.val("[]")).as("thumbnails"),
          (qb) => qb.fn.coalesce("source.sources", qb.val("[]")).as("sources"),
        ])
        .$castTo<MediaBase>(),
    {
      async prioritize(db, type: "art" | "source", resource: string) {
        const table = type === "art" ? "assets" : "sources";
        await db
          .updateTable(table)
          .set({ primary: sql`${sql.ref(type)} = ${resource}` })
          .where("owner", "=", (qb) =>
            qb.selectFrom(table).where(type, "=", resource).select("owner"),
          )
          .execute();
      },
      get(db, owner: number) {
        return db
          .with("source", source)
          .with("asset", asset)
          .selectFrom("source")
          .leftJoin("asset", "asset.owner", "source.owner")
          .select([
            (qb) => qb.fn.coalesce("asset.arts", qb.val("[]")).as("arts"),
            (qb) =>
              qb.fn.coalesce("asset.thumbnails", qb.val("[]")).as("thumbnails"),
            (qb) =>
              qb.fn.coalesce("source.sources", qb.val("[]")).as("sources"),
          ])
          .where("source.owner", "=", owner)
          .$castTo<MediaBase>()
          .executeTakeFirstOrThrow();
      },
    },
  );
