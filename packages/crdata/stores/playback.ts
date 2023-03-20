import type {
  TrackDetails,
  PlaybackRepeat,
  PlaybackDirection,
  PlaybackPosition,
} from "@amadeus-music/protocol";
import type { DB } from "../data/schema";

export const playback = ({ store }: DB) =>
  store((db) => db.selectFrom("playback").selectAll(), {
    async push(db, tracks: TrackDetails[], position?: PlaybackPosition) {
      /// TODO
    },
    async purge(db, entries: number[]) {
      /// TODO
    },
    async clear(db, onlyHistory?: boolean) {
      /// TODO
    },

    async synchronize(db, progress: number) {
      /// TODO
    },
    async play(db, track: TrackDetails) {
      /// TODO
    },
    async previous(db) {
      /// TODO
    },
    async next(db) {
      /// TODO
    },

    async rearrange(db, track: number, after?: number) {
      /// TODO
    },
    async redirect(db, direction: PlaybackDirection) {
      /// TODO
    },
    async repeat(db, type: PlaybackRepeat) {
      /// TODO
    },
  });
