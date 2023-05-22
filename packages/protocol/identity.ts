import type { FromInfo, MediaBase, MediaInfo } from ".";
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
    const a = target[key];
    const b = source[key];
    let c = a;

    if (typeof a !== typeof b) continue;
    if (typeof a === "string") c = caseEntropy(a) >= caseEntropy(b) ? a : b;
    if (Array.isArray(a) && Array.isArray(b)) {
      const both = [...a, ...b];
      if (has(a[0], "title") || has(b[0], "title")) both.sort(compare);
      const identified = both.map(identify);
      c = both.filter((x, i) => identified.indexOf(identify(x)) === i) as any;
    } else if (typeof a === "object") c = merge(a, b);
    if (typeof a === "number") c = a > b ? a : b;
    target[key] = c;
  }

  for (const key in source) {
    if (!(key in target)) target[key] = source[key];
  }
  return target;
}

function uniquify<T extends MediaInfo>(item: T) {
  const result = { id: identify(item), ...fix(item) } as any as T;
  if ("album" in result) {
    result.album = {
      id: identify({ ...result.album, artists: result["artists"] }),
      ...fix(result.album),
    } as any;
  }
  if ("artists" in result) {
    result.artists = result.artists
      .slice()
      .sort(compare)
      .map((x) => ({ id: identify(x), ...fix(x) })) as any;
  }
  return result as unknown as FromInfo<T>;
}

function fix(assets: MediaBase) {
  if ("duration" in assets || "album" in assets) return assets;
  if (!assets.arts) assets.arts = [];
  if (!assets.thumbnails) assets.thumbnails = [];
  assets.thumbnails = assets.thumbnails.slice(0, assets.arts.length);
  assets.thumbnails = assets.thumbnails.concat(
    Array(assets.arts.length - assets.thumbnails.length).fill(null)
  );
  return assets;
}

function format(data: any): string {
  return has(data, "artists") && has(data, "title")
    ? `${data.artists.map(titled).join(", ")} - ${data.title}`
    : has(data, "title")
    ? data.title
    : String(data);
}

export { identify, stringify, normalize, uniquify, merge, format };
