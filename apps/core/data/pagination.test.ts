import { pages } from "./pagination";
import { it, expect } from "vitest";

const objectify = <T>(x: T) => ({ data: x });

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
  await nextIs([1, 3, 5]);
  data.append(1, [2, 4, 0, 8].map(objectify));
  await nextIs([0, 1, 2]);
  data.next();
  await nextIs([3, 4, 5]);
  expect(data.current.progress).approximately(0.6, 0.1);

  data.complete(0);
  data.complete(1);
  expect(data.current.progress).toBe(1);
});
