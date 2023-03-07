import type { Fn, Intersected } from "../utils/types";
import type { Passthrough } from "./iterator";

type Task<T extends any[] = any[]> = {
  tasks: { group: string | undefined; controller: AbortController }[];
  controller: AbortController;
  id: string;
  args: T;
};

interface Options<T extends Fn> {
  transform: (
    generators: AsyncGenerator<Result<ReturnType<T>>>[],
    task: Task<Parameters<T>>
  ) => AsyncGenerator<Result<ReturnType<T>, true>>;
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

interface State<T extends Fn, C> extends Options<T> {
  cached: Map<string, Result<ReturnType<T>>[]>;
  listeners: Set<Handler<T, C>>;
  executing: Set<Executor>;
  pending: Set<Executor>;
  catchers: Set<Catcher>;
  last?: Date;
  id: string;
}

declare const mapped: unique symbol;
type Mapped<T, U> = {
  [mapped]: true;
  from: T;
  to: U;
};

type Result<T, Map = false> = T extends Mapped<infer A, infer B>
  ? Map extends true
    ? B
    : A
  : T;

type Handler<T extends Fn, C = unknown> = ((
  this: Context<C>,
  ...args: Parameters<T>
) =>
  | Generator<
      | Result<ReturnType<T>>
      | Promise<Result<ReturnType<T>>>
      | Passthrough<unknown>,
      void
    >
  | (Result<ReturnType<T>> extends Promise<any>
      ? never
      : Result<ReturnType<T>>)) & {
  group?: string;
};

type Caller<T, Split = false> = Intersected<
  T extends (..._: infer A) => infer U
    ? (
        this: Override,
        ...args: A
      ) => Split extends false
        ? AsyncGenerator<Result<U, true>, void> & { executor: Executor }
        : Map<
            string,
            AsyncGenerator<Result<U, true>, void> & { executor: Executor }
          >
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
  split(): Caller<T, true>;

  [state: symbol]: State<T, C>;
} & Caller<T> &
  (C extends Record<string, any>
    ? { context: (context: Partial<C>) => void }
    : unknown);

type PoolMaker<C extends Ctx = unknown> = {
  <T extends Fn = () => void>(id: string, options?: Partial<Options<T>>): Pool<
    T,
    C
  >;
  bind<T>(context: Override<T> & { scope?: string }): PoolMaker<T>;
};

type Pools = Omit<
  {
    [key in keyof Pool]: Pool[key] extends (..._: infer A) => infer R
      ? {
          (id?: null | "*", ..._: A): R extends void ? R : R[];
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
  Result,
  Mapped,
  Filter,
  Pools,
  Task,
  Pool,
  Ctx,
};
