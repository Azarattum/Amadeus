import { sql as query } from "crstore";
import { afterAll, it } from "vitest";
import { beforeAll } from "vitest";
import { connect } from "../data";
import { rm } from "fs/promises";
import { expect } from "vitest";

const { update, close } = connect({
  name: "fts.test.db",
});

const sql = (template: TemplateStringsArray, ...params: any[]) =>
  update((db) =>
    query(template, ...params)
      .execute(db)
      .then((x) => x.rows),
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
    { artists_fts: null, title: "ar1", rowid: 1 },
  ]);

  await sql`UPDATE artists SET title='ar2'`;
  expect(await sql`SELECT * FROM artists_fts LIMIT -1 OFFSET 1`).toEqual([
    { artists_fts: "delete", title: "ar1", rowid: 1 },
    { artists_fts: null, title: "ar2", rowid: 1 },
  ]);

  await sql`DELETE FROM artists WHERE id=1`;
  expect(await sql`SELECT * FROM artists_fts LIMIT -1 OFFSET 3`).toEqual([
    { artists_fts: "delete", title: "ar2", rowid: 1 },
  ]);
});

it("indexes albums", async () => {
  await sql`INSERT INTO albums(id,title,year) VALUES (10,'al1',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,10)`;
  await sql`INSERT INTO artists(id,title,following) VALUES (1,'ar1',0)`;
  expect(await sql`SELECT * FROM albums_fts`).toEqual([
    { albums_fts: null, artists: null, title: "al1", rowid: 10 },
    { albums_fts: "delete", artists: null, title: "al1", rowid: 10 },
    { albums_fts: null, artists: "ar1", title: "al1", rowid: 10 },
  ]);

  await sql`INSERT INTO attribution(artist,album) VALUES (1,20)`;
  await sql`INSERT INTO albums(id,title,year) VALUES (20,'al2',0)`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 3`).toEqual([
    { albums_fts: null, artists: "ar1", title: "al2", rowid: 20 },
  ]);

  await sql`INSERT INTO albums(id,title,year) VALUES (30,'al3',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,30)`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 4`).toEqual([
    { albums_fts: null, artists: null, title: "al3", rowid: 30 },
    { albums_fts: "delete", artists: null, title: "al3", rowid: 30 },
    { albums_fts: null, artists: "ar1", title: "al3", rowid: 30 },
  ]);

  await sql`UPDATE albums SET title='al4' WHERE id = 30`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 7`).toEqual([
    { albums_fts: "delete", artists: "ar1", title: "al3", rowid: 30 },
    { albums_fts: null, artists: "ar1", title: "al4", rowid: 30 },
  ]);
  await sql`UPDATE artists SET title='ar2'`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 9`).toEqual([
    { albums_fts: "delete", artists: "ar1", title: "al1", rowid: 10 },
    { albums_fts: "delete", artists: "ar1", title: "al2", rowid: 20 },
    { albums_fts: "delete", artists: "ar1", title: "al4", rowid: 30 },
    { albums_fts: null, artists: "ar2", title: "al1", rowid: 10 },
    { albums_fts: null, artists: "ar2", title: "al2", rowid: 20 },
    { albums_fts: null, artists: "ar2", title: "al4", rowid: 30 },
  ]);

  await sql`DELETE FROM albums WHERE id=30`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 15`).toEqual([
    { albums_fts: "delete", artists: "ar2", title: "al4", rowid: 30 },
  ]);
  await sql`DELETE FROM attribution WHERE album=20 AND artist=1`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 16`).toEqual([
    { albums_fts: "delete", artists: "ar2", title: "al2", rowid: 20 },
  ]);
  await sql`DELETE FROM artists WHERE id=1`;
  expect(await sql`SELECT * FROM albums_fts LIMIT -1 OFFSET 17`).toEqual([
    { albums_fts: "delete", artists: "ar2", title: "al1", rowid: 10 },
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
    { tracks_fts: null, artists: "ar1", title: "tr1", album: "al1", rowid: -1 },
  ]);

  await sql`INSERT INTO tracks(id,title,duration,album) VALUES (-2,'tr2',0,30)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,30)`;
  await sql`INSERT INTO albums(id,title,year) VALUES (30,'al3',0)`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 1`).toEqual([
    { tracks_fts: null, artists: null, title: "tr2", album: null, rowid: -2 },
    { artists: null, title: "tr2", album: null, tracks_fts, rowid: -2 },
    { tracks_fts: null, artists: "ar1", title: "tr2", album: "al3", rowid: -2 },
  ]);

  await sql`INSERT INTO tracks(id,title,duration,album) VALUES (-3,'tr3',0,40)`;
  await sql`INSERT INTO albums(id,title,year) VALUES (40,'al4',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (1,40)`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 4`).toEqual([
    { tracks_fts: null, artists: null, title: "tr3", album: null, rowid: -3 },
    { artists: null, title: "tr3", album: null, tracks_fts, rowid: -3 },
    { tracks_fts: null, artists: "ar1", title: "tr3", album: "al4", rowid: -3 },
  ]);

  await sql`INSERT INTO tracks(id,title,duration,album) VALUES (-4,'tr4',0,50)`;
  await sql`INSERT INTO albums(id,title,year) VALUES (50,'al5',0)`;
  await sql`INSERT INTO attribution(artist,album) VALUES (2,50)`;
  await sql`INSERT INTO artists(id,title,following) VALUES (2,'ar2',0)`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 7`).toEqual([
    { tracks_fts: null, artists: null, title: "tr4", album: null, rowid: -4 },
    { artists: null, title: "tr4", album: null, tracks_fts, rowid: -4 },
    { tracks_fts: null, artists: "ar2", title: "tr4", album: "al5", rowid: -4 },
  ]);

  await sql`UPDATE albums SET title='al6' WHERE id = 50`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 10`).toEqual([
    { artists: "ar2", title: "tr4", album: "al5", tracks_fts, rowid: -4 },
    { tracks_fts: null, artists: "ar2", title: "tr4", album: "al6", rowid: -4 },
  ]);
  await sql`UPDATE artists SET title='ar3' WHERE id = 2`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 12`).toEqual([
    { artists: "ar2", title: "tr4", album: "al6", tracks_fts, rowid: -4 },
    { tracks_fts: null, artists: "ar3", title: "tr4", album: "al6", rowid: -4 },
  ]);

  await sql`DELETE FROM artists WHERE id=2`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 14`).toEqual([
    { artists: "ar3", title: "tr4", album: "al6", tracks_fts, rowid: -4 },
  ]);
  await sql`DELETE FROM attribution WHERE album=40 AND artist=1`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 15`).toEqual([
    { artists: "ar1", title: "tr3", album: "al4", tracks_fts, rowid: -3 },
  ]);
  await sql`DELETE FROM albums WHERE id=30`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 16`).toEqual([
    { artists: "ar1", title: "tr2", album: "al3", tracks_fts, rowid: -2 },
  ]);
  await sql`DELETE FROM tracks WHERE id=-1`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 17`).toEqual([
    { artists: "ar1", title: "tr1", album: "al1", tracks_fts, rowid: -1 },
  ]);

  await sql`DELETE FROM tracks`;
  expect(await sql`SELECT * FROM tracks_fts LIMIT -1 OFFSET 18`).toEqual([]);
});

afterAll(async () => {
  close();
  await rm("./fts.test.db");
});
