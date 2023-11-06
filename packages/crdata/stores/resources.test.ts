import { identify, Artist, Album, Track } from "@amadeus-music/protocol";
import { afterAll, it } from "vitest";
import { connect } from "../data";
import { rm } from "fs/promises";
import { expect } from "vitest";

const { resources, playlists, library, close } = connect({
  name: "resources.test.db",
});

const makeArtist = (id: number): Artist => ({
  arts: [id + "_secondary", id + "_primary"],
  thumbnails: [null, id + "_primary"],
  title: "artist" + id.toString(),
  sources: [id + "_0", id + "_1"],
  id: id,
});

const makeAlbum = (id: number): Album => ({
  arts: [id + 100 + "_secondary", id + 100 + "_primary"],
  artists: [makeArtist(id), makeArtist(id + 50)],
  sources: [id + 100 + "_0", id + 100 + "_1"],
  thumbnails: [null, id + 100 + "_primary"],
  title: "album" + (id + 100).toString(),
  id: id + 100,
  year: 2042,
});

const makeTrack = (id: number): Track => ({
  sources: [id + 200 + "_0", id + 200 + "_1"],
  title: "track" + (id + 200).toString(),
  artists: [makeArtist(id)],
  album: makeAlbum(id),
  duration: 242 + id,
  id: id + 200,
});

it("prioritizes resources", async () => {
  await playlists.create({ title: "test" });
  await library.push([makeTrack(0)], identify("test"));
  expect(await resources).toHaveLength(3);
  expect(await resources.get(0)).toEqual({
    arts: ["0_primary", "0_secondary"],
    thumbnails: ["0_primary", null],
    sources: ["0_0", "0_1"],
  });
  expect(await resources.get(200)).toEqual({
    sources: ["200_0", "200_1"],
    thumbnails: [],
    arts: [],
  });
  await resources.prioritize("source", "0_1");
  await resources.prioritize("source", "200_1");
  expect(await resources.get(0)).toEqual({
    arts: ["0_primary", "0_secondary"],
    thumbnails: ["0_primary", null],
    sources: ["0_1", "0_0"],
  });
  expect(await resources.get(200)).toEqual({
    sources: ["200_1", "200_0"],
    thumbnails: [],
    arts: [],
  });
  await resources.prioritize("art", "0_secondary");
  expect(await resources.get(0)).toEqual({
    arts: ["0_secondary", "0_primary"],
    thumbnails: [null, "0_primary"],
    sources: ["0_1", "0_0"],
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
