import { delay } from "@amadeus-music/util/throttle";
import { it, vi, expect } from "vitest";
import { pages } from "./pagination";

const objectify = <T>(x: T) => ({ data: x });

it("appends pages", async () => {
  const calls: any[] = [];
  const spy = vi.fn((x) => calls.push(x.map((y: any) => y.data)));

  const data = pages(["a", "b"], {
    compare: (a: any, b: any) => a.data - b.data,
    page: 3,
    update: spy,
  });
  data.append(0, [1, 5, 3].map(objectify));
  await delay(10);
  data.append(1, [2, 4, 0, 8].map(objectify));
  await delay(10);

  expect(spy).toHaveBeenCalledTimes(2);
  expect(calls).toEqual([
    [1, 3, 5],
    [0, 1, 2],
  ]);

  data.next();
  await delay(10);
  expect(spy).toHaveBeenCalledTimes(3);
  expect(calls[2]).toEqual([3, 4, 5]);
  expect(data.current.progress).approximately(0.6, 0.1);

  data.complete(0);
  data.complete(1);
  await delay(10);
  expect(data.current.progress).toBe(1);
});
