import { Album, Artist, Track, identify } from "@amadeus-music/protocol";
import { afterAll, it } from "vitest";
import { connect } from "../data";
import { rm } from "fs/promises";
import { expect } from "vitest";

const { close, playlists, artists, library, tracks, albums } = connect({
  name: "library.test.db",
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

const fixSource = (media: Album | Artist) => ({
  ...media,
  thumbnails: media.thumbnails?.slice().reverse(),
  arts: media.arts?.slice().reverse(),
});

it("pushes artists", async () => {
  expect(await artists).toHaveLength(0);
  await artists.push([makeArtist(0)]);
  expect(await artists).toHaveLength(1);
  expect((await artists)[0]).toMatchObject({
    ...fixSource(makeArtist(0)),
    collection: { size: 0, duration: 0, tracks: [] },
  });
  await library.push([makeTrack(1), makeTrack(2)]);
  const results = await artists;
  expect(results).toHaveLength(3);
  expect(results[0]).toMatchObject({
    ...fixSource(makeArtist(1)),
    collection: { size: 1, duration: 243, tracks: [expect.anything()] },
  });
  expect(results[1]).toMatchObject({
    ...fixSource(makeArtist(2)),
    collection: { size: 1, duration: 244, tracks: [expect.anything()] },
  });
  expect(results[2]).toMatchObject({
    ...fixSource(makeArtist(0)),
    collection: { size: 0, duration: 0, tracks: [] },
  });
  expect((await artists.search("ist2"))[0]).toMatchObject(
    fixSource(makeArtist(2))
  );
  expect(await artists.get(2)).toMatchObject(fixSource(makeArtist(2)));
});

it("pushes albums", async () => {
  expect(await albums).toHaveLength(2);
  await albums.push([makeAlbum(3)]);
  const results = await albums;
  expect(results[0]).toMatchObject({
    ...fixSource(makeAlbum(1)),

    artists: [expect.anything()],
  });
  expect(results[1]).toMatchObject({
    ...fixSource(makeAlbum(2)),
    artists: [expect.anything()],
  });
  expect(results[2]).toMatchObject({
    ...fixSource(makeAlbum(3)),
    artists: [fixSource(makeArtist(3)), fixSource(makeArtist(53))],
  });
  expect(await albums.search("103")).toEqual([results[2]]);
  expect(await albums.get(103)).toEqual(results[2]);
});

it("pushes tracks", async () => {
  const track = makeTrack(0);
  const fixedAlbum = fixSource(makeAlbum(0));
  delete fixedAlbum["artists"];
  const fixedTrack = {
    ...track,
    artists: [fixSource(makeArtist(0))],
    album: fixedAlbum,
  };
  await playlists.create({ title: "Test" });
  await library.push([track], identify("Test"));
  expect(await library).toHaveLength(1);
  expect(await tracks.get(200)).toEqual(fixedTrack);
  expect(await tracks.search("k200")).toEqual([fixedTrack]);
  await playlists.create({ title: "Test2" });

  {
    const results = await playlists;
    expect(results[0]).toMatchObject({
      collection: { size: 1, duration: 242, tracks: [fixedTrack] },
      id: identify("Test"),
      title: "Test",
    });
    expect(results[1]).toMatchObject({
      collection: { size: 0, duration: 0, tracks: [] },
      id: identify("Test2"),
      title: "Test2",
    });
  }
  {
    await library.push([makeTrack(1)], identify("Test"));
    const results = (await playlists)[0];
    expect(results.collection.tracks).toHaveLength(2);
    expect(results.collection.tracks[0]).toMatchObject(fixedTrack);
    await library.rearrange(results.collection.tracks[1].entry);
    expect((await playlists)[0].collection.tracks[1]).toMatchObject(fixedTrack);
    expect(
      await library.get([results.collection.tracks[0].entry])
    ).toMatchObject([fixedTrack]);
  }

  expect((await tracks)[1]).toMatchObject(fixedTrack);
});

it("deletes tracks", async () => {
  await library.push([makeTrack(1)], identify("Test"));
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
