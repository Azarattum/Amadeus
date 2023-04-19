import { connect } from "@amadeus-music/crdata";
import { sync } from "./trpc";

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
} = connect({
  name: "library.db",
  push: sync.push.mutate,
  pull: sync.pull.subscribe,
});
