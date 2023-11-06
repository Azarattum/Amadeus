import { type Monad, transform, monad, state } from "../monad";
import type { Resolve, Reject } from "../monad/monad.types";

// This would cause a MEMORY LEAK on older platforms, but at least nothing will break
if (!("WeakRef" in globalThis)) {
  (globalThis as any)["WeakRef"] = function <T>(target: T) {
    (this as any).deref = () => target;
  };
}

const children = Symbol();
const listeners = Symbol();
interface Extensions<T> {
  [children]?: Map<WeakRef<this>, { resolve?: Resolve<T>; reject?: Reject }>;
  subscribe: (listener: (value: T) => any) => () => void;
  [listeners]?: Set<(value: T) => any>;
  push: (value: T) => this;
}
interface Stream extends Monad<"Stream"> {
  extensions: Extensions<this[""]>;
}

const stream = monad<Stream>(undefined, {
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
  then(resolve, reject) {
    const wrapped = super.then(resolve, reject);
    if (!this[children]) this[children] = new Map();
    this[children].set(new WeakRef(wrapped), { resolve, reject });
    return wrapped;
  },
  subscribe(listener) {
    if (!this[listeners]) this[listeners] = new Set();
    this[listeners].add(listener);
    transform(this[state], listener);
    return () => this[listeners]?.delete(listener);
  },
});

export { type Stream, stream };
