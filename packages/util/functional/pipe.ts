import type { Pipe, Pipeline } from "./pipe.types";
import type { Fn } from "./types";
import { all } from "./monad";

const pipe: Pipe = (...fns: Fn[]) => {
  if (fns.length === 0) return (x: any) => x;
  if (fns.length === 1) return fns[0];
  return (...data: any[]) => {
    let value = all(data).then((x: any) => {
      if (Array.isArray(x)) return fns[0](...x);
      return fns[0](x);
    });

    for (let i = 1; i < fns.length; i++) {
      value = value.then(fns[i]);
    }
    return value.unwrap();
  };
};

const pipeline: Pipeline = (...data: any[]) => {
  return (...fns: Fn[]) => pipe(...fns)(...data);
};

export { pipe, pipeline };
