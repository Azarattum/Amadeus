import { expect, it } from "vitest";
import { wrap } from ".";

it("wraps values", () => {
  function broken(): number {
    throw 13;
  }
  function fine(arg: number) {
    return 42 + arg;
  }

  const a = wrap(broken)();
  const b = wrap(fine)(42);
  expect(a.expose().error).toEqual(new Error("13"));
  expect(b.expose().data).toBe(84);
});

it("wraps promises", () => {
  async function broken(): Promise<number> {
    throw 13;
  }
  async function fine(arg: number) {
    return 42 + arg;
  }

  const a = wrap(broken)();
  const b = wrap(fine)(42);
  expect(a.expose()).resolves.toEqual({ error: new Error("13") });
  expect(b.expose()).resolves.toEqual({ data: 84 });
});
