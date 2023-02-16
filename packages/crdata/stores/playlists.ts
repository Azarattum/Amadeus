import { type TrackDetails, identify } from "@amadeus-music/protocol";
import { APPEND, json, groupJSON } from "crstore";
import type { DB } from "../data/schema";

const uuid = () => (Math.random() * 2 ** 32) >>> 0;

export const playlists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .selectFrom((db) =>
          db
            .selectFrom("playlists")
            .innerJoin("library", "library.playlist", "playlists.id")
            .innerJoin("tracks", "tracks.id", "library.track")
            .innerJoin("albums", "albums.id", "tracks.album")
            .innerJoin("catalogue", "catalogue.album", "albums.id")
            .innerJoin("artists", "artists.id", "catalogue.artist")
            .select([
              "tracks.id as id",
              "library.id as entry",
              "playlists.id as group",
              "playlists.title as playlist",
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
            .groupBy("library.id")
            .orderBy("library.order")
            .orderBy("library.id")
            .as("data")
        )
        .select([
          "group as id",
          "playlist",
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
            .insertInto("catalogue")
            .onConflict((x) => x.doNothing())
            .values(
              track.artists.map(({ id }) => ({
                artist: id,
                album: track.album.id,
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
        const promises = entries.map(async (entry) => {
          const { track } = await db
            .deleteFrom("library")
            .where("id", "=", entry)
            .returning(["track"])
            .executeTakeFirstOrThrow();
          {
            const { count } = await db
              .selectFrom("library")
              .where("track", "=", track)
              .select(db.fn.count("id").as("count"))
              .executeTakeFirstOrThrow();
            if (count !== 0) return;
          }
          const { album } = await db
            .deleteFrom("tracks")
            .where("id", "=", track)
            .returning("album")
            .executeTakeFirstOrThrow();
          /// What should happen to "playback"?
          {
            const { count } = await db
              .selectFrom("tracks")
              .where("album", "=", album)
              .select(db.fn.count("id").as("count"))
              .executeTakeFirstOrThrow();
            if (count !== 0) return;
          }
          await db.deleteFrom("albums").where("id", "=", album).execute();
          const artists = await db
            .deleteFrom("catalogue")
            .where("album", "=", album)
            .returning("artist")
            .execute();
          artists.forEach(async ({ artist }) => {
            const { count } = await db
              .selectFrom("catalogue")
              .where("artist", "=", artist)
              .select(db.fn.count("id").as("count"))
              .executeTakeFirstOrThrow();
            if (count !== 0) return;
            await db.deleteFrom("artists").where("id", "=", artist).execute();
            /// What should happen to "following"?
          });
        });
        await Promise.all(promises);
      },
      async create(db, playlist: string) {
        await db
          .insertInto("playlists")
          .values({
            id: identify(playlist),
            title: playlist,
            relevancy: 1,
          })
          .execute();
      },
    }
  );
