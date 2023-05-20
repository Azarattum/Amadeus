import type {
  PlaybackDirection,
  PlaybackRepeat,
  PlaybackPush,
  PlaylistBase,
  ArtistBase,
  TrackBase,
  AlbumBase,
  MediaBase,
  FeedType,
  Playlist,
  Artist,
  Track,
  Album,
} from "@amadeus-music/protocol";
import type { IsNever } from "libfun/utils/types";
import type { async } from "libfun";

type Database = DeepPartial<{
  playlists: {
    create(playlist: Partial<PlaylistBase> & { title: string }): Promise<void>;
    edit(id: number, playlist: Partial<PlaylistBase>): Promise<void>;
    rearrange(id: number, after?: number): Promise<void>;
    get(id: number): Promise<Playlist>;
    delete(id: number): Promise<void>;
  };
  feed: {
    push(tracks: Track[], type: FeedType): Promise<void>;
    get(entries: number[]): Promise<Track[]>;
    clear(type: FeedType): Promise<void>;
  };
  library: {
    push(tracks: Track[], playlist?: number): Promise<void>;
    rearrange(entry: number, after?: number): Promise<void>;
    get(entries: number[]): Promise<Track[]>;
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
    edit(
      id: number,
      track: Partial<TrackBase & { album: AlbumBase }>
    ): Promise<void>;
    search(query: string): Promise<Track[]>;
    get(id: number): Promise<Track>;
  };
  artists: {
    edit(id: number, artist: Partial<ArtistBase>): Promise<void>;
    search(query: string): Promise<Artist[]>;
    push(artists: Artist[]): Promise<void>;
    get(id: number): Promise<Artist>;
    unfollow(id: number): Promise<void>;
    follow(id: number): Promise<void>;
  };
  albums: {
    search(query: string): Promise<Album[]>;
    push(albums: Album[]): Promise<void>;
    get(id: number): Promise<Album>;
  };
  playback: {
    push(tracks: Track[], at?: PlaybackPush): Promise<void>;
    purge(entries: number[]): Promise<void>;
    clear(device?: Uint8Array): Promise<void>;
    sync(progress: number): Promise<void>;
    rearrange(track: number, after?: number): Promise<void>;
    redirect(direction: PlaybackDirection): Promise<void>;
    repeat(type: PlaybackRepeat): Promise<void>;
    infinite(toggle?: boolean): Promise<void>;
    replicate(device: Uint8Array): Promise<void>;
  };
  resources: {
    prioritize(type: "art" | "source", resource: string): Promise<void>;
    get(owner: number): Promise<MediaBase>;
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
