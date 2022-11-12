import type { Passthrough } from "./iterator";
import type { Fn } from "./types";

interface Options {
  concurrency: number;
  group?: string;
  cache: number;
  rate: number;
}

type Schedule = (
  | {
      relative: number;
      absolute?: never;
    }
  | {
      relative?: never;
      absolute: Date;
    }
) & {
  interval?: number;
};

interface Executor {
  controller: AbortController;
}

interface Context {
  signal: AbortSignal;
}

type Catcher = (error: Error & PoolError) => void;
type Override = Pick<Options, "group"> | void;

interface PoolError {
  handler?: string;
  caller?: string;
  pool: string;
}

interface State<T extends Fn> extends Options {
  listeners: Set<Handler<T>>;
  executing: Set<Executor>;
  pending: Set<Executor>;
  catchers: Set<Catcher>;
  last?: Date;
  id: string;
}

type Handler<T extends Fn> = ((
  this: Context,
  ...args: Parameters<T>
) =>
  | Generator<
      ReturnType<T> | Promise<ReturnType<T>> | Passthrough<unknown>,
      void
    >
  | (ReturnType<T> extends Promise<any> ? never : ReturnType<T>)) & {
  group?: string; /// Not sure if this is a good solution (but it works...)
};

type Pool<T extends Fn = (..._: any) => any> = {
  (this: Override, handler: Handler<T>): () => void;
  (this: Override, ...args: Parameters<T>): AsyncGenerator<ReturnType<T>>;

  schedule: (
    when: Schedule
  ) => (...args: Parameters<T>) => AsyncGenerator<ReturnType<T>>;
  catch: (handler?: Catcher) => void;
  status: () => State<T>;
  abort: () => void;
  close: () => void;
  drain: () => void;

  [state: symbol]: State<T>;
};

type Pools = {
  [key in keyof Pool]: Pool[key] extends Fn<infer A, infer R>
    ? Fn<A, R extends void ? R : R[]>
    : never;
} & {
  status(id: string): State<Fn>;
  count(): number;
  pool<T extends Fn = () => void>(
    this: Override,
    id: string,
    options?: Partial<Options>
  ): Pool<T>;
};

export type { Options, Pool, Pools, Handler, Catcher, PoolError, Override };
