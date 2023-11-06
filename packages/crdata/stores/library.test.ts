import { identify, Artist, Album, Track } from "@amadeus-music/protocol";
import { afterAll, it } from "vitest";
import { connect } from "../data";
import { rm } from "fs/promises";
import { expect } from "vitest";

const { playlists, artists, library, tracks, albums, close } = connect({
  name: "library.test.db",
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

const fixSource = (media: Artist | Album) => ({
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
    collection: { duration: 0, tracks: [], size: 0 },
  });
  await library.push([makeTrack(1), makeTrack(2)]);
  const results = await artists;
  expect(results).toHaveLength(3);
  expect(results[0]).toMatchObject({
    ...fixSource(makeArtist(1)),
    collection: { tracks: [expect.anything()], duration: 243, size: 1 },
  });
  expect(results[1]).toMatchObject({
    ...fixSource(makeArtist(2)),
    collection: { tracks: [expect.anything()], duration: 244, size: 1 },
  });
  expect(results[2]).toMatchObject({
    ...fixSource(makeArtist(0)),
    collection: { duration: 0, tracks: [], size: 0 },
  });
  expect((await artists.search("ist2"))[0]).toMatchObject(
    fixSource(makeArtist(2)),
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
      collection: { tracks: [fixedTrack], duration: 242, size: 1 },
      id: identify("Test"),
      title: "Test",
    });
    expect(results[1]).toMatchObject({
      collection: { duration: 0, tracks: [], size: 0 },
      id: identify("Test2"),
      title: "Test2",
    });
  }
  {
    await new Promise((r) => setTimeout(r, 1000));
    await library.push([makeTrack(1)], identify("Test"));
    const results = (await playlists)[0];
    expect(results.collection.tracks).toHaveLength(2);
    expect(results.collection.tracks[0]).toMatchObject(fixedTrack);
    await library.rearrange(results.collection.tracks[1].entry);
    expect((await playlists)[0].collection.tracks[1]).toMatchObject(fixedTrack);
    expect(
      await library.get([results.collection.tracks[0].entry]),
    ).toMatchObject([fixedTrack]);
  }

  expect((await tracks)[1]).toMatchObject(fixedTrack);
});

it("purges tracks", async () => {
  const [{ collection }] = await playlists;
  expect(collection.tracks).toHaveLength(2);
  expect(await library).toHaveLength(2);
  expect(await albums).toHaveLength(4);
  await library.purge([collection.tracks[0].entry]);
  expect(await albums).toHaveLength(3);
  expect(await library).toHaveLength(1);
  expect(await playlists).toHaveLength(2);
  expect((await playlists)[0].collection.tracks).toHaveLength(1);
  expect(await artists).toHaveLength(4);
  await library.purge([collection.tracks[1].entry]);
  expect(await albums).toHaveLength(2);
  expect(await library).toHaveLength(0);
  expect(await playlists).toHaveLength(2);
  expect((await playlists)[0].collection.tracks).toHaveLength(0);
  expect(await artists).toHaveLength(3);
});

afterAll(async () => {
  close();
  await rm("./library.test.db");
});
