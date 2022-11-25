import type { Fn, Intersected } from "../utils/types";
import type { Passthrough } from "./iterator";

interface Options {
  concurrency: number;
  timeout: number;
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
      absolute: number;
    }
) & {
  interval?: number;
};

interface Executor {
  tasks: Set<{ controller: AbortController; group: string | undefined }>;
  controller: AbortController;
  group: string | undefined;
}

type Ctx = Record<string, any> | unknown;

type Context<T extends Ctx> = T & {
  signal: AbortSignal;
};

type Catcher = (error: Error & PoolError) => void;
type Override<T = unknown> =
  | ({ group?: string; context?: never } | { group: string; context: T })
  | void;

interface PoolError {
  handler?: string;
  caller?: string;
  trace: string[];
  reason: string;
  pool: string;
}

interface State<T extends Fn, C> extends Options {
  cached: Map<string, ReturnType<T>[]>;
  listeners: Set<Handler<T, C>>;
  executing: Set<Executor>;
  pending: Set<Executor>;
  catchers: Set<Catcher>;
  last?: Date;
  id: string;
}

type Handler<T extends Fn, C = unknown> = ((
  this: Context<C>,
  ...args: Parameters<T>
) =>
  | Generator<
      ReturnType<T> | Promise<ReturnType<T>> | Passthrough<unknown>,
      void
    >
  | (ReturnType<T> extends Promise<any> ? never : ReturnType<T>)) & {
  group?: string;
};

type Caller<T> = Intersected<
  T extends (..._: infer A) => infer R
    ? (this: Override, ...args: A) => AsyncGenerator<R>
    : unknown
>;

type Filter =
  | { group: string; caller?: never; handler?: never }
  | { group?: never; caller: string; handler?: string }
  | { group?: never; caller?: string; handler: string };

type Pool<T extends Fn = (..._: any) => any, C extends Ctx = unknown> = {
  (this: Override, handler: Handler<T, C>): () => void;

  bind: <C extends Ctx>(context: Override<C>) => Pool<T, C>;
  schedule: (when: Schedule) => Caller<T>;
  where: (group: string) => Caller<T>;
  catch: (handler?: Catcher) => void;
  abort: (filter?: Filter) => void;
  drain: (filter?: Filter) => void;
  close: (filter?: Filter) => void;
  status: () => State<T, C>;

  [state: symbol]: State<T, C>;
} & Caller<T> &
  (C extends Record<string, any>
    ? { context: (context: Partial<C>) => void }
    : unknown);

type PoolMaker<C extends Ctx = unknown> = {
  <T extends Fn = () => void>(id: string, options?: Partial<Options>): Pool<
    T,
    C
  >;
  bind<T>(context: Override<T> & { scope?: string }): PoolMaker<T>;
};

type Pools = Omit<
  {
    [key in keyof Pool]: Pool[key] extends (..._: infer A) => infer R
      ? {
          (id?: null, ..._: A): R extends void ? R : R[];
          (id: string, ..._: A): R;
        }
      : never;
  },
  "bind" | "catch" | "context"
> & {
  catch: (handler?: Catcher) => void;
  contexts: Map<string, Ctx>;
  count(): number;
  pool: PoolMaker;
};

export type {
  PoolError,
  PoolMaker,
  Executor,
  Override,
  Options,
  Handler,
  Catcher,
  Filter,
  Pools,
  Pool,
  Ctx,
};
