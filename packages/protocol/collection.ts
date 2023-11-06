import { mergeSorted, has } from "@amadeus-music/util/object";
import { type MediaBase, identify, compare } from ".";
import { unbrace } from "@amadeus-music/util/string";
import type { ToInfo, Media } from "./derived";

function collection<T extends Media>(compare = (a: T, b: T) => b.id - a.id) {
  const groups = new Map<number, T[]>();
  const deleted = new Set<number>();

  return {
    push(item: ToInfo<T> | T, group = 0) {
      const items = groups.get(group) || [];
      groups.set(group, items);

      const existing = this.has(item);
      const created = existing
        ? Object.assign(existing.original, existing.casted)
        : convert(item);
      items.push(created);
      deleted.delete(created.id);

      return created;
    },
    has(item: ToInfo<T> | T) {
      const target = convert(item);
      for (const entries of groups) {
        for (const original of entries[1]) {
          if (deleted.has(original.id)) continue;
          const casted = cast(original, target);
          if (casted) return { original, casted };
        }
      }
    },
    prune(length: number) {
      const leftovers = this.items.slice(length);
      leftovers.forEach((x) => deleted.add(x.id));
      return leftovers;
    },
    get items() {
      return [...new Set(mergeSorted([...groups.values()], compare))].filter(
        (x) => !deleted.has(x.id),
      );
    },
  };
}

function cast<T extends Media>(a: T, b: T) {
  // Merge on strict equality
  if (a.id === b.id) return merge(a, b);
  const options = [undefined, { sensitivity: "base" }] as const;

  // Skip different titles
  if (a.title.localeCompare(b.title, ...options)) return;
  // Merge on artist subset
  if ("artists" in a && "artists" in b) {
    const subB = a.artists.every((x) => b.artists.find((y) => y.id === x.id));
    const subA = b.artists.every((x) => a.artists.find((y) => y.id === x.id));
    // Skip different artists
    if (!subA && !subB) return;
    let album: string | undefined;
    if ("album" in a && "album" in b) {
      // Overwrite braced albums
      if (!a.album.title.localeCompare(unbrace(b.album.title))) {
        album = a.album.title;
      } else if (!b.album.title.localeCompare(unbrace(a.album.title))) {
        album = b.album.title;
      }
      // Skip different albums
      else if (a.album.title.localeCompare(b.album.title, ...options)) return;
    }

    const merged = merge(a, b);
    merged.id = identify(merged);
    if ("album" in merged) {
      merged.album.title = album || merged.album.title;
      merged.album.id = identify({ ...merged.album, artists: merged.artists });
    }
    return merged;
  }
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

  target = { ...target };
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

function convert<T extends Media>(item: ToInfo<T> | T) {
  const result = { id: identify(item), ...fix(item) } as T;
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
  return result;
}

function fix(assets: MediaBase) {
  if ("duration" in assets || "album" in assets) return assets;
  if (!assets.arts) assets.arts = [];
  if (!assets.thumbnails) assets.thumbnails = [];
  assets.thumbnails = assets.thumbnails.slice(0, assets.arts.length);
  assets.thumbnails = assets.thumbnails.concat(
    Array(assets.arts.length - assets.thumbnails.length).fill(null),
  );
  return assets;
}

export { collection, convert, merge };
