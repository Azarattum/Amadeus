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

interface Context {
  signal: AbortSignal;
}

type Catcher = (error: Error & PoolError) => void;
type Override = (Pick<Options, "group"> & { scope?: string }) | void;

interface PoolError {
  handler?: string;
  caller?: string;
  trace: string[];
  reason: string;
  pool: string;
}

interface State<T extends Fn> extends Options {
  cached: Map<string, ReturnType<T>[]>;
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

type Pool<T extends Fn = (..._: any) => any> = {
  (this: Override, handler: Handler<T>): () => void;

  schedule: (when: Schedule) => Caller<T>;
  bind: (context: Override) => Pool<T>;
  catch: (handler?: Catcher) => void;
  abort: (filter?: Filter) => void;
  drain: (filter?: Filter) => void;
  close: (filter?: Filter) => void;
  status: () => State<T>;

  [state: symbol]: State<T>;
} & Caller<T>;

type Pools = Omit<
  {
    [key in keyof Pool]: Pool[key] extends (..._: infer A) => infer R
      ? {
          (id?: null, ..._: A): R extends void ? R : R[];
          (id: string, ..._: A): R;
        }
      : never;
  },
  "bind" | "catch"
> & {
  catch: (handler?: Catcher) => void;
  count(): number;
  pool<T extends Fn = () => void>(
    this: Override | Pools,
    id: string,
    options?: Partial<Options>
  ): Pool<T>;
};

export type {
  PoolError,
  Executor,
  Override,
  Options,
  Handler,
  Catcher,
  Filter,
  Pools,
  Pool,
};
