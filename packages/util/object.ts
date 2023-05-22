import {
  black,
  bright,
  cyan,
  highlight,
  magenta,
  reset,
  yellow,
} from "./color";
import { delay } from "./async";

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
 * Performs as binary insertion upon a collection
 * @param collection Target array
 * @param item Element to insert
 * @param options Options, such as custom compare or insertion handlers
 */
export function binsert<T>(
  collection: T[],
  item: T,
  {
    insert = (where: number, item: T): any => collection.splice(where, 0, item),
    compare = (a: T, b: T) => +a - +b,
    end = collection.length - 1,
    start = 0,
  } = {}
) {
  if (!collection.length) {
    insert(0, item);
    return;
  }
  if (end - start <= 1) {
    if (compare(item, collection[start]) < 0) insert(start, item);
    else if (compare(item, collection[end]) >= 0) insert(end + 1, item);
    else insert(end, item);
  } else {
    const mid = Math.floor((end - start) / 2) + start;
    const left = compare(item, collection[mid]) < 0;
    if (left) binsert(collection, item, { insert, compare, start, end: mid });
    else binsert(collection, item, { insert, compare, start: mid, end });
  }
}

/**
 * Combine two collections, keeping the first one sorted and merging duplicates.
 * @param a First collection
 * @param b Second collection
 * @param options Combine options
 */
export async function combine<T, U>(
  a: T[],
  b: U[],
  {
    identify,
    compare = () => 0,
    convert = (x) => x as any,
    merge,
    map,
  }: {
    identify: (item: T | U) => number;
    compare?: (a: T, b: T) => number;
    merge: (a: T, b: U) => void;
    convert?: (item: U) => T;
    map: Map<number, T>;
  }
) {
  const insert = (where: number, item: T) => {
    map.set(identify(item), item);
    a.splice(where, 0, item);
  };

  for (const item of b) {
    const id = identify(item);
    const existing = map.get(id);
    if (existing) merge(existing, item);
    else binsert(a, convert(item), { insert, compare });
  }
}

/**
 * Returns results from the generator in batches.
 * @param generator Generator to take batches from
 */
export async function* batch<T>(generator: AsyncGenerator<T>) {
  let next = generator.next();
  let batch: T[] = [];
  for (;;) {
    const result = await Promise.race([next, delay(16)]);
    if (!result) {
      if (batch.length) yield batch;
      batch = [];
      continue;
    }

    const { value, done } = result;
    if (done) {
      if (batch.length) yield batch;
      return;
    }

    next = generator.next();
    batch.push(value);
  }
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
 * Returns a stringified colorized JSON representation
 */
export function pretty(target: object) {
  let string = JSON.stringify(target, null, 2);
  if (!string) return bright + black + "undefined" + reset;
  string = highlight(string, /"[^"]*"(?=:)/g, cyan);
  string = highlight(string, / [-0-9]+\.?[0-9]*(?=,|$)/gm, yellow);
  string = highlight(string, / (true|false)(?=,|$)/gm, magenta);
  return string;
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

/**
 * Checks if the target is an object that has the given property defined.
 * @param target Target in question
 * @param property Property to check
 */
export function has<K extends string>(
  target: unknown,
  property: K
): target is { [P in K]: any } {
  return (
    target !== null &&
    typeof target === "object" &&
    property in target &&
    (target as any)[property] !== undefined
  );
}

/**
 * Returns a copy of the array but shuffled
 * @param array Array to shuffle
 */
export function shuffle<T>(array: T[]): T[] {
  array = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

type Picked<T> = T extends (infer U)[]
  ? U
  : T extends Record<string, any>
  ? { [key in keyof T]: T[key] extends infer U | (infer U)[] ? U : T[key] }
  : T;

/**
 * Merges already sorted arrays keeping the new one sorted as well
 * @param arrays Arrays to merge
 * @param compare Item comparison function
 */
export function mergeSorted<T>(arrays: T[][], compare: (a: T, B: T) => number) {
  function mergePair(a: T[], b: T[]) {
    const result = [];
    let ai = 0;
    let bi = 0;
    while (ai < a.length && bi < b.length) {
      if (compare(a[ai], b[bi]) < 0) result.push(a[ai++]);
      else result.push(b[bi++]);
    }
    return result.concat(a.slice(ai)).concat(b.slice(bi));
  }

  while (arrays.length > 1) {
    const result = [];
    for (let i = 0; i < arrays.length; i += 2) {
      const a1 = arrays[i];
      const a2 = arrays[i + 1];
      const mergedPair = a2 ? mergePair(a1, a2) : a1;
      result.push(mergedPair);
    }
    arrays = result;
  }
  return arrays.length === 1 ? arrays[0] : [];
}
