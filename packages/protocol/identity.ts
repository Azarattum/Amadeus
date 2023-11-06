import { clean } from "@amadeus-music/util/string";
import { has } from "@amadeus-music/util/object";
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
  data: T,
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
    ? `${data.artists.map(titled)} - ${data.title}`
    : has(data, "title")
    ? data.title
    : Array.isArray(data)
    ? data.map(titled).toString()
    : JSON.stringify(data);
}

function identify(data: any): number {
  if (has(data, "id")) return +data.id;
  return hash(stringify(data));
}

function format(data: any): string {
  return has(data, "artists") && has(data, "title")
    ? `${data.artists.map(titled).join(", ")} - ${data.title}`
    : has(data, "title")
    ? data.title
    : String(data);
}

export { stringify, normalize, identify, compare, format };
