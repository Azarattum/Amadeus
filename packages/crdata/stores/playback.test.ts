import { afterAll, it, afterEach, expect } from "vitest";
import { TrackDetails } from "@amadeus-music/protocol";
import { connect } from "../data";
import { rm } from "fs/promises";

const { playback, preceding, playing, upcoming, update, close } = connect({
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

afterAll(async () => {
  close();
  await rm("./test.db");
});

afterEach(async () => {
  await playback.clear();
});
