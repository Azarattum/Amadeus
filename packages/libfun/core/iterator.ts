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

async function* wrap<T, U>(iterator: SomeIterator<T>, signal?: AbortSignal) {
  for (let value, done; ; ) {
    ({ value, done } = await cancelable(iterator.next(value), signal));
    if (done) return value as U;
    if (!thenable(value)) yield value as T;
    else {
      const skip = passable(value);
      value = await cancelable(value, signal);
      if (!skip) yield value as Awaited<T>;
    }
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
    /// Can it really be aborted?     ↓ signal here might be nice
    const mapped = wrap(map(value as T));
    for (let value, done; !done; ) {
      ({ value, done } = yield* async(mapped.next()));
      if (done) all.push(value as R);
      else yield value as M;
    }
  }
}

function cancelable<T>(promise: T, signal?: AbortSignal) {
  const cancel = new Promise<void>((_, reject) => {
    const remove = () => signal?.removeEventListener("abort", abort);
    function abort() {
      reject(new DOMException("This operation was aborted", "AbortError"));
      remove();
    }

    if (signal?.aborted) return abort();
    Promise.resolve(promise).then(remove, remove);
    signal?.addEventListener("abort", abort);
  });

  return Promise.race([promise, cancel]) as T;
}

function thenable<T = unknown>(value: any): value is PromiseLike<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "then" in value &&
    typeof value["then"] === "function"
  );
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

function all<T extends SomeIterator>(
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
  resolve: () => T
) {
  const ready = condition();
  if (ready === true) return resolve();

  const blocking = new Promise<void>(function poll(resolve) {
    const ready = condition();
    if (ready === true) resolve();
    else setTimeout(() => poll(resolve), ready);
  });

  return (async function* () {
    await blocking;
    yield* resolve();
  })();
}

export { wrap, merge, all, block, async, thenable, map };
export type { Passthrough };
