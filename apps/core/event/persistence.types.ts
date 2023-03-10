import type {
  PlaybackDirection,
  PlaybackPosition,
  PlaybackRepeat,
  Playlist,
  Artist,
  Album,
  Track,
  PlaylistDetails,
  ArtistDetails,
  TrackDetails,
  FeedType,
} from "@amadeus-music/protocol";
import type { IsNever } from "libfun/utils/types";
import type { async } from "libfun";

type Database = DeepPartial<{
  playlists: {
    create(playlist: Partial<Playlist> & { title: string }): Promise<void>;
    edit(id: number, playlist: Partial<Playlist>): Promise<void>;
    rearrange(id: number, after?: number): Promise<void>;
    get(id: number): Promise<PlaylistDetails>;
    delete(id: number): Promise<void>;
  };
  feed: {
    push(tracks: TrackDetails[], type: FeedType): Promise<void>;
    clear(type: FeedType): Promise<void>;
  };
  library: {
    push(tracks: TrackDetails[], playlist?: number): Promise<void>;
    rearrange(entry: number, after?: number): Promise<void>;
    purge(entries: number[]): Promise<void>;
  };
  settings: {
    store(key: string, value: unknown, collection?: string): Promise<void>;
    lookup(value: unknown, collection?: string): Promise<string>;
    extract(key: string, collection?: string): Promise<any>;
  };
  history: {
    get(): Promise<{ query: string; date: number }[]>;
    log(query: string): Promise<void>;
    clear(): Promise<void>;
  };
  tracks: {
    edit(id: number, track: Partial<Track & { album: Album }>): Promise<void>;
    get(id: number): Promise<TrackDetails>;
  };
  artists: {
    edit(id: number, artist: Partial<Artist>): Promise<void>;
    get(id: number): Promise<ArtistDetails>;
    unfollow(id: number): Promise<void>;
    follow(id: number): Promise<void>;
  };
  playback: {
    push(tracks: TrackDetails[], position?: PlaybackPosition): Promise<void>;
    purge(entries: number[]): Promise<void>;
    clear(onlyHistory?: boolean): Promise<void>;

    synchronize(progress: number): Promise<void>;
    play(track: TrackDetails): Promise<void>;
    previous(): Promise<void>;
    next(): Promise<void>;

    rearrange(track: number, after?: number): Promise<void>;
    redirect(direction: PlaybackDirection): Promise<void>;
    repeat(type: PlaybackRepeat): Promise<void>;
  };
  merge(changes: any[]): Promise<void>;
  subscribe(
    tables: string[],
    callback: (changes: any[], sender?: string) => any,
    options?: { client: string; version: number }
  ): () => void;
}>;

type User = {
  name: string;
  [key: string]: any;
};

type Strategy = (promises: Promise<any>[]) => Promise<any>;

type Persistence<T = Database> = Required<{
  [K in keyof T]: T[K] extends ((...args: infer A) => infer R) | undefined
    ? (
        ...args: A
      ) => ReturnType<typeof async<Awaited<R>>> & PromiseLike<Awaited<R>>
    : Persistence<T[K]>;
}>;

type Method = {
  [K in keyof Database]-?: IsNever<
    SubKeys<Database[K]>,
    K,
    `${K}.${SubKeys<Database[K]>}`
  >;
}[keyof Database];

type SubKeys<T> = Exclude<keyof NonNullable<T>, symbol>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

export type { Strategy, Database, Persistence, User, Method };
