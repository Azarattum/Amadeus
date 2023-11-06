import type {
  ArtistInfo,
  TrackInfo,
  AlbumInfo,
  MediaInfo,
  FromInfo,
} from "@amadeus-music/protocol";
import type { Database, User } from "./persistence.types";
import type { Page } from "../data/pagination";
import type { Config } from "../data/config";
import { type Mapped, pools } from "libfun";
import { aggregate } from "./aggregate";

const rate = 90;
const timeout = 1000 * 60 * 60;
const all = pools({ group: "core" });
const { pool } = all;

// Internal events
const log = pool<(text: string) => void>("log");

// Plugin events
const init = pool<(config: Config) => void>("init");
const stop = pool("stop");

// Aggregator events
type Aggregated<T extends MediaInfo> = Mapped<T, Page<FromInfo<T>>>;

const search = pool<
  | ((type: "artist", query: string, page: number) => Aggregated<ArtistInfo>)
  | ((type: "track", query: string, page: number) => Aggregated<TrackInfo>)
  | ((type: "album", query: string, page: number) => Aggregated<AlbumInfo>)
>("search", { transform: aggregate, timeout, rate });

const expand = pool<
  | ((type: "artist", what: ArtistInfo, page: number) => Aggregated<TrackInfo>)
  | ((type: "album", what: AlbumInfo, page: number) => Aggregated<TrackInfo>)
>("expand", { transform: aggregate, timeout });

const relate = pool<
  | ((type: "artist", to: ArtistInfo, page: number) => Aggregated<ArtistInfo>)
  | ((type: "track", to: TrackInfo, page: number) => Aggregated<TrackInfo>)
  | ((type: "album", to: AlbumInfo, page: number) => Aggregated<AlbumInfo>)
>("relate", { transform: aggregate, timeout, rate });

const scrape = pool<(url: string, page: number) => Aggregated<TrackInfo>>(
  "scrape",
  { transform: aggregate, timeout },
);

const recognize = pool<
  (
    stream: () => ReadableStream<Uint8Array>,
    page: number,
  ) => Aggregated<TrackInfo>
>("recognize", { transform: aggregate, timeout });

const desource = pool<(track: TrackInfo) => string>("desource");
const transcribe = pool<(track: TrackInfo) => string>("transcribe", {
  cache: 5,
  rate,
});

// Persistence events
const persistence = pool<(user?: string) => Database>("persistence");
const users = pool<() => Record<string, User>>("users");

export {
  persistence,
  transcribe,
  recognize,
  desource,
  search,
  relate,
  expand,
  scrape,
  users,
  init,
  stop,
  log,
};
export { all as pools, pool };
