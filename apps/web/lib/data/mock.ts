import type { Infer } from "superstruct";
import type { schema } from "./schema";
import { update } from "./library";

function put<T extends keyof Infer<typeof schema>>(
  table: T,
  data: Infer<typeof schema>[T] | Infer<typeof schema>[T][]
) {
  return update((db) =>
    db
      .insertInto(table)
      .onConflict((qb) => qb.doNothing())
      .values(data as any)
      .execute()
  );
}

/** For development purposes only! Database mocking. */
async function mock() {
  /// Check that the data is properly mocked!
  await put("tracks", {
    id: 12345,
    title: "Test Song",
    length: 42,
    album: 4321,
    source: '["http://123"]',
  });
  await put("albums", {
    id: 4321,
    title: "Test Album",
    year: 2042,
    source: '["http://123"]',
    art: '["http://1234"]',
  });
  await put("catalogue", {
    album: 4321,
    artist: 2345,
  });
  await put("artists", {
    id: 2345,
    title: "Test Artist",
    following: false,
    source: '["http://123"]',
    art: '["http://1234"]',
  });
  await put("library", {
    id: 354879,
    playlist: 9876,
    track: 12345,
    date: Date.now(),
    order: "Z0",
  });
  await put("playlists", {
    id: 9876,
    relevancy: 1,
    title: "My Playlist",
    remote: null,
    shared: null,
  });
}

export { mock };
