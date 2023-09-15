import { register } from "@amadeus-music/core";
import { name, version } from "./package.json";
import { type Innertube } from "youtubei.js";

export const {
  info,
  init,
  search,
  relate,
  expand,
  lookup,
  desource,
  transcribe,
} = register({
  name,
  version,
  context: {
    youtube: {
      music: {} as never as Innertube["music"],
      player: {} as never as Innertube["session"]["player"],
    },
  },
});
