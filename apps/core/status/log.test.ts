import { object, string, StructError, validate } from "superstruct";
import { divide, err, info, ok, SilentError, wrn } from "./log";
import { clean } from "@amadeus-music/util/color";
import { expect, it, vi } from "vitest";
import { PassThrough } from "stream";
import { Console } from "console";

type Expected = ((RegExp | string) | (RegExp | string)[])[];
/** Mocks and checks console logs */
function logger(expected: Expected) {
  let reject: (_?: any) => void;
  let resolve: (_?: any) => void;

  let state = 0;
  const stream = new PassThrough();
  stream.on("data", (data) => {
    try {
      const patterns = Array.isArray(expected[state])
        ? (expected[state] as (RegExp | string)[])
        : ([expected[state]] as (RegExp | string)[]);

      patterns.forEach((x) => expect(clean(String(data))).toMatch(x));
      state += 1;
    } catch (error) {
      reject(error);
    } finally {
      if (state >= expected.length) resolve();
    }
  });
  const mock = new Console(stream);

  return [
    vi.fn((...args: any[]) => mock.info(...args)),
    new Promise((x, y) => ((resolve = x), (reject = y))),
  ] as [any, Promise<void>];
}

const time = /([0-9]{2}:?){3}/;
const trace = new RegExp(`( {4}at .*\\n){2}`);
const module = (name: string) => new RegExp(`\\[.*${name}.*\\]`);

it("prints info", async () => {
  let waiter;
  [console.info, waiter] = logger([
    [time, "|", module("CORE"), "hello"],
    [time, "|", module("MODULE"), "other"],
    [`{ hello: 123 }`],
  ]);

  info("hello");
  info.bind({ group: "module" })("other");
  info({ hello: 123 }, "hello");

  expect(console.info).toBeCalledTimes(3);

  await waiter;
});

it("prints ok", async () => {
  let waiter;
  [console.info, waiter] = logger([
    [time, "+", module("CORE"), `hello`],
    [time, "+", module("MODULE"), `other`],
    [`{ hello: 123 }`],
  ]);

  ok("hello");
  ok.bind({ group: "module" })("other");
  ok({ hello: 123 }, "hello");

  expect(console.info).toBeCalledTimes(3);

  await waiter;
});

it("prints warning", async () => {
  let waiter;
  [console.warn, waiter] = logger([
    [time, "?", module("CORE"), `hello`],
    [time, "?", module("MODULE"), `other`],
    `data <Buffer 41 41 41>`,
  ]);

  wrn("hello");
  wrn.bind({ group: "module" })("other");
  wrn("data", Buffer.from("AAA"));

  expect(console.warn).toBeCalledTimes(3);

  await waiter;
});

it("prints divider", async () => {
  let waiter;
  [console.info, waiter] = logger([
    /^============================================================\n$/,
    /^==========================Services==========================\n$/,
    /^===========================Views============================\n$/,
  ]);

  divide();
  divide("Services");
  divide("Views");

  expect(console.info).toBeCalledTimes(3);

  await waiter;
});

it("prints error", async () => {
  const message =
    `StructError: At path: name` +
    ` -- Expected a string, ` +
    `but received: 42`;
  const received = `Received:\n    {\n      "name": 42\n    }`;

  let waiter;
  [console.error, waiter] = logger([
    [time, "!", module("CORE"), `broken`, trace],
    [time, "!", module("FAIL"), `Error: failed`, trace],
    [time, "!", module("CORE"), message, received, trace],
  ]);

  err("broken");
  err.bind({ group: "fail" })(new Error("failed"));

  const [error] = validate({ name: 42 }, object({ name: string() }));
  expect(error).toBeInstanceOf(StructError);
  err(error);

  err(new SilentError());
  expect(console.error).toBeCalledTimes(3);

  await waiter;
});
