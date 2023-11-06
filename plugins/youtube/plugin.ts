import { register } from "@amadeus-music/core";
import { version, name } from "./package.json";
import { type Innertube } from "youtubei.js";

export const {
  transcribe,
  desource,
  search,
  relate,
  expand,
  scrape,
  lookup,
  info,
  init,
} = register({
  context: {
    youtube: {
      player: {} as never as Innertube["session"]["player"],
      music: {} as never as Innertube["music"],
    },
  },
  version,
  name,
});
