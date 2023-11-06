import {
  type Struct,
  type Infer,
  optional,
  literal,
  number,
  string,
  object,
  array,
  type,
} from "@amadeus-music/core";

function toAssets(art?: string, thumbnail?: string) {
  if (!art) return { thumbnails: [], arts: [] };
  return { thumbnails: [thumbnail || null], arts: [art] };
}

function toArtist(data: Infer<typeof artist> | string) {
  if (typeof data === "string") return { title: data, sources: [] };

  const art = data.photo?.length
    ? data.photo?.reduce((a, b) =>
        a.width * a.height > b.width * b.height ? a : b,
      ).url
    : undefined;
  const thumbnail = data.photo?.length
    ? data.photo?.reduce((a, b) =>
        a.width > 100 &&
        a.height > 100 &&
        a.width * a.height < b.width * b.height
          ? a
          : b,
      ).url
    : undefined;

  return {
    sources: data.id ? [`vk/${data.id}`] : [],
    title: data.name,
    ...toAssets(art, thumbnail),
  };
}

function toAlbum(data: Infer<typeof album> | string, artistless = false) {
  const meta = typeof data !== "string";
  const assets = meta ? data.photo || data.thumb : undefined;
  const artists = meta
    ? (data.main_artists?.map(toArtist) || []).concat(
        data.featured_artists?.map(toArtist) || [],
      )
    : [];

  return {
    sources: meta ? [`vk/${data.owner_id}/${data.id}/${data.access_key}`] : [],
    title: meta ? data.title : data,
    year: meta ? data.year || 0 : 0,
    ...toAssets(assets?.photo_1200, assets?.photo_135),
    ...(artists && !artistless ? { artists } : {}),
  };
}

function toTrack(data: Infer<typeof track>) {
  if (!data.main_artists && !data.featured_artists) return;
  if (!data.url) return;
  return {
    artists: (data.main_artists?.map(toArtist) || []).concat(
      data.featured_artists?.map(toArtist) || [],
    ),
    title: data.title + (data.subtitle ? ` (${data.subtitle})` : ""),
    album: toAlbum(data.album || data.title, true),
    sources: [`vk/${data.owner_id}_${data.id}`],
    duration: data.duration,
  };
}

function convert<T extends "artist" | "track" | "album">(
  data: Infer<typeof artist | typeof track | typeof album>[],
  type: T,
) {
  const map = { artist: toArtist, track: toTrack, album: toAlbum }[type];
  const truthy = <T>(x: T): x is NonNullable<T> => !!x;
  const convert = map as (
    x: Parameters<typeof map>[0],
  ) => ReturnType<typeof map>;
  return data.map((x) => convert(x)).filter(truthy);
}

const artist = type({
  photo: optional(
    array(
      type({
        height: number(),
        width: number(),
        url: string(),
      }),
    ),
  ),
  id: optional(string()),
  name: string(),
});

const album = type({
  photo: optional(
    type({
      photo_1200: string(),
      photo_135: string(),
    }),
  ),
  thumb: optional(
    type({
      photo_1200: string(),
      photo_135: string(),
    }),
  ),
  featured_artists: optional(array(artist)),
  main_artists: optional(array(artist)),
  year: optional(number()),
  access_key: string(),
  owner_id: number(),
  title: string(),
  id: number(),
});

const track = type({
  featured_artists: optional(array(artist)),
  main_artists: optional(array(artist)),
  subtitle: optional(string()),
  album: optional(album),
  duration: number(),
  owner_id: number(),
  artist: string(),
  title: string(),
  date: number(),
  url: string(),
  id: number(),
});

const lyrics = type({
  lyrics: type({
    timestamps: optional(
      array(
        type({
          line: optional(string()),
          begin: number(),
          end: number(),
        }),
      ),
    ),
    text: optional(array(string())),
  }),
});

const captcha = type({
  error: type({
    error_code: literal(14),
    captcha_sid: string(),
    captcha_img: string(),
  }),
});

const responseOf = <T extends Struct<any, any>>(response: T) =>
  type({ response });
const items = <T extends Struct<any, any>>(items: T) =>
  object({ items: array(items), count: number() });

export { responseOf, captcha, convert, artist, lyrics, items, track, album };
