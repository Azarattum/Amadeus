import {
  array,
  Infer,
  number,
  type,
  optional,
  string,
  object,
  Struct,
  literal,
} from "@amadeus-music/core";

function toAssets(art?: string, thumbnail?: string) {
  if (!art) return { arts: [], thumbnails: [] };
  return { arts: [art], thumbnails: [thumbnail || null] };
}

function toArtist(data: Infer<typeof artist> | string) {
  if (typeof data === "string") return { title: data, sources: [] };

  const art = data.photo?.length
    ? data.photo?.reduce((a, b) =>
        a.width * a.height > b.width * b.height ? a : b
      ).url
    : undefined;
  const thumbnail = data.photo?.length
    ? data.photo?.reduce((a, b) =>
        a.width > 100 &&
        a.height > 100 &&
        a.width * a.height < b.width * b.height
          ? a
          : b
      ).url
    : undefined;

  return {
    title: data.name,
    sources: data.id ? [`vk/${data.id}`] : [],
    ...toAssets(art, thumbnail),
  };
}

function toAlbum(data: Infer<typeof album> | string, artistless = false) {
  const meta = typeof data !== "string";
  const assets = meta ? data.photo || data.thumb : undefined;
  const artists = meta
    ? (data.main_artists?.map(toArtist) || []).concat(
        data.featured_artists?.map(toArtist) || []
      )
    : [];

  return {
    title: meta ? data.title : data,
    year: meta ? data.year || 0 : 0,
    sources: meta ? [`vk/${data.owner_id}/${data.id}/${data.access_key}`] : [],
    ...toAssets(assets?.photo_1200, assets?.photo_135),
    ...(artists && !artistless ? { artists } : {}),
  };
}

function toTrack(data: Infer<typeof track>) {
  if (!data.main_artists && !data.featured_artists) return;
  if (!data.url) return;
  return {
    duration: data.duration,
    album: toAlbum(data.album || data.title, true),
    sources: [`vk/${data.owner_id}_${data.id}`],
    title: data.title + (data.subtitle ? ` (${data.subtitle})` : ""),
    artists: (data.main_artists?.map(toArtist) || []).concat(
      data.featured_artists?.map(toArtist) || []
    ),
  };
}

function convert<T extends "track" | "artist" | "album">(
  data: Infer<typeof track | typeof album | typeof artist>[],
  type: T
) {
  const map = { track: toTrack, artist: toArtist, album: toAlbum }[type];
  const truthy = <T>(x: T): x is NonNullable<T> => !!x;
  const convert = map as (
    x: Parameters<typeof map>[0]
  ) => ReturnType<typeof map>;
  return data.map((x) => convert(x)).filter(truthy);
}

const artist = type({
  id: optional(string()),
  name: string(),
  photo: optional(
    array(
      type({
        url: string(),
        width: number(),
        height: number(),
      })
    )
  ),
});

const album = type({
  id: number(),
  title: string(),
  owner_id: number(),
  access_key: string(),
  year: optional(number()),
  main_artists: optional(array(artist)),
  featured_artists: optional(array(artist)),
  photo: optional(
    type({
      photo_135: string(),
      photo_1200: string(),
    })
  ),
  thumb: optional(
    type({
      photo_135: string(),
      photo_1200: string(),
    })
  ),
});

const track = type({
  id: number(),
  url: string(),
  date: number(),
  title: string(),
  artist: string(),
  duration: number(),
  owner_id: number(),
  album: optional(album),
  subtitle: optional(string()),
  main_artists: optional(array(artist)),
  featured_artists: optional(array(artist)),
});

const lyrics = type({
  lyrics: type({
    timestamps: array(
      type({
        begin: number(),
        end: number(),
        line: optional(string()),
      })
    ),
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
  object({ count: number(), items: array(items) });

export { responseOf, items, track, artist, album, lyrics, captcha, convert };
