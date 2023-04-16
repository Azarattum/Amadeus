import { afterAll, it, afterEach, expect } from "vitest";
import { TrackDetails } from "@amadeus-music/protocol";
import { connect } from "../data";
import { rm } from "fs/promises";

const { playback, preceding, upcoming, close, feed } = connect({
  name: "test.db",
});

const track = (id: number): TrackDetails => ({
  id,
  title: id.toString(),
  length: 42,
  source: "[]",
  album: { id: 0, title: "Album", source: "[]", year: 2042, art: "[]" },
  artists: [{ id: 0, title: "Artist", art: "[]", source: "[]" }],
});

const t0 = track(0);
const t1 = track(1);
const t2 = track(2);
const t3 = track(3);
const t4 = track(4);
const t5 = track(5);

it("pushes with direction", async () => {
  expect(await preceding).toHaveLength(0);
  expect(await playback).toHaveLength(0);
  expect(await upcoming).toHaveLength(0);

  await playback.push([t0], "last");
  expect(await preceding).toHaveLength(0);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toHaveLength(0);

  await playback.push([t1], "last");
  expect(await preceding).toHaveLength(0);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t1]);

  await playback.push([t2, t3], "last");
  expect(await preceding).toHaveLength(0);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t1, t2, t3]);

  await playback.push([t4], "next");
  expect(await preceding).toHaveLength(0);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t4, t1, t2, t3]);

  await playback.push([t5, t0], "first");
  expect(await preceding).toMatchObject([t5, t0]);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t4, t1, t2, t3]);

  await playback.redirect("backward");
  expect(await preceding).toMatchObject([t3, t2, t1, t4]);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t0, t5]);

  await playback.push([t0, t1], "first");
  expect(await preceding).toMatchObject([t0, t1, t3, t2, t1, t4]);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t0, t5]);

  await playback.push([t2, t3], "next");
  expect(await preceding).toMatchObject([t0, t1, t3, t2, t1, t4]);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t2, t3, t0, t5]);

  await playback.push([t4, t5], "last");
  expect(await preceding).toMatchObject([t0, t1, t3, t2, t1, t4]);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t2, t3, t0, t5, t4, t5]);

  await playback.redirect("forward");
  expect(await preceding).toMatchObject([t5, t4, t5, t0, t3, t2]);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t4, t1, t2, t3, t1, t0]);

  await playback.clear();
  await playback.push([t1, t2], "last");
  await playback.push([t0], "first");
  await playback.push([t3, t4, t5], "random");
  expect(await preceding).toMatchObject([t0]);
  expect(await playback).toMatchObject([t1]);
  const expected = [t2, t3, t4, t5].map((t) => expect.objectContaining(t));
  const notExpected = [t0, t1].map((t) => expect.objectContaining(t));
  expect(await upcoming).toEqual(expect.arrayContaining(expected));
  expect(await upcoming).not.toEqual(expect.arrayContaining(notExpected));

  do {
    await playback.clear();
    await playback.push([t2, t3, t4, t5], "random");
  } while ((await playback)[0].id === 2);
});

it("pushes after index", async () => {
  await playback.push([t0, t1, t2]);
  const [{ entry: current }] = await playback;
  const [{ entry: next }] = await upcoming;
  expect(next).toBeTypeOf("number");

  expect(await upcoming).toMatchObject([t1, t2]);
  await playback.push([t3, t4], next);
  expect(await upcoming).toMatchObject([t1, t3, t4, t2]);
  await playback.push([t5, t0], current);
  expect(await upcoming).toMatchObject([t5, t0, t1, t3, t4, t2]);
  await playback.sync(1);
  await playback.sync(1);
  await playback.redirect("backward");
  expect(await upcoming).toMatchObject([t5, t0]);
  const [{ entry: after2 }] = await preceding;
  const [{ entry: after0 }] = await playback;
  const [{ entry: after5 }] = await upcoming;
  await playback.push([t3, t4], after5);
  expect(await upcoming).toMatchObject([t5, t3, t4, t0]);
  await playback.push([t1, t2], after0);
  expect(await upcoming).toMatchObject([t1, t2, t5, t3, t4, t0]);
  await playback.push([t5, t0], after2);
  expect(await preceding).toMatchObject([t2, t5, t0, t4, t3, t1]);
});

it("pushes randomly", async () => {
  await playback.push([t2, t3, t4, t5]);
  await playback.push([t0, t1], "first");
  expect(await preceding).toMatchObject([t0, t1]);
  expect(await playback).toMatchObject([t2]);
  expect(await upcoming).toMatchObject([t3, t4, t5]);

  await playback.redirect("shuffled");
  expect(await preceding).toMatchObject([]);
  expect(await playback).toMatchObject([t2]);
  const tracks = await upcoming;
  const expected = [t0, t1, t3, t4, t5].map((t) => expect.objectContaining(t));
  expect(tracks).toEqual(expect.arrayContaining(expected));
  expect(tracks).not.toEqual(
    expect.arrayContaining([expect.objectContaining(t2)])
  );

  const next = tracks[0];
  await playback.sync(1);
  expect(await preceding).toMatchObject([t2]);
  expect(await playback).toMatchObject([next]);
  expect(await upcoming).not.toEqual(
    expect.arrayContaining([expect.objectContaining(next)])
  );

  await playback.redirect("forward");
  (await preceding).forEach((x) => expect(x.id < next.id));
  expect(await playback).toMatchObject([next]);
  (await upcoming).forEach((x) => expect(x.id > next.id));
});

it("purges tracks", async () => {
  await playback.push([t0, t1, t2]);
  const [{ entry: current }] = await playback;
  const [{ entry: next }] = await upcoming;
  expect(next).toBeTypeOf("number");
  await playback.sync(0.5);
  await playback.purge([current, next as number]);

  expect(await playback).toMatchObject([{ ...t2, progress: 0 }]);
  expect(await upcoming).toHaveLength(0);
});

it("syncs progress", async () => {
  await playback.push([t0, t1], "next");
  expect(await playback).toMatchObject([t0]);
  await playback.sync(0.3);
  expect(await playback).toMatchObject([{ ...t0, progress: 0.3 }]);
  await playback.sync(1);
  expect(await playback).toMatchObject([{ ...t1, progress: 0 }]);
  expect(await preceding).toMatchObject([t0]);
  await playback.sync(1);
  expect(await playback).toMatchObject([t1]);
  await playback.sync(0.5);

  await playback.sync(-1);
  expect(await preceding).toHaveLength(0);
  expect(await playback).toMatchObject([{ ...t0, progress: 0 }]);
  expect(await upcoming).toMatchObject([t1]);
  await playback.sync(-1);
  expect(await playback).toMatchObject([t0]);

  expect((await feed)[0].tracks).toMatchObject([t1, t0]);
});

it("skips with repeat all", async () => {
  await playback.push([t0, t1, t2]);
  await playback.repeat("all");
  await playback.sync(1);
  await playback.sync(1);

  expect(await preceding).toMatchObject([t0, t1]);
  expect(await playback).toMatchObject([t2]);
  expect(await upcoming).toHaveLength(0);
  await playback.sync(1);
  expect(await preceding).toHaveLength(0);
  expect(await playback).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t1, t2]);
});

it("clears tracks", async () => {
  await playback.push([t0, t1]);
  await playback.sync(1);

  expect(await playback).toMatchObject([t1]);
  expect(await preceding).toMatchObject([t0]);
  await playback.clear();
  expect(await playback).toHaveLength(0);
});

it("rearranges tracks", async () => {
  await playback.push([t0, t1, t2, t3, t4, t5]);
  let tracks = [...(await playback), ...(await upcoming)];

  expect(tracks).toMatchObject([t0, t1, t2, t3, t4, t5]);
  await playback.rearrange(tracks[5].entry, tracks[1].entry);
  expect(await upcoming).toMatchObject([t1, t5, t2, t3, t4]);
  await playback.rearrange(tracks[3].entry);
  expect(await upcoming).toMatchObject([t1, t5, t2, t4]);
  expect(await preceding).toMatchObject([t3]);
  for (let i = 0; i < 4; i++) await playback.sync(1);
  expect(await upcoming).toMatchObject([]);
  expect(await preceding).toMatchObject([t3, t0, t1, t5, t2]);

  await playback.redirect("backward");
  expect(await upcoming).toMatchObject([t2, t5, t1, t0, t3]);
  await playback.rearrange(tracks[1].entry, tracks[2].entry);
  expect(await upcoming).toMatchObject([t2, t1, t5, t0, t3]);
  await playback.rearrange(tracks[5].entry);
  expect(await upcoming).toMatchObject([t2, t1, t0, t3]);
  expect(await preceding).toMatchObject([t5]);
  await playback.rearrange(tracks[1].entry, tracks[5].entry);
  expect(await upcoming).toMatchObject([t2, t0, t3]);
  expect(await preceding).toMatchObject([t5, t1]);

  await playback.redirect("shuffled");
  tracks = await upcoming;
  await playback.rearrange(tracks[3].entry, tracks[1].entry);
  tracks.splice(2, 0, tracks.splice(3, 1)[0]);
  expect(await upcoming).toMatchObject(tracks);

  await playback.redirect("backward");
  expect(await upcoming).toMatchObject([t2, t0, t3]);
});

it("inserts when shuffled", async () => {
  await playback.push([t0, t1, t2, t3]);
  await playback.redirect("shuffled");
  const expected = [t1, t2, t3].map((t) => expect.objectContaining(t));
  const all = [t0, t1, t2, t3, t4, t5].map((t) => expect.objectContaining(t));
  expect(await upcoming).toEqual(expect.arrayContaining(expected));
  expect(await upcoming).not.toEqual(expect.arrayContaining(all));

  await playback.push([t0, t4], "last");
  await playback.push([t5, t4], "next");
  await playback.push([t1, t2], "first");
  expect((await upcoming).slice(0, 2)).toMatchObject([t5, t4]);
  expect(await upcoming).toEqual(expect.arrayContaining(expected));
  expect((await upcoming).slice(-2)).toMatchObject([t0, t4]);
  expect(await preceding).toMatchObject([t1, t2]);
  const [{ entry }] = await upcoming;
  await playback.push([t1, t2], entry);
  expect((await upcoming).slice(0, 4)).toMatchObject([t5, t1, t2, t4]);

  /// TODO: uncomment when shuffled insert is implemented
  // await playback.redirect("forward");
  // expect(await upcoming).toMatchObject([t5, t4, t1, t2, t3, t0, t4, t1, t2]);
  // expect(await preceding).toMatchObject([t1, t2]);
  // await playback.redirect("shuffled");
  // expect(await upcoming).toEqual(expect.arrayContaining(all));
});

afterAll(async () => {
  close();
  await rm("./test.db");
});

afterEach(async () => {
  await playback.clear();
  await playback.repeat("none");
  await playback.redirect("forward");
  await feed.clear("listened");
});
