import type { ExpressionBuilder } from "crstore";
import type { Schema } from "../data/schema";
import { sql } from "crstore";

const localDevice = sql<Uint8Array>`crsql_site_id()`;
const uuid = () => (Math.random() * 2 ** 32) >>> 0;
const sanitize = (query: string) =>
  query
    .replace(/-/g, " ")
    .split(/\s+/g)
    .map((x) => `"${x.replace(/"/g, '""')}"`)
    .join(" ");

const position = {
  random: (ids: number[]) => (qb: ExpressionBuilder<Schema, "playback">) =>
    qb
      .selectFrom((qb) =>
        qb
          .selectFrom("queue")
          .select(["id", "position"])
          .$if(!!ids.length, (qb) =>
            qb.unionAll(
              sql<any>`VALUES ${sql.raw(ids.map((x) => `(${x}, 1)`).join(","))}`,
            ),
          )
          .unionAll(
            sql<any>`SELECT null,1 WHERE NOT EXISTS (SELECT 1 FROM queue WHERE position >= 0)`,
          )
          .as("data"),
      )
      .select("id")
      .where("position", ">=", 0)
      .orderBy(sql`random()`)
      .limit(1),
  shift: (id: number) => (qb: ExpressionBuilder<Schema, "playback">) =>
    qb
      .selectFrom("queue")
      .select("id")
      .whereRef(
        (qb) =>
          qb
            .selectFrom("queue")
            .select(sql`position + 1`.as("position"))
            .where("id", "=", id),
        "=",
        "position",
      )
      .limit(1),
  last: (qb: ExpressionBuilder<Schema, "playback">) =>
    qb
      .selectFrom("playback")
      .select("id")
      .where("device", "=", localDevice)
      .orderBy("order", "desc")
      .orderBy("id", "desc")
      .limit(1),
  next: (qb: ExpressionBuilder<Schema, "playback">) =>
    qb
      .selectFrom("devices")
      .select("playback")
      .where("id", "=", localDevice)
      .limit(1),
  before: (qb: ExpressionBuilder<Schema, "playback">) =>
    qb.selectFrom("queue").select("id").where("position", "=", 1).limit(1),
  first: null,
};

export { localDevice, sanitize, position, uuid };
