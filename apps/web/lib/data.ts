import { connect } from "@amadeus-music/crdata";
import { pull, push } from "./trpc";

export const {
  playlists,
  preceding,
  playback,
  upcoming,
  settings,
  history,
  artists,
  library,
  tracks,
  update,
  feed,
} = connect({ name: "library.db", push: push.mutate, pull: pull.subscribe });
