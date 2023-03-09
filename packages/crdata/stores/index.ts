import { connect } from "../data";

export const {
  playlists,
  playback,
  settings,
  history,
  artists,
  library,
  tracks,
  update,
} = connect({
  name: "library.db",
});
