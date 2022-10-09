import type { Pipe, Pipeline } from "./pipe.types";
import type { Fn } from "./types";
import { all } from "./monad";

const pipeline: Pipeline = (...fns: Fn[]) => {
  return (...data: any[]) => {
    let value = all(data).then((x: any) => {
      if (!fns.length) return Array.isArray(x) ? x[0] : x;
      if (Array.isArray(x)) return fns[0](...x);
      return fns[0](x);
    });

    for (let i = 1; i < fns.length; i++) {
      value = value.then(fns[i]);
    }
    return value.unwrap() as never;
  };
};

const pipe: Pipe = (...data: any[]) => {
  return (...fns: Fn[]) => (pipeline as any)(...fns)(...data) as never;
};

/// TODO: implement a catch function

export { pipeline, pipe };
