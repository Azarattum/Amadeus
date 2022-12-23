import { delay } from "@amadeus-music/util/throttle";
import { aggregate, aggregator } from "./aggregate";
import { expect, it, vi } from "vitest";
import { async, pools } from "libfun";

const { pool } = pools();

it("aggregates pool", async () => {
  type Data = { data: number };
  const event = pool<(data: number) => Data>("event");
  event.bind({ group: "a" })(function* (number) {
    yield { data: number + 1 };
    yield { data: number + 2 };
  });
  event.bind({ group: "b" })(function* (number) {
    yield* async(delay(1));
    yield { data: number * 1 };
    yield* async(delay(30));
    yield { data: number * 2 };
    yield { data: number * 3 };
  });

  let calls: any[] = [];
  const spy = vi.fn((x, z) => calls.push([x.map((y: any) => y.data), z]));

  const id = aggregate(event, [123])({
    compare: (a, b) => a.data - b.data,
    update: spy,
    page: 4,
  });
  await delay(64);
  expect(spy).toHaveBeenCalledTimes(3);
  expect(calls).toEqual([
    [[124, 125], 0.5],
    [[123, 124, 125], 0.625],
    [[123, 124, 125, 246], 1],
  ]);

  calls = [];
  aggregator(id).next();
  await delay(10);
  expect(spy).toHaveBeenCalledTimes(4);
  expect(calls).toEqual([[[369], 1]]);

  event.close();
});
