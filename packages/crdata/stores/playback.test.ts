import { afterAll, it, afterEach, expect } from "vitest";
import { TrackDetails } from "@amadeus-music/protocol";
import { connect } from "../data";
import { rm } from "fs/promises";

const { playback, preceding, playing, upcoming, close } = connect({
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

it("pushes tracks", async () => {
  expect(await preceding).toHaveLength(0);
  expect(await playing).toHaveLength(0);
  expect(await upcoming).toHaveLength(0);

  await playback.push([t0], "last");
  expect(await preceding).toHaveLength(0);
  expect(await playing).toMatchObject([t0]);
  expect(await upcoming).toHaveLength(0);

  await playback.push([t1], "last");
  expect(await preceding).toHaveLength(0);
  expect(await playing).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t1]);

  await playback.push([t2, t3], "last");
  expect(await preceding).toHaveLength(0);
  expect(await playing).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t1, t2, t3]);

  await playback.push([t4], "next");
  expect(await preceding).toHaveLength(0);
  expect(await playing).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t4, t1, t2, t3]);

  await playback.push([t5], "awaiting");
  expect(await preceding).toHaveLength(0);
  expect(await playing).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t4, t1, t2, t3]);
});

it("purges tracks", async () => {
  await playback.push([t0, t1, t2], "next");
  const [{ entry: current }] = await playing;
  const [{ entry: next }] = await upcoming;
  expect(next).toBeTypeOf("number");
  await playback.purge([current, next as number]);

  expect(await playing).toMatchObject([t2]);
  expect(await upcoming).toHaveLength(0);
});

it("syncs & backtracks", async () => {
  await playback.push([t0, t1], "next");
  expect(await playing).toMatchObject([t0]);
  await playback.sync(0.3);
  expect(await playing).toMatchObject([{ ...t0, state: 0.3 }]);
  await playback.sync(1);
  expect(await playing).toMatchObject([t1]);
  expect(await preceding).toMatchObject([t0]);

  await playback.backtrack();
  expect(await preceding).toHaveLength(0);
  expect(await playing).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t1]);
});

it("skips with repeat all", async () => {
  await playback.push([t0, t1, t2]);
  await playback.repeat("all");
  await playback.sync(1);
  await playback.sync(1);

  expect(await preceding).toMatchObject([t1, t0]);
  expect(await playing).toMatchObject([t2]);
  expect(await upcoming).toHaveLength(0);
  await playback.sync(1);
  expect(await preceding).toHaveLength(0);
  expect(await playing).toMatchObject([t0]);
  expect(await upcoming).toMatchObject([t1, t2]);
});

it("rearranges tracks", async () => {
  await playback.push([t0, t1, t2, t3]);
  const tracks = (await upcoming).map((x) => x.entry);
  expect(await upcoming).toMatchObject([t1, t2, t3]);
  await playback.rearrange(tracks[0], tracks[1]);
  expect(await upcoming).toMatchObject([t2, t1, t3]);
  await playback.rearrange(tracks[0], tracks[2]);
  expect(await upcoming).toMatchObject([t2, t3, t1]);
  await playback.rearrange(tracks[1], tracks[2]);
  expect(await upcoming).toMatchObject([t3, t2, t1]);
});

it("clears tracks", async () => {
  await playback.push([t0, t1]);
  await playback.sync(1);

  expect(await playing).toMatchObject([t1]);
  expect(await preceding).toMatchObject([t0]);

  await playback.clear(true);
  expect(await playing).toMatchObject([t1]);
  expect(await preceding).toHaveLength(0);
  await playback.clear();
  expect(await playing).toHaveLength(0);
});

afterAll(async () => {
  close();
  await rm("./test.db");
});

afterEach(async () => {
  await playback.clear();
  await playback.repeat("none");
  await playback.redirect("forward");
});
