import { monad, state, transform, type Monad } from "../monad";
import type { Reject, Resolve } from "../monad.types";

const children = Symbol();
interface Extensions<T> {
  [children]?: Map<WeakRef<this>, { resolve?: Resolve<T>; reject?: Reject }>;
  push: (value: T) => this;
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
    this[children]?.forEach(({ resolve, reject }, ref) => {
      const child = ref.deref();
      if (!child) return this[children]?.delete(ref);
      child.push(transform(this[state], resolve, reject));
    });
    return this;
  },
});

export { stream, type Stream };
