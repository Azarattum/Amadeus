import { monad, state, transform, type Monad } from "../monad";
import type { Reject, Resolve } from "../monad.types";

const children = Symbol();
const listeners = Symbol();
interface Extensions<T> {
  [children]?: Map<WeakRef<this>, { resolve?: Resolve<T>; reject?: Reject }>;
  [listeners]?: Set<(value: T) => any>;
  push: (value: T) => this;
  subscribe: (listener: (value: T) => any) => () => void;
}
interface Stream extends Monad<"Stream"> {
  extensions: Extensions<this[""]>;
}

const stream = monad<Stream>(undefined, {
  then(resolve, reject) {
    const wrapped = super.then(resolve, reject);
    if (!this[children]) this[children] = new Map();
    this[children].set(new WeakRef(wrapped), { resolve, reject });
    return wrapped;
  },
  push(value) {
    this[state] = transform(this[state], () => value);
    this[listeners]?.forEach((listener) => transform(this[state], listener));
    this[children]?.forEach(({ resolve, reject }, ref) => {
      const child = ref.deref();
      if (!child) return this[children]?.delete(ref);
      child.push(transform(this[state], resolve, reject));
    });
    return this;
  },
  subscribe(listener) {
    if (!this[listeners]) this[listeners] = new Set();
    this[listeners].add(listener);
    transform(this[state], listener);
    return () => this[listeners]?.delete(listener);
  },
});

export { stream, type Stream };
