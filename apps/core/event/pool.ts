import type { Album, Artist, Track } from "@amadeus-music/protocol";
import type { BaseConfig } from "../data/config";
import { err } from "../status/log";
import { pools } from "libfun";

const all = pools({ group: "core" });
const { pool } = all;
all.catch(err);

// Internal events
const log = pool<(text: string) => void>("log");

// Plugin events
const init = pool<(config: BaseConfig) => void>("init");
const stop = pool("stop");

// Aggregator events
const search = pool<
  | ((type: "track", query: string) => Track)
  | ((type: "album", query: string) => Album)
  | ((type: "artist", query: string) => Artist)
>("search");
/// TODO:
//  Provider
//    - relate
//    - recognize
//    - desource
//  Preserver
//    - retrieve
//    - save
//    - modify
//    - delete
//  ???
//    - follow
//    - unfollow

export { log, init, stop, search };
export { all as pools, pool };
