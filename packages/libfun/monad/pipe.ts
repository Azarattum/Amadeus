import type { Pipeline, Pipe } from "./pipe.types";
import { errorify } from "../utils/error";
import type { Fn } from "../utils/types";
import { all } from "./monad";

const pipeline: Pipeline = (...fns: Fn[]) => {
  return (...data: any[]) => {
    let value = all(data).then(
      (x: any) => {
        if (!fns.length) return x[0];
        if (error in fns[0]) return x[0];
        else return fns[0](...x);
      },
      (reason) => {
        if (!fns.length) throw reason;
        if (error in fns[0]) return fns[0](reason);
        else throw reason;
      },
    );

    for (let i = 1; i < fns.length; i++) {
      if (error in fns[i]) value = value.catch(fns[i]);
      else value = value.then(fns[i]);
    }
    return value.unwrap() as never;
  };
};

const pipe: Pipe = (...data: any[]) => {
  return (...fns: Fn[]) => (pipeline as any)(...fns)(...data) as never;
};

const error = Symbol();
const fallback = <T>(value: ((e: any) => T) | T) => {
  const handler = <U>(error: U) => {
    return typeof value === "function"
      ? ((value as any)(error) as T | U)
      : (value as T | U);
  };
  (handler as any)[error] = true;
  return handler;
};

const expose = [
  <T>(data: T) => ({ error: undefined, data }),
  fallback((e: any) => ({ error: errorify(e), data: undefined })),
] as const;

export { fallback, pipeline, expose, pipe };
