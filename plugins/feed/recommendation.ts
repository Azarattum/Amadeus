import { async, map, type Page, type Track } from "@amadeus-music/core";
import { shuffle } from "@amadeus-music/util/object";
import { expand, lookup, relate } from "./plugin";

export function* suggest(reference: Track, count: number, filter = acceptAll) {
  // Find similar by track
  const similarByTrack: Track[] = [];
  const addByTrack = createMapper(similarByTrack, count, filter);

  yield* map(relate("track", reference, count ** 2), addByTrack);

  // Find similar by artists
  const similarByArtist: Track[] = [];
  const addByArtist = createMapper(similarByArtist, count, filter);

  for (const artist of shuffle(reference.artists)) {
    yield* map(relate("artist", artist, count), function* (page) {
      if (page.progress < 1) return;
      for (const artist of page.items) {
        yield* map(expand("artist", artist, count), addByArtist);
        if (similarByArtist.length >= count ** 2) break;
      }

      if (similarByArtist.length >= count ** 2 || page.completed) page.close();
      else page.next();
    });

    if (similarByArtist.length >= count ** 2) break;
  }

  // Find similar by album
  const similarByAlbum: Track[] = [];
  const addByAlbum = createMapper(similarByAlbum, count, filter);

  const album = { ...reference.album, artists: reference.artists };
  yield* map(relate("album", album, count), function* (page) {
    if (page.progress < 1) return;
    for (const album of page.items) {
      yield* map(expand("album", album, count), addByAlbum);
      if (similarByAlbum.length >= count) break;
    }

    if (similarByAlbum.length >= count || page.completed) page.close();
    else page.next();
  });

  // Assemble all the tracks
  const similar = shuffle([
    ...similarByTrack,
    ...similarByArtist,
    ...similarByAlbum,
  ]);

  // Lookup tracks without sources
  let skipped = 0;
  for (let i = 0; i < Math.min(count + skipped, similar.length); i++) {
    if (similar[i].sources.length) continue;
    const found = yield* lookup("track", reference);
    if (!found) skipped += 1;
    else similar[i] = found;
  }

  return similar.filter((x) => x.sources.length).slice(0, count);
}

function createMapper(out: Track[], count: number, filter = acceptAll) {
  return function* (page: Page<Track>) {
    if (page.progress < 1) return;
    const existing = yield* async(filter(page.items.map((x) => x.id)));
    out.push(...page.items.filter((x) => !existing.has(x.id)));

    if (out.length >= count || page.completed) page.close();
    else page.next();
  };
}

const acceptAll: (ids: number[]) => PromiseLike<Set<number>> = () =>
  Promise.resolve(new Set());
