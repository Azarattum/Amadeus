import type { Intersected, Fn } from "../utils/types";
import type { Passthrough } from "./iterator";

type Task<T extends any[] = any[]> = {
  tasks: { controller: AbortController; group: string | undefined }[];
  controller: AbortController;
  id: string;
  args: T;
};

interface Options<T extends Fn> {
  transform: (
    generators: AsyncGenerator<Result<ReturnType<T>>>[],
    task: Task<Parameters<T>>,
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
  | ({ context?: never; group?: string } | { group: string; context: T })
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
      | Promise<Result<ReturnType<T>>>
      | Result<ReturnType<T>>
      | Passthrough<unknown>,
      void
    >
  | (Result<ReturnType<T>> extends Promise<any>
      ? never
      : Result<ReturnType<T>>)) & {
  group?: string;
};

type PoolGenerator<T> = AsyncGenerator<Result<T, true>, void> &
  PromiseLike<Result<T, true>[]> & {
    executor: Executor;
  };

type Caller<T, Split = false> = Intersected<
  T extends (..._: infer A) => infer U
    ? (
        this: Override,
        ...args: A
      ) => Split extends false
        ? PoolGenerator<U>
        : Map<string, PoolGenerator<U>>
    : unknown
>;

type Filter =
  | { handler?: string; caller: string; group?: never }
  | { caller?: string; handler: string; group?: never }
  | { handler?: never; caller?: never; group: string };

type Pool<T extends Fn = (..._: any) => any, C extends Ctx = unknown> = {
  bind: <C extends Ctx>(context: Override<C>) => Pool<T, C>;
  schedule: (when: Schedule) => Caller<T>;
  where: (group: string) => Caller<T>;
  catch: (handler?: Catcher) => void;
  abort: (filter?: Filter) => void;
  drain: (filter?: Filter) => void;
  close: (filter?: Filter) => void;
  split: () => Caller<T, true>;
  status: () => State<T, C>;

  (this: Override, handler: Handler<T, C>): () => void;
  [state: symbol]: State<T, C>;
} & Caller<T> &
  (C extends Record<string, any>
    ? { context: (context: Partial<C>) => void }
    : unknown);

type PoolMaker<C extends Ctx = unknown> = {
  <T extends Fn = () => void>(
    id: string,
    options?: Partial<Options<T>>,
  ): Pool<T, C>;
  bind<T>(context: Override<T> & { scope?: string }): PoolMaker<T>;
};

type Pools = Omit<
  {
    [key in keyof Pool]: Pool[key] extends (..._: infer A) => infer R
      ? {
          (id?: "*" | null, ..._: A): R extends void ? R : R[];
          (id: string, ..._: A): R;
        }
      : never;
  },
  "context" | "catch" | "bind"
> & {
  catch: (handler?: Catcher) => void;
  contexts: Map<string, Ctx>;
  pool: PoolMaker;
  count(): number;
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
