import { handle } from "./error";

const delay = (ms = 1) => new Promise((x) => setTimeout(x, ms));

function cancel<T>(promise: T, signal?: AbortSignal) {
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

function derive(parent?: AbortController | AbortSignal) {
  const signal = parent instanceof AbortSignal ? parent : parent?.signal;
  const derived = new AbortController();
  const abort = () => derived.abort();
  const remove = () => {
    derived.signal.removeEventListener("abort", remove);
    signal?.removeEventListener("abort", abort);
  };

  derived.signal.addEventListener("abort", remove);
  signal?.addEventListener("abort", abort);
  return derived;
}

function thenable<T = unknown>(value: any): value is PromiseLike<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "then" in value &&
    typeof value["then"] === "function"
  );
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

export { cancel, thenable, derive, block, delay };
