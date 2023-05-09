import {
  array,
  Infer,
  number,
  type,
  optional,
  string,
  object,
  boolean,
} from "@amadeus-music/core";

function toTrack(data: Infer<typeof audio>) {
  const toJSON = <T>(x?: T) => JSON.stringify(x ? [x] : []);

  return {
    title: data.title + (data.subtitle ? ` (${data.subtitle})` : ""),
    length: data.duration,
    source: toJSON(`vk/${data.url}`),
    album: {
      title: data.album?.title || data.title,
      year: 0,
      art: toJSON(data.album?.thumb?.photo_1200),
      source: data.album
        ? toJSON(
            `vk/${data.album.owner_id}/${data.album.id}/${data.album.access_key}`
          )
        : "[]",
    },
    artists: data.main_artists?.map((x) => ({
      source: x.id ? toJSON(`vk/${x.id}`) : "[]",
      title: x.name,
      art: "[]",
    })) || [{ title: data.artist, source: "[]", art: "[]" }],
  };
}

function toArtist(data: Infer<typeof link>) {
  if (data.meta.content_type !== "artist") return;
  const toJSON = <T>(x?: T) => JSON.stringify(x ? [x] : []);
  const art = data.image?.reduce((a, b) =>
    a.width * a.height > b.width * b.height ? a : b
  ).url;

  return {
    title: data.title,
    source: toJSON(data.url.split("/").pop()),
    art: toJSON(art),
  };
}

const block = type({
  id: string(),
  next_from: optional(string()),
  audios_ids: optional(array(string())),
  links_ids: optional(array(string())),
});

const catalog = type({
  sections: array(
    type({
      id: string(),
      blocks: array(block),
    })
  ),
});

const album = type({
  id: number(),
  title: string(),
  owner_id: number(),
  access_key: string(),
  thumb: optional(
    type({
      photo_68: string(),
      photo_1200: string(),
    })
  ),
});

const artist = type({
  id: optional(string()),
  name: string(),
});

const audio = type({
  id: number(),
  artist: string(),
  owner_id: number(),
  title: string(),
  subtitle: optional(string()),
  duration: number(),
  url: string(),
  date: number(),
  album: optional(album),
  main_artists: optional(array(artist)),
  has_lyrics: optional(boolean()),
});

const link = type({
  url: string(),
  title: string(),
  meta: type({ content_type: string() }),
  image: optional(
    array(
      type({
        url: string(),
        width: number(),
        height: number(),
      })
    )
  ),
});

const responseCatalog = object({
  response: type({
    catalog,
    audios: optional(array(audio)),
    links: optional(array(link)),
  }),
});

const responseBlock = object({
  response: type({
    block,
    audios: optional(array(audio)),
    links: optional(array(link)),
  }),
});

export { responseCatalog, responseBlock, toTrack, toArtist };
