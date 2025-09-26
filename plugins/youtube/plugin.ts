import { register } from "@amadeus-music/core";
import { name, version } from "./package.json";
import { type Innertube } from "youtubei.js";

export const {
  info,
  init,
  search,
  relate,
  expand,
  scrape,
  lookup,
  desource,
  transcribe,
} = register({
  name,
  version,
  context: {
    youtube: {} as never as Innertube,
  },
});
