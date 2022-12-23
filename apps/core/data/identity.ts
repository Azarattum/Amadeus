import { clean } from "@amadeus-music/util/string";
import hash from "murmurhash";

function normalize<T extends Record<string, any> | string>(
  data: T
): T extends string ? string : T {
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
    ? `${data.artists}-${data.title}-${data.album}`
    : "artists" in data && "title" in data
    ? `${data.artists}-${data.title}`
    : "title" in data
    ? data.title
    : JSON.stringify(data);
}

function identify(data: any) {
  if (data && typeof data === "object" && "id" in data) return data.id;
  return hash(stringify(data));
}

export { identify, stringify, normalize };
