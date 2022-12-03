import { delay } from "@amadeus-music/util/throttle";
import { expect, it } from "vitest";
import { cache, invalidate } from "./cache";
import { identify } from "./identity";

it("caches", () => {
  const object = {};
  const key = identify(JSON.stringify(object));
  cache(key, object);

  expect(cache(key)).toBe(object);
  invalidate(key);
  expect(cache(key)).toBe(undefined);
});

it("automatically invalidates", async () => {
  const object = {};
  const key = identify(JSON.stringify(object));
  cache(key, object, { lifetime: 1 });

  expect(cache(key)).toBe(object);
  await delay(2);
  expect(cache(key)).toBe(undefined);
});
