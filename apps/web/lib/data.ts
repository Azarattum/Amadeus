import { connect } from "@amadeus-music/crdata";
import { writable } from "svelte/store";
import { sync } from "./trpc";

export const {
  playlists,
  preceding,
  playlist,
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

export const search = writable("");
export { target, ready } from "@amadeus-music/crdata";
