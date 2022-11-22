const derivatives = new WeakMap<object, object>();
const picked = new WeakMap<object, number>();

/**
 * Derives a weakly mapped object symbol from the given object
 *  or a special string from other primitives.
 * Values derived the same number of times are guaranteed to be equal.
 */
export function derive(obj: any, times = 1): object | symbol {
  if (times <= 1) {
    if (typeof obj === "object" || typeof obj === "symbol") return obj;
    else return Symbol.for(String(obj));
  }

  if (typeof obj !== "object") {
    if (typeof obj === "symbol") obj = Symbol.keyFor(obj);
    else obj = String(obj);

    return derive(Symbol.for(obj + "\0"), times - 1);
  }

  let symbol = derivatives.get(obj);
  if (!symbol) {
    symbol = Object(Symbol()) as object;
    derivatives.set(obj, symbol);
  }

  return derive(symbol, times - 1);
}

/**
 * Efficiently slices an iterator into an array
 * @param iterator Iterator object
 * @param start Start index
 * @param end End index
 */
export function slice<T>(iterator: Iterator<T>, start: number, end: number) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  if (Number.isNaN(start) || Number.isNaN(end)) return [];
  if (start >= end) return [];

  const slice = new Array<T>(end - start);
  for (let i = 0; i < end; i++) {
    const { value, done } = iterator.next();
    if (i < start) continue;
    if (done) return slice.slice(0, i);
    slice[i - start] = value;
  }

  return slice;
}

/**
 * Deeply merges two objects and returns their intersection.
 */
export function merge<
  A extends Record<string, any>,
  B extends Record<string, any>
>(a: A, b: B) {
  const target: Record<string, any> = { ...a };

  for (const key in b) {
    if (Array.isArray(b[key])) {
      if (!Array.isArray(target[key])) target[key] = [];
      target[key].push(...(b[key] as []));
    } else if (typeof b[key] === "object" && b[key]) {
      if (!target[key]) target[key] = {};
      target[key] = merge(target[key], b[key]);
    } else {
      target[key] = b[key];
    }
  }
  return target as A & B;
}

/**
 * Sequentially picks values from arrays (including nested).
 * @param from Source object
 */
export function pick<T>(from: T): Picked<T> {
  if (!from) return from as any;
  if (typeof from !== "object") return from as any;
  if (Array.isArray(from)) {
    const index = picked.get(from) || 0;
    picked.set(from, index + 1);
    return from[index % from.length];
  }

  const result: Record<string, any> = {};
  for (const key in from) {
    const item = from[key];
    if (!Array.isArray(item)) {
      result[key] = item;
      continue;
    }
    if (!item.length) continue;
    const index = picked.get(item) || 0;
    result[key] = item[index % item.length];
    picked.set(item, index + 1);
  }
  return result as any;
}

type Picked<T> = T extends (infer U)[]
  ? U
  : T extends Record<string, any>
  ? { [key in keyof T]: T[key] extends infer U | (infer U)[] ? U : T[key] }
  : T;
