import type { Pipe, Pipeline } from "./pipe.types";
import type { Fn } from "./types";
import { all } from "./monad";

const pipeline: Pipeline = (...fns: Fn[]) => {
  return (...data: any[]) => {
    let value = all(data).then((x: any) => {
      if (!fns.length) return x[0];
      return fns[0](...x);
    });

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
const fallback = <T>(value: T | ((e: any) => T)) => {
  const handler = <U>(error: U) => {
    return typeof value === "function"
      ? ((value as any)(error) as T | U)
      : (value as T | U);
  };
  (handler as any)[error] = true;
  return handler;
};

export { fallback, pipeline, pipe };
