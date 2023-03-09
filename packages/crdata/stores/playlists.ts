import {
  type TrackDetails,
  identify,
  PlaylistInfo,
} from "@amadeus-music/protocol";
import { APPEND, json, groupJSON, sql } from "crstore";
import type { DB } from "../data/schema";

const uuid = () => (Math.random() * 2 ** 32) >>> 0;

export const playlists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .selectFrom((db) =>
          db
            .selectFrom("playlists")
            .leftJoin("library", "library.playlist", "playlists.id")
            .leftJoin("tracks", "tracks.id", "library.track")
            .leftJoin("albums", "albums.id", "tracks.album")
            .leftJoin("attribution", "attribution.track", "tracks.id")
            .leftJoin("artists", "artists.id", "attribution.artist")
            .select([
              "tracks.id as id",
              sql<number>`IFNULL(library.id,RANDOM())`.as("entry"),
              "playlists.id as group",
              "playlists.title as playlist",
              "playlists.relevancy as relevancy",
              "playlists.shared as shared",
              "playlists.remote as remote",
              "library.date as date",
              "tracks.title as title",
              "tracks.length as length",
              "tracks.source as source",
            ])
            .select((qb) =>
              json(qb, {
                id: "albums.id",
                title: "albums.title",
                year: "albums.year",
                source: "albums.source",
                art: "albums.art",
              }).as("album")
            )
            .select((qb) =>
              groupJSON(qb, {
                id: "artists.id",
                title: "artists.title",
                source: "artists.source",
                art: "artists.art",
              }).as("artists")
            )
            .groupBy("entry")
            .orderBy("library.order")
            .orderBy("library.id")
            .as("data")
        )
        .select([
          "group as id",
          "playlist",
          "relevancy",
          "shared",
          "remote",
          (qb) =>
            groupJSON(qb, {
              id: "id",
              entry: "entry",
              date: "date",
              title: "title",
              length: "length",
              source: "source",
              album: "album",
              artists: "artists",
            }).as("tracks"),
        ])
        .groupBy("group"),
    {
      async push(db, tracks: TrackDetails[], playlist?: number) {
        /// Do updates on conflict
        const promises = tracks.map(async (track) => {
          await db
            .insertInto("albums")
            .onConflict((x) => x.doNothing())
            .values(track.album)
            .execute();
          await db
            .insertInto("artists")
            .onConflict((x) => x.doNothing())
            .values(track.artists)
            .execute();
          await db
            .insertInto("tracks")
            .onConflict((x) => x.doNothing())
            .values({
              id: track.id,
              title: track.title,
              length: track.length,
              source: track.source,
              album: track.album.id,
            })
            .execute();
          await db
            .insertInto("attribution")
            .onConflict((x) => x.doNothing())
            .values(
              track.artists.map(({ id }) => ({
                track: track.id,
                artist: id,
              }))
            )
            .execute();
          if (playlist == null) return;
          await db
            .insertInto("library")
            .values({
              id: uuid(),
              order: APPEND,
              date: Date.now(),
              track: track.id,
              playlist,
            })
            .execute();
        });
        await Promise.all(promises);
      },
      async purge(db, entries: number[]) {
        const promises = entries.map((entry) =>
          db.deleteFrom("library").where("id", "=", entry).execute()
        );
        await Promise.all(promises);
      },
      async create(db, playlist: Partial<PlaylistInfo> & { title: string }) {
        const id = identify(playlist);
        await db
          .insertInto("playlists")
          .onConflict((x) => x.doNothing())
          .values({
            id,
            relevancy: 1,
            ...playlist,
          })
          .execute();
        return id;
      },
      async get(db, title: string) {
        return db
          .selectFrom("playlists")
          .selectAll()
          .where("id", "=", identify(title))
          .executeTakeFirstOrThrow();
      },
    }
  );
