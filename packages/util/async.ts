type Func = (..._: any) => any;
const raf =
  (globalThis as any).requestAnimationFrame ||
  ((x: () => void) => setTimeout(x, 16.66));

/**
 * Returns a throttled function with respect to animation frames or a specified delay.
 * Typically used to throttle executions of input events handlers.
 *
 * Example:
 * ```
 * addEventListener("pointermove", throttle(handler));
 * ```
 */
export function throttle<T extends Func>(func: T, delay?: number) {
  let id: number;
  let context: any;
  let parameters: any;
  let time = Date.now() - (delay || 0 + 1);

  function callId() {
    func.apply(context, parameters);
    id = 0;
  }

  function callTime() {
    func.apply(context, parameters);
    time = Date.now();
  }

  if (delay === undefined) {
    return function (this: any, ...args: any) {
      context = this;
      parameters = args;

      if (id) return;
      id = raf(callId);
    } as T;
  } else {
    return function (this: any, ...args: any) {
      context = this;
      parameters = args;

      clearTimeout(id);
      id = +setTimeout(callTime, delay - (Date.now() - time));
    } as T;
  }
}

/**
 * Returns a debounced function.
 *
 * Example:
 * ```
 * addEventListener("input", debounce(handler, 200));
 * ```
 */
export function debounce<T extends Func>(func: T, delay = 300) {
  let id: number;
  return function (this: any, ...args: any) {
    clearTimeout(id);
    id = +setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as T;
}

/**
 * Provides a promise-based delay using setTimeout function.
 * @param duration Delay duration
 */
export function delay(duration: number) {
  if (duration === Infinity) return new Promise<void>(() => {});
  return new Promise<void>((resolve) => setTimeout(resolve, duration));
}

/**
 * Creates an asynchronous lock that can be waited
 * from multiple places and resolved at any moment.
 */
export function lock() {
  let resolved = false;
  const resolves = new Set<() => void>();
  const wait = () =>
    new Promise<void>((r) =>
      resolved ? (r(), (resolved = false)) : resolves.add(r)
    );
  const resolve = () => {
    if (!resolves.size) return (resolved = true);
    resolves.forEach((x) => x());
    resolves.clear();
  };
  return { wait, resolve };
}

/**
 * Similar to `Promise.all`, but ignores all the rejected promises.
 * @param promises Promises to process
 */
export function all<T>(promises: Promise<T>[]) {
  return Promise.allSettled(promises).then((x) =>
    x.filter((y) => y.status === "fulfilled").map((y: any) => y.value as T)
  );
}

/**
 * Similar to `Promise.race`, but ignores all the rejected promises.
 * Rejects only when all the promises have rejected.
 * @param promises Promises to process
 */
export function race<T>(promises: Promise<T>[]) {
  return new Promise<T>((resolve, reject) => {
    function pass() {
      if (++rejected >= promises.length) {
        reject(new Error("All the promises rejected!"));
      }
    }
    let rejected = 0;
    promises.forEach((x) => Promise.resolve(x).then(resolve, pass));
  });
}
