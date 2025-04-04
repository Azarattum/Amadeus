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
  name: "library.db",
  push: sync.push.mutate,
  pull: sync.pull.subscribe,
});

export const search = writable("");
export const extra = writable(null as [string, string] | null);
export { ready } from "@amadeus-music/crdata";
