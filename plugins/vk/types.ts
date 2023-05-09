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

function convert(data: Infer<typeof audio>) {
  return {
    title: data.title,
    length: data.duration,
    source: JSON.stringify([`vk/${data.url}`]),
    album: {
      title: data.album?.title || data.title,
      year: 0,
      art: data.album?.thumb
        ? JSON.stringify([data.album.thumb.photo_1200])
        : "[]",
      source: data.album
        ? JSON.stringify([
            `vk/${data.album.owner_id}/${data.album.id}/${data.album.access_key}`,
          ])
        : "[]",
    },
    artists: data.main_artists?.map((x) => ({
      source: x.id ? JSON.stringify([`vk/${x.id}`]) : "[]",
      title: x.name,
      art: "[]",
    })) || [{ title: data.artist, source: "[]", art: "[]" }],
  };
}

const block = type({
  id: string(),
  next_from: optional(string()),
  audios_ids: optional(array(string())),
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
  duration: number(),
  url: string(),
  date: number(),
  album: optional(album),
  main_artists: optional(array(artist)),
  has_lyrics: optional(boolean()),
});

const responseCatalog = object({
  response: type({
    catalog,
    audios: optional(array(audio)),
  }),
});

const responseBlock = object({
  response: type({
    block,
    audios: optional(array(audio)),
  }),
});

export { responseCatalog, responseBlock, convert };
