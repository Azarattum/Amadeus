import { TrackDetails, identify } from "@amadeus-music/protocol";
import { afterAll, it } from "vitest";
import { connect } from "../data";
import { rm } from "fs/promises";
import { expect } from "vitest";

const { close, playlists, artists, library, tracks } = connect({
  name: "library.test.db",
});

const track = (id: number): TrackDetails => ({
  id,
  title: id.toString(),
  length: 42,
  source: "[]",
  album: { id: 0, title: "Album", source: "[]", year: 2042, art: "[]" },
  artists: [{ id: 0, title: "Artist", art: "[]", source: "[]" }],
});

it("saves tracks", async () => {
  const t0 = track(0);
  await playlists.create({ title: "Test" });
  await library.push([t0], identify("Test"));
  expect(await library).toHaveLength(1);
  expect(await tracks.get(0)).toEqual(t0);
  expect(await playlists).toMatchObject([
    {
      id: identify("Test"),
      playlist: "Test",
      tracks: [t0],
    },
  ]);
  expect(await artists).toMatchObject([t0.artists[0]]);
});

it("deletes tracks", async () => {
  await library.push([track(1)], identify("Test"));

  const [{ tracks }] = await playlists;
  expect(tracks).toHaveLength(2);
  expect(await library).toHaveLength(2);
  await library.purge([tracks[0].entry]);
  expect(await library).toHaveLength(1);
  expect(await playlists).toHaveLength(1);
  expect((await playlists)[0].tracks).toHaveLength(1);
  expect(await artists).toHaveLength(1);

  await library.purge([tracks[1].entry]);
  expect(await library).toHaveLength(0);
  expect(await playlists).toHaveLength(1);
  expect((await playlists)[0].tracks).toHaveLength(0);
  expect(await artists).toHaveLength(0);
});

afterAll(async () => {
  close();
  await rm("./library.test.db");
});
