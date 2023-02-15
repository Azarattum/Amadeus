import { clean } from "@amadeus-music/util/string";
import { has } from "@amadeus-music/util/object";
import type { Unique } from ".";
import hash from "murmurhash";

function titled(data: any) {
  if (has(data, "title")) return data.title;
  return data;
}

function compare(a: any, b: any): number {
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (has(a, "title") && has(b, "title")) {
    return compare(clean(titled(a)), clean(titled(b)));
  }
  return 0;
}

function normalize<T extends Record<string, any> | string>(
  data: T
): T extends string ? string : T {
  if (typeof data === "string") return clean(data) as any;
  if (typeof data !== "object") return data as any;
  const copy = { ...data };
  for (const key in copy) {
    if (Array.isArray(copy[key])) {
      copy[key] = copy[key].map(normalize).sort(compare);
    } else copy[key] = normalize(copy[key] as any);
  }

  return copy as any;
}

function stringify(data: any) {
  data = normalize(data);
  return typeof data === "string"
    ? data
    : typeof data !== "object"
    ? clean(String(data))
    : has(data, "artists") && has(data, "title") && has(data, "album")
    ? `${data.artists.map(titled)} - ${data.title} - ${titled(data.album)}`
    : has(data, "artists") && has(data, "title")
    ? `${data.artists} - ${data.title}`
    : has(data, "title")
    ? data.title
    : JSON.stringify(data);
}

function identify(data: any): number {
  if (has(data, "id")) return +data.id;
  return hash(stringify(data));
}

function merge<T extends Record<string, any>>(target: T, source: T) {
  function caseEntropy(text: string) {
    let small = 0;
    let big = 0;
    const lower = text.toLowerCase();
    const upper = text.toUpperCase();
    for (let i = 0; i < text.length; i++) {
      if (lower[i] !== text[i]) big++;
      if (upper[i] !== text[i]) small++;
    }

    const all = big + small;
    return 1 - (Math.abs(all / 2 - small) + Math.abs(all / 2 - big)) / all;
  }

  for (const key in target) {
    const json =
      ["art", "source"].includes(key) &&
      typeof target[key] === "string" &&
      typeof source[key] === "string";
    const a = json ? JSON.parse(target[key]) : target[key];
    const b = json ? JSON.parse(source[key]) : source[key];
    let c = a;

    if (typeof a !== typeof b) continue;
    if (typeof a === "string") c = caseEntropy(a) >= caseEntropy(b) ? a : b;
    if (Array.isArray(a) && Array.isArray(b)) {
      const sorted = [...a, ...b].sort(compare);
      const identified = sorted.map(identify);
      c = sorted.filter((x, i) => identified.indexOf(identify(x)) === i);
    } else if (typeof a === "object") c = merge(a, b);
    target[key] = json ? JSON.stringify(c) : c;
  }

  for (const key in source) {
    if (!(key in target)) target[key] = source[key];
  }
  return target;
}

function uniquify<T>(target: T): Uniqueified<T> {
  if (typeof target !== "object" || !target) return target as any;
  if (Array.isArray(target)) return target.slice().sort().map(uniquify) as any;

  const copy: Record<string, any> = { ...target, id: identify(target) };
  for (const key in copy) {
    copy[key] = uniquify(copy[key]);
  }
  return copy as any;
}

type Uniqueified<T> = T extends Record<any, any>
  ? Unique<{
      [K in keyof T]: T[K] extends (infer I)[]
        ? Uniqueified<I>[]
        : Uniqueified<T[K]>;
    }>
  : T;

export type { Uniqueified };
export { identify, stringify, normalize, uniquify, merge };
