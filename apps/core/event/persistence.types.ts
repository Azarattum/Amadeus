import type {
  ArtistDetails,
  PlaylistDetails,
  TrackDetails,
} from "@amadeus-music/protocol";
import type { IsNever } from "libfun/utils/types";
import type { async } from "libfun";

type Database = Partial<{
  playlists: Partial<{
    create(name: string): Promise<void>;
    get(title: string): Promise<PlaylistDetails>;

    push(tracks: TrackDetails[], playlist?: number): Promise<void>;
    purge(entries: number[]): Promise<void>;
  }>;
  settings: Partial<{
    store(key: string, value: unknown, collection?: string): Promise<void>;
    lookup(value: unknown, collection?: string): Promise<string>;
    extract(key: string, collection?: string): Promise<any>;
  }>;
  history: Partial<{
    get(): Promise<{ query: string; date: number }[]>;
    log(query: string): Promise<void>;
  }>;
  tracks: Partial<{
    get(id: number): Promise<TrackDetails>;
  }>;
  artists: Partial<{
    get(id: number): Promise<ArtistDetails>;
  }>;
  merge(changes: any[]): Promise<void>;
  subscribe(
    tables: string[],
    callback: (changes: any[], sender?: string) => any,
    options?: { client: string; version: number }
  ): () => void;
}>;

type Strategy = (promises: Promise<any>[]) => Promise<any>;

type Persistence<T = Database> = Required<{
  [K in keyof T]: T[K] extends ((...args: infer A) => infer R) | undefined
    ? (
        ...args: A
      ) => ReturnType<typeof async<Awaited<R>>> & PromiseLike<Awaited<R>>
    : Persistence<T[K]>;
}>;

type SubKeys<T> = Exclude<keyof NonNullable<T>, symbol>;

type Method = {
  [K in keyof Database]-?: IsNever<
    SubKeys<Database[K]>,
    K,
    `${K}.${SubKeys<Database[K]>}`
  >;
}[keyof Database];

type User = {
  name: string;
  [key: string]: any;
};

export type { Strategy, Database, Persistence, User, Method };
