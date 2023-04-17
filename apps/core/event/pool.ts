import type {
  TrackInfo,
  AlbumInfo,
  ArtistInfo,
  Uniqueified,
} from "@amadeus-music/protocol";
import type { Database, User } from "./persistence.types";
import type { Page } from "../data/pagination";
import type { Config } from "../data/config";
import { pools, type Mapped } from "libfun";
import { aggregate } from "./aggregate";

const timeout = 1000 * 60 * 60;
const all = pools({ group: "core" });
const { pool } = all;

// Internal events
const log = pool<(text: string) => void>("log");

// Plugin events
const init = pool<(config: Config) => void>("init");
const stop = pool("stop");

// Aggregator events
type Aggregated<T> = Mapped<T, Page<Uniqueified<T>>>;

const search = pool<
  | ((type: "track", query: string, page: number) => Aggregated<TrackInfo>)
  | ((type: "album", query: string, page: number) => Aggregated<AlbumInfo>)
  | ((type: "artist", query: string, page: number) => Aggregated<ArtistInfo>)
>("search", { transform: aggregate, timeout });

const expand = pool<
  | ((type: "album", source: string, page: number) => Aggregated<TrackInfo>)
  | ((type: "artist", source: string, page: number) => Aggregated<TrackInfo>)
>("expand", { transform: aggregate, timeout });

const relate = pool<
  | ((type: "track", to: TrackInfo, page: number) => Aggregated<TrackInfo>)
  | ((type: "album", to: AlbumInfo, page: number) => Aggregated<AlbumInfo>)
  | ((type: "artist", to: ArtistInfo, page: number) => Aggregated<ArtistInfo>)
>("relate", { transform: aggregate, timeout });

const recognize = pool<
  (stream: ReadableStream<Uint8Array>, page: number) => Aggregated<TrackInfo>
>("recognize", { transform: aggregate, timeout });

const desource = pool<(source: string) => string>("desource");
const transcribe = pool<(track: TrackInfo) => string>("transcribe", {
  cache: 5,
});

// Persistence events
const persistence = pool<(user?: string) => Database>("persistence");
const users = pool<() => Record<string, User>>("users");

export {
  log,
  init,
  stop,
  users,
  search,
  relate,
  expand,
  desource,
  recognize,
  transcribe,
  persistence,
};
export { all as pools, pool };
