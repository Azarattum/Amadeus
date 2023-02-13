import type { Unique } from "@amadeus-music/protocol";
import { clean } from "@amadeus-music/util/string";
import hash from "murmurhash";

function destructure(target: any) {
  if (
    target &&
    typeof target === "object" &&
    "title" in target &&
    !("album" in target) &&
    !("artists" in target)
  ) {
    return target.title;
  }
  return target;
}

function normalize<T extends Record<string, any> | string>(
  data: T
): T extends string ? string : T {
  data = destructure(data);
  if (typeof data === "string") return clean(data) as any;
  if (typeof data !== "object") return data as any;
  const copy = { ...data };
  for (const key in copy) {
    if (Array.isArray(copy[key])) copy[key] = copy[key].map(normalize).sort();
    else copy[key] = normalize(copy[key] as any);
  }

  return copy as any;
}

function stringify(data: any) {
  data = normalize(data);
  return typeof data === "string"
    ? data
    : typeof data !== "object"
    ? clean(String(data))
    : "artists" in data && "title" in data && "album" in data
    ? `${data.artists} - ${data.title} - ${data.album}`
    : "artists" in data && "title" in data
    ? `${data.artists} - ${data.title}`
    : "title" in data
    ? data.title
    : JSON.stringify(data);
}

function identify(data: any): number {
  if (data && typeof data === "object" && "id" in data) return data.id;
  return hash(stringify(data));
}

function uniquify<T>(target: T): Uniqueified<T> {
  if (typeof target !== "object") return target as any;
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
export { identify, stringify, normalize, uniquify };
