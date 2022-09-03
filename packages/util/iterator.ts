type SomeIterator<T> = Iterator<T> | AsyncIterator<T>;

async function* wrap<T, U>(iterator: SomeIterator<T>) {
  for (let value, done; ; ) {
    ({ value, done } = await iterator.next(value));
    if (done) return value as U;
    if (typeof value !== "object" || !("then" in value)) yield value as T;
    value = await value;
  }
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

export { wrap, merge };
