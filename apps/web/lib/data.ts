import { connect } from "@amadeus-music/crdata";
import { writable } from "svelte/store";
import { sync } from "./trpc";

export const {
  playlists,
  resources,
  preceding,
  playback,
  upcoming,
  settings,
  history,
  artists,
  library,
  albums,
  tracks,
  update,
  feed,
} = connect({
  pull: sync.pull.subscribe,
  push: sync.push.mutate,
  name: "library.db",
});

export const search = writable("");
export { ready } from "@amadeus-music/crdata";
