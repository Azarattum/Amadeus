import { integer, object, record, string, Struct } from "@amadeus-music/core";

const action = <T extends string>(type: T) =>
  object<{ [K in T]: Struct<number, null> }>({
    [type]: integer(),
  } as any);

const artist = object({
  artist: integer(),
  track: integer(),
});

const query = record(string(), integer());

export { action, artist, query };
