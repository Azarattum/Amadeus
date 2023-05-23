import { pages } from "./pagination";
import { it, expect } from "vitest";

const objectify = <T>(x: T) => ({ title: String(x) });

it("appends pages", async () => {
  const data = pages(["a", "b"], {
    compare: (a: any, b: any) => a.data - b.data,
    page: 3,
  });
  const generator = data.values();
  const nextIs = async (expected: number[]) =>
    expect((await generator.next()).value?.items).toMatchObject(
      expected.map(objectify)
    );

  data.append(0, [1, 5, 3].map(objectify));
  await nextIs([1, 5, 3]);
  data.append(1, [2, 4, 0, 8].map(objectify));
  await nextIs([2, 4, 0]);
  data.next();
  await nextIs([8, 1, 5]);
  expect(data.current.progress).approximately(0.6, 0.1);

  data.complete(0);
  data.complete(1);
  expect(data.current.progress).toBe(1);
});
