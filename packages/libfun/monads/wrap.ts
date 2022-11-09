import { monad } from "../core/monad";

function wrap<A extends any[], R>(fn: (...args: A) => R) {
  return (...args: A) => monad()(undefined).then(() => fn(...args));
}

export { wrap };
