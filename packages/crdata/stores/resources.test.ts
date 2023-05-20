import { Album, Artist, Track, identify } from "@amadeus-music/protocol";
import { afterAll, it } from "vitest";
import { connect } from "../data";
import { rm } from "fs/promises";
import { expect } from "vitest";

const { close, resources, library, playlists } = connect({
  name: "resources.test.db",
});

const makeArtist = (id: number): Artist => ({
  id: id,
  title: "artist" + id.toString(),
  sources: [id + "_0", id + "_1"],
  arts: [id + "_secondary", id + "_primary"],
  thumbnails: [null, id + "_primary"],
});

const makeAlbum = (id: number): Album => ({
  artists: [makeArtist(id), makeArtist(id + 50)],
  id: (id += 100),
  title: "album" + id.toString(),
  year: 2042,
  sources: [id + "_0", id + "_1"],
  arts: [id + "_secondary", id + "_primary"],
  thumbnails: [null, id + "_primary"],
});

const makeTrack = (id: number): Track => ({
  album: makeAlbum(id),
  artists: [makeArtist(id)],
  id: (id += 200),
  title: "track" + id.toString(),
  duration: 42 + id,
  sources: [id + "_0", id + "_1"],
});

it("prioritizes resources", async () => {
  await playlists.create({ title: "test" });
  await library.push([makeTrack(0)], identify("test"));
  expect(await resources).toHaveLength(3);
  expect(await resources.get(0)).toEqual({
    sources: ["0_0", "0_1"],
    arts: ["0_primary", "0_secondary"],
    thumbnails: ["0_primary", null],
  });
  expect(await resources.get(200)).toEqual({
    sources: ["200_0", "200_1"],
    arts: [],
    thumbnails: [null],
  });
  await resources.prioritize("source", "0_1");
  await resources.prioritize("source", "200_1");
  expect(await resources.get(0)).toEqual({
    sources: ["0_1", "0_0"],
    arts: ["0_primary", "0_secondary"],
    thumbnails: ["0_primary", null],
  });
  expect(await resources.get(200)).toEqual({
    sources: ["200_1", "200_0"],
    arts: [],
    thumbnails: [null],
  });
  await resources.prioritize("art", "0_secondary");
  expect(await resources.get(0)).toEqual({
    sources: ["0_1", "0_0"],
    arts: ["0_secondary", "0_primary"],
    thumbnails: [null, "0_primary"],
  });
});

it("purges resources", async () => {
  expect(await resources).toHaveLength(3);
  await library.purge([(await library)[0].id]);
  expect(await resources).toHaveLength(0);
});

afterAll(async () => {
  close();
  await rm("./resources.test.db");
});
