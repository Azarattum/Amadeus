import type { Passthrough } from "./iterator";
import type { Fn } from "./types";

interface Options {
  concurrency: number;
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

interface State<T extends Fn> extends Options {
  listeners: Set<Handler<T>>;
  executing: Set<Executor>;
  pending: Set<Executor>;
  last?: Date;
  id: string;
}

type Handler<T extends Fn> = (
  this: Context,
  ...args: Parameters<T>
) => Generator<ReturnType<T> | Promise<ReturnType<T>> | Passthrough<unknown>>;

type Pool<T extends Fn = (..._: any) => any> = {
  (handler: Handler<T>): () => void;
  (...args: Parameters<T>): AsyncGenerator<ReturnType<T>>;

  schedule: (
    when: Schedule
  ) => (...args: Parameters<T>) => AsyncGenerator<ReturnType<T>>;
  catch: (handler?: (reason: unknown) => any) => void;
  status: () => State<T>;
  abort: () => void;
  close: () => void;
  drain: () => void;

  [state: symbol]: State<T>;
};

type Pools = {
  [key in keyof Pool]: Pool[key] extends Fn<infer A, infer R>
    ? Fn<A, R[]>
    : never;
} & {
  status(id: string): State<Fn>;
  count(): number;
  pool<T extends Fn = () => void>(
    id: string,
    options?: Partial<Options>
  ): Pool<T>;
};

export type { Options, Pool, Pools, Handler };
