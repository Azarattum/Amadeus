import { cancel, thenable } from "../utils/promise";
import { handle } from "../utils/error";

const passthrough = Symbol();
type SomeIterator<T = any> = Iterator<T> | AsyncIterator<T>;
type Passthrough<T> = PromiseLike<T> & { [passthrough]: true };
type Iterated<T extends SomeIterator> = T extends AsyncIterator<infer U>
  ? Promise<U[]>
  : T extends Iterator<infer U>
  ? U[]
  : never;

const async = function* <T>(promise: PromiseLike<T>) {
  (promise as any)[passthrough] = true;
  const result: T = yield promise as any as Passthrough<T>;
  return result;
};

const context = { signal: undefined as AbortSignal | undefined };
async function* wrap<T, U>(
  iterator: Iterator<T>,
  signal?: AbortSignal,
  catcher?: (error: Error) => void
) {
  try {
    for (let value, done; ; ) {
      signal?.throwIfAborted();
      const previous = context.signal;
      context.signal = signal;
      /// Consider creating a pool stack for error reporting, like `init -> search -> load -> fetch [ERROR!]`
      ({ value, done } = iterator.next(value));
      context.signal = previous;

      if (done) return value as U;
      if (!thenable(value)) yield value as T;
      else {
        const skip = passable(value);
        value = await cancel(value, signal);
        if (!skip) yield value as Awaited<T>;
      }
    }
  } catch (error) {
    handle(error, catcher);
  }
}

function* map<T, M, R>(
  iterator: AsyncIterator<T>,
  map: (item: T) => Generator<M, R>
) {
  const all: R[] = [];
  for (let value, done; ; ) {
    ({ value, done } = yield* async(iterator.next()));
    if (done) return all;

    const mapped = wrap(map(value as T), context.signal);
    for (let value, done; !done; ) {
      ({ value, done } = yield* async(mapped.next()));
      if (done) all.push(value as R);
      else yield value as M;
    }
  }
}

function generate<T>(
  value: T
): T extends Generator<any> ? T : Generator<T, void> {
  if (value && typeof value === "object" && Symbol.iterator in value) {
    return value as any;
  }
  return (function* () {
    yield value;
  })() as any;
}

function passable(value: any) {
  return (
    value !== null &&
    typeof value === "object" &&
    passthrough in value &&
    value[passthrough] === true
  );
}

async function* merge<T, U>(...iterators: SomeIterator<T>[]) {
  const never = new Promise<any>(() => {});

  function next(iterator: SomeIterator<T>, index: number) {
    return Promise.resolve(iterator.next()).then((result) => ({
      index,
      result,
    }));
  }

  const results: U[] = [];
  const promises = iterators.map(next);
  try {
    let { length } = iterators;
    while (length) {
      const { index, result } = await Promise.race(promises);
      if (result.done) {
        promises[index] = never;
        results[index] = result.value;
        length--;
      } else {
        promises[index] = next(iterators[index], index);
        yield result.value;
      }
    }
  } finally {
    for (const [index, iterator] of iterators.entries())
      if (promises[index] !== never) iterator.return?.(null as any);
  }
  return results;
}

function take<T extends SomeIterator>(
  iterator: T,
  limit = Infinity
): Iterated<T> {
  if (Symbol.iterator in iterator) {
    let i = 0;
    const array = [];
    for (const x of iterator as any) {
      array.push(x);
      if (++i >= limit) break;
    }
    return array as any;
  }

  return (async () => {
    let i = 0;
    const array = [];
    for await (const x of iterator as any) {
      array.push(x);
      if (++i >= limit) break;
    }
    return array;
  })() as any;
}

function block<T extends AsyncGenerator>(
  condition: () => true | number,
  resolve: () => T,
  catcher?: (error: Error) => void
) {
  try {
    const ready = condition();
    if (ready === true) return resolve();

    const blocking = new Promise<void>(function poll(resolve) {
      const ready = condition();
      if (ready === true) resolve();
      else setTimeout(() => poll(resolve), ready);
    });

    return (async function* () {
      try {
        await blocking;
        yield* resolve();
      } catch (error) {
        handle(error, catcher);
      }
    })();
  } catch (error) {
    return handle(error, catcher, (async function* () {})());
  }
}

export { wrap, merge, take, block, async, map, context, generate };
export type { Passthrough };
