import type { Fn } from "./types";

interface Options {
  rate: number;
  cache: number;
  concurrency: number;
  signal?: AbortSignal;
  group?: string;
}

interface State<T extends Fn> extends Options {
  id: string;
  listeners: Set<Handler<T>>;
  executing: number;
  last: Date;
}

type Handler<T extends Fn> = (
  ...args: Parameters<T>
) => Generator<ReturnType<T> | Promise<any>>; /// Filter promises

type Pool<T extends Fn = (..._: any) => any> = {
  (handler: Handler<T>): () => void;
  (...args: Parameters<T>): AsyncIterator<ReturnType<T>>;

  catch: (handler: (reason: unknown) => any) => void;
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
