import { type Mapped, async, first, pools } from "libfun";
import { delay } from "@amadeus-music/util/async";
import type { Page } from "../data/pagination";
import { aggregate } from "./aggregate";
import { expect, it } from "vitest";

const { pool } = pools();

it("aggregates pool", async () => {
  type Data = { title: string };
  const event = pool<
    (a: string, b: string, c: number) => Mapped<Data, Page<Data>>
  >("search", {
    transform: aggregate,
  });
  event.bind({ group: "a" })(function* (a) {
    yield { title: (+a + 1).toString() };
    yield { title: (+a + 2).toString() };
  });
  event.bind({ group: "b" })(function* (a) {
    yield* async(delay(10));
    yield { title: (+a * 1).toString() };
    yield* async(delay(300));
    yield { title: (+a * 2).toString() };
    yield { title: (+a * 3).toString() };
  });

  const generator = event("123", "123", 4);
  let page = await first(generator, false);
  expect(page.progress).toBe(0.5);
  expect(page.items).toMatchObject([{ title: "124" }, { title: "125" }]);

  page = await first(generator, false);
  expect(page.progress).toBe(0.625);
  expect(page.items).toMatchObject([
    { title: "123" },
    { title: "124" },
    { title: "125" },
  ]);

  page = await first(generator, false);
  expect(page.progress).toBe(1);
  expect(page.items).toMatchObject([
    { title: "123" },
    { title: "124" },
    { title: "125" },
    { title: "246" },
  ]);

  page.next();
  expect(await first(generator, false)).toMatchObject({
    items: [{ title: "369" }],
    progress: 1,
  });
  expect(event.status().executing.size).toBe(1);
  page.close();
  expect(event.status().executing.size).toBe(0);
  event.close();
});
