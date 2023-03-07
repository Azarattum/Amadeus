import { cancel, thenable } from "../utils/async";
import type { Task } from "./pool.types";
import { handle } from "../utils/error";

const passthrough = Symbol();
type SomeIterator<T = any> = Iterator<T> | AsyncIterator<T>;
type Passthrough<T> = PromiseLike<T> & { [passthrough]: true };
type Iterated<T extends SomeIterator, One = false> = T extends AsyncIterator<
  infer U
>
  ? Promise<One extends true ? U : U[]>
  : T extends Iterator<infer U>
  ? One extends true
    ? U
    : U[]
  : never;

const reyield = function* <T>(item: T) {
  yield item;
};

const async = function* <T>(promise: PromiseLike<T>) {
  (promise as any)[passthrough] = true;
  const result: T = yield promise as any as Passthrough<T>;
  return result;
};

const context = {
  signal: undefined as AbortSignal | undefined,
  group: undefined as string | undefined,
  trace: [] as string[],
};
async function* wrap<T, U>(
  iterator: Iterator<T>,
  signal?: AbortSignal,
  group?: string,
  catcher?: (error: Error) => void,
  name?: string
) {
  try {
    for (let value, done; ; ) {
      signal?.throwIfAborted();

      const previous = { ...context };
      context.signal = signal;
      context.group = group;
      if (name) context.trace.push(name);
      try {
        ({ value, done } = iterator.next(value));
      } finally {
        if (name) context.trace.pop();
        context.signal = previous.signal;
        context.group = previous.group;
      }

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
  } finally {
    iterator.return?.();
  }
}

function* map<T, M = T, R = void>(
  iterator: AsyncIterator<T>,
  map?: (item: T) => Generator<M, R>
) {
  const all: R[] = [];
  for (let value, done; ; ) {
    ({ value, done } = yield* async(iterator.next()));
    if (done) return all;

    const mapped = wrap(
      (map || reyield)(value as T),
      context.signal,
      context.group
    );
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

function reuse<T>(
  generator: () => AsyncGenerator<T>,
  cache: Map<string, T[]>,
  key: string,
  limit: number
): AsyncGenerator<T> {
  if (limit <= 0) return generator();
  let cached = cache.get(key);
  if (cached) {
    return (async function* () {
      yield* cached;
    })();
  }

  cached = [];
  cache.set(key, cached);
  while (cache.size > limit) cache.delete(first(cache.keys()));
  return (async function* () {
    for await (const item of generator()) {
      cached.push(item);
      yield item;
    }
  })();
}

async function* merge<T, U>(
  iterators: SomeIterator<T>[],
  task: Partial<Task> = {}
) {
  const never = new Promise<any>(() => {});

  function next(iterator: SomeIterator<T>, index: number) {
    return Promise.resolve(iterator.next()).then((result) => ({
      index,
      result,
    }));
  }

  let completed = 0;
  function complete() {
    completed += 1;
    if (completed >= iterators.length) {
      iterators.forEach((x) => x.return?.());
      task.controller?.abort();
    }
  }
  task.tasks?.forEach(({ controller }) =>
    controller.signal.addEventListener("abort", complete, { once: true })
  );

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
      if (promises[index] !== never) iterator.return?.();
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

function first<T extends SomeIterator>(
  iterator: T,
  close = true
): Iterated<T, true> {
  if (Symbol.iterator in iterator) {
    const { value, done } = (iterator as any).next();
    if (done) throw new Error("No values to take from the iterator!");
    if (close) iterator.return?.();
    return value;
  }

  return (async () => {
    const { value, done } = await (iterator as any).next();
    if (done) throw new Error("No values to take from the iterator!");
    if (close) iterator.return?.();
    return value;
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

export { wrap, merge, take, first, async, map, context, generate, reuse };
export type { Passthrough };
