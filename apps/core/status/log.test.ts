import { bright, green, red, reset, yellow } from "@amadeus/util/color";
import { object, string, StructError, validate } from "superstruct";
import { divide, err, info, ok, SilentError, wrn } from "./log";
import { rescape } from "@amadeus/util/string";
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

      patterns.forEach((x) => expect(String(data)).toMatch(x));
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
const trace = new RegExp(`(${rescape(red)} {4}at .*\\n){2}`);
const module = (name: string) => new RegExp(`\\[.*${name}.*\\]`);

it("prints info", async () => {
  let waiter;
  [console.info, waiter] = logger([
    [time, "|", module("CORE"), bright, "hello"],
    [time, "|", module("MODULE"), bright, "other"],
    [`${reset}{ hello: 123 }`],
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
    [time, "+", module("CORE"), bright, `${green}hello`],
    [time, "+", module("MODULE"), bright, `${green}other`],
    [`${green}{ hello: 123 }`],
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
    [time, "?", module("CORE"), `${yellow}hello`],
    [time, "?", module("MODULE"), `${yellow}other`],
    `${yellow}data${reset} ${yellow}<Buffer 41 41 41>${reset}`,
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
    `${red}StructError: At path: ${bright}name${reset}${red}` +
    ` -- Expected a ${bright}string${reset}${red}, ` +
    `but received: ${bright}42${reset}${red}`;
  const received =
    `${red}Received:\n` +
    `${red}    {\n` +
    `${red}      "name": ${bright}42${reset}${red}\n` +
    `${red}    }`;

  let waiter;
  [console.error, waiter] = logger([
    [time, "!", module("CORE"), `${red}broken`, trace],
    [time, "!", module("FAIL"), `${red}Error: failed`, trace],
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
