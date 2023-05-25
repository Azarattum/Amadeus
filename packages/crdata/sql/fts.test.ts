import { sql as query } from "crstore";
import { afterAll, it } from "vitest";
import { beforeAll } from "vitest";
import { connect } from "../data";
import { rm } from "fs/promises";
import { expect } from "vitest";

const { close, update } = connect({
  name: "fts.test.db",
});

const sql = (template: TemplateStringsArray, ...params: any[]) =>
  update((db) =>
    query(template, ...params)
      .execute(db)
      .then((x) => x.rows)
  );

beforeAll(async () => {
  await sql`DROP TABLE tracks_fts`;
  await sql`DROP TABLE albums_fts`;
  await sql`DROP TABLE artists_fts`;
  await sql`CREATE TABLE tracks_fts (tracks_fts,rowid,title,album,artists)`;
  await sql`CREATE TABLE albums_fts (albums_fts,rowid,title,artists)`;
  await sql`CREATE TABLE artists_fts (artists_fts,rowid,title)`;
});

it("indexes artists", async () => {
  await sql`INSERT INTO artists(id,title,following) VALUES (1,'ar1',0)`;
  expect(await sql`SELECT * FROM artists_fts`).toEqual([
    { artists_fts: null, rowid: 1, title: "ar1" },
  ]);

  await sql`UPDATE artists SET title='ar2'`;
  expect(await sql`SELECT * FROM artists_fts LIMIT -1 OFFSET 1`).toEqual([
    { artists_fts: "delete", rowid: 1, title: "ar1" },
    { artists_fts: null, rowid: 1, title: "ar2" },
  ]);

  await sql`DELETE FROM artists WHERE id=1`;
  expect(await sql`SELECT * FROM artists_fts LIMIT -1 OFFSET 3`).toEqual([
    { artists_fts: "delete", rowid: 1, title: "ar2" },
  ]);
});

it("indexes albums", async () => {
  await sql`INSERT INTO albums(id,title,year) VALUES (10,'al1',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,10)`;
  await sql`INSERT INTO artists(id,title,following) VALUES (1,'ar1',0)`;
  expect(await sql`SELECT * FROM albums_fts`).toEqual([
    { albums_fts: null, rowid: 10, title: "al1", artists: null },
    { albums_fts: "delete", rowid: 10, title: "al1", artists: null },
    { albums_fts: null, rowid: 10, title: "al1", artists: "ar1" },
  ]);

  await sql`INSERT INTO attribution(artist,album) VALUES (1,20)`;
  await sql`INSERT INTO albums(id,title,year) VALUES (20,'al2',0)`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 3`).toEqual([
    { albums_fts: null, rowid: 20, title: "al2", artists: "ar1" },
  ]);

  await sql`INSERT INTO albums(id,title,year) VALUES (30,'al3',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,30)`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 4`).toEqual([
    { albums_fts: null, rowid: 30, title: "al3", artists: null },
    { albums_fts: "delete", rowid: 30, title: "al3", artists: null },
    { albums_fts: null, rowid: 30, title: "al3", artists: "ar1" },
  ]);

  await sql`UPDATE albums SET title='al4' WHERE id = 30`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 7`).toEqual([
    { albums_fts: "delete", rowid: 30, title: "al3", artists: "ar1" },
    { albums_fts: null, rowid: 30, title: "al4", artists: "ar1" },
  ]);
  await sql`UPDATE artists SET title='ar2'`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 9`).toEqual([
    { albums_fts: "delete", rowid: 10, title: "al1", artists: "ar1" },
    { albums_fts: "delete", rowid: 20, title: "al2", artists: "ar1" },
    { albums_fts: "delete", rowid: 30, title: "al4", artists: "ar1" },
    { albums_fts: null, rowid: 10, title: "al1", artists: "ar2" },
    { albums_fts: null, rowid: 20, title: "al2", artists: "ar2" },
    { albums_fts: null, rowid: 30, title: "al4", artists: "ar2" },
  ]);

  await sql`DELETE FROM albums WHERE id=30`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 15`).toEqual([
    { albums_fts: "delete", rowid: 30, title: "al4", artists: "ar2" },
  ]);
  await sql`DELETE FROM attribution WHERE album=20 AND artist=1`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 16`).toEqual([
    { albums_fts: "delete", rowid: 20, title: "al2", artists: "ar2" },
  ]);
  await sql`DELETE FROM artists WHERE id=1`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 17`).toEqual([
    { albums_fts: "delete", rowid: 10, title: "al1", artists: "ar2" },
  ]);

  await sql`DELETE FROM albums`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 18`).toEqual([]);
});

it("indexes tracks", async () => {
  const tracks_fts = "delete";
  await sql`INSERT INTO albums(id,title,year) VALUES (10,'al1',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,10)`;
  await sql`INSERT INTO artists(id,title,following) VALUES (1,'ar1',0)`;
  await sql`INSERT INTO tracks(id,title,duration,album) VALUES (-1,'tr1',0,10)`;
  expect(await sql`SELECT * FROM tracks_fts`).toEqual([
    { tracks_fts: null, rowid: -1, title: "tr1", album: "al1", artists: "ar1" },
  ]);

  await sql`INSERT INTO tracks(id,title,duration,album) VALUES (-2,'tr2',0,30)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,30)`;
  await sql`INSERT INTO albums(id,title,year) VALUES (30,'al3',0)`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 1`).toEqual([
    { tracks_fts: null, rowid: -2, title: "tr2", album: null, artists: null },
    { tracks_fts, rowid: -2, title: "tr2", album: null, artists: null },
    { tracks_fts: null, rowid: -2, title: "tr2", album: "al3", artists: "ar1" },
  ]);

  await sql`INSERT INTO tracks(id,title,duration,album) VALUES (-3,'tr3',0,40)`;
  await sql`INSERT INTO albums(id,title,year) VALUES (40,'al4',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,40)`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 4`).toEqual([
    { tracks_fts: null, rowid: -3, title: "tr3", album: null, artists: null },
    { tracks_fts, rowid: -3, title: "tr3", album: null, artists: null },
    { tracks_fts: null, rowid: -3, title: "tr3", album: "al4", artists: "ar1" },
  ]);

  await sql`INSERT INTO tracks(id,title,duration,album) VALUES (-4,'tr4',0,50)`;
  await sql`INSERT INTO albums(id,title,year) VALUES (50,'al5',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (2,50)`;
  await sql`INSERT INTO artists(id,title,following) VALUES (2,'ar2',0)`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 7`).toEqual([
    { tracks_fts: null, rowid: -4, title: "tr4", album: null, artists: null },
    { tracks_fts, rowid: -4, title: "tr4", album: null, artists: null },
    { tracks_fts: null, rowid: -4, title: "tr4", album: "al5", artists: "ar2" },
  ]);

  await sql`UPDATE albums SET title='al6' WHERE id = 50`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 10`).toEqual([
    { tracks_fts, rowid: -4, title: "tr4", album: "al5", artists: "ar2" },
    { tracks_fts: null, rowid: -4, title: "tr4", album: "al6", artists: "ar2" },
  ]);
  await sql`UPDATE artists SET title='ar3' WHERE id = 2`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 12`).toEqual([
    { tracks_fts, rowid: -4, title: "tr4", album: "al6", artists: "ar2" },
    { tracks_fts: null, rowid: -4, title: "tr4", album: "al6", artists: "ar3" },
  ]);

  await sql`DELETE FROM artists WHERE id=2`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 14`).toEqual([
    { tracks_fts, rowid: -4, title: "tr4", album: "al6", artists: "ar3" },
  ]);
  await sql`DELETE FROM attribution WHERE album=40 AND artist=1`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 15`).toEqual([
    { tracks_fts, rowid: -3, title: "tr3", album: "al4", artists: "ar1" },
  ]);
  await sql`DELETE FROM albums WHERE id=30`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 16`).toEqual([
    { tracks_fts, rowid: -2, title: "tr2", album: "al3", artists: "ar1" },
  ]);
  await sql`DELETE FROM tracks WHERE id=-1`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 17`).toEqual([
    { tracks_fts, rowid: -1, title: "tr1", album: "al1", artists: "ar1" },
  ]);

  await sql`DELETE FROM tracks`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 18`).toEqual([]);
});

afterAll(async () => {
  close();
  await rm("./fts.test.db");
});
