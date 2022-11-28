import type { Album, Artist, Source, Record } from "@amadeus-music/protocol";
import type { BaseConfig } from "../data/config";
import { pools } from "libfun";

const all = pools({ group: "core" });
const { pool } = all;

// Internal events
const log = pool<(text: string) => void>("log");

// Plugin events
const init = pool<(config: BaseConfig) => void>("init");
const stop = pool("stop");

// Aggregator events
const search = pool<
  | ((type: "track", query: string) => Record)
  | ((type: "album", query: string) => Album)
  | ((type: "artist", query: string) => Artist)
>("search");
const desource = pool<(sources: string[]) => Source>("desource");
/// TODO:
//  Provider
//    - relate
//    - recognize
//  Preserver
//    - retrieve
//    - save
//    - modify
//    - delete
//  ???
//    - follow
//    - unfollow

export { log, init, stop, search, desource };
export { all as pools, pool };
