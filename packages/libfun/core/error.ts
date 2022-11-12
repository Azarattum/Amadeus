import type { PoolError as Details } from "./pool.types";

function errorify(what: unknown): Error {
  return what instanceof Error
    ? what
    : new Error(typeof what === "string" ? what : JSON.stringify(what));
}

function handle<T = void>(
  error: unknown,
  catcher?: (error: Error) => void,
  fallback?: T
) {
  const exception = errorify(error);
  if (!catcher) throw exception;
  catcher(exception);
  return fallback;
}

class PoolError extends Error implements Details {
  pool: string;
  caller?: string;
  handler?: string;

  constructor(error: Error, details: Details) {
    super(error.message);
    this.pool = details.pool;
    this.caller = details.caller;
    this.handler = details.handler;
    this.name = this.constructor.name;
    if (this.caller === this.handler) {
      this.message =
        `${this.pool.toUpperCase()} in ${(
          this.handler || "unknown"
        ).toUpperCase()} ` + `failed with: ${this.message}`;
    } else {
      this.message =
        `${(
          this.caller || "unknown"
        ).toUpperCase()} pooled ${this.pool.toUpperCase()}` +
        (this.handler ? ` in ${this.handler.toUpperCase()}` : "") +
        `, but failed with: ${this.message}`;
    }
    this.stack = error.stack
      ?.replace(error.name, this.name)
      .replace(error.message, this.message);
  }
}

export { errorify, handle, PoolError };
