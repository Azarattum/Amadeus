import { connect } from "../data";

export const { playlists, history, artists, tracks, settings, update } =
  connect({
    name: "library.db",
  });
