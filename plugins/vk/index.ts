import {
  transcribe,
  desource,
  search,
  expand,
  relate,
  fetch,
  init,
} from "./plugin";
import {
  responseOf,
  convert,
  artist,
  items,
  track,
  album,
  lyrics,
} from "./types";
import {
  array,
  create,
  format,
  map,
  optional,
  string,
} from "@amadeus-music/core";
import { handle } from "./captcha";

init(function* ({ vk: { token } }) {
  if (!token) throw "No token found!";
  this.fetch.baseURL = "https://api.vk.me/method/";
  this.fetch.params = { v: "5.190", access_token: token };
  this.fetch.headers = {
    "User-Agent": "Mrs.ia/1520 CFNetwork/1331.0.7 Darwin/21.4.0",
  };
});

search(function* (type, query, page) {
  const method = { track: "", artist: "Artists", album: "Albums" }[type];
  const struct = { track, artist, album }[type];

  for (let i = 0; ; i += +page) {
    try {
      const { response } = yield* fetch(`audio.search${method}`, {
        params: { q: query, count: page, offset: i },
      }).as(responseOf(items(struct)));
      yield* convert(response.items, type);
      if (response.items.length < page) break;
    } catch (error) {
      yield* handle(error);
      i -= page;
    }
  }
});

desource(function* (source) {
  source = JSON.parse(source)?.find?.((x: string) => x.startsWith("vk/"));
  if (!source) return;

  const { response } = yield* fetch("audio.getById", {
    params: { audios: source.slice(3) },
  }).as(responseOf(array(track)));
  yield* response.map((x) => x.url);
});

expand(function* (type, source, page) {
  const method = { artist: "getAudiosByArtist", album: "get" }[type];
  const args = {
    artist: (src: string) => ({ artist_id: src }),
    album: (src: string) => {
      const [owner_id, album_id, access_key] = src.split("/");
      return { owner_id, album_id, access_key };
    },
  }[type];

  const ids = create(JSON.parse(source), array(string()))
    .filter((x: string) => x.startsWith("vk/"))
    .map((x) => x.slice(3));

  for (const src of ids) {
    for (let i = 0, count = 1; i < count; i += +page) {
      const { response } = yield* fetch(`audio.${method}`, {
        params: { ...args(src), count: page, offset: i },
      }).as(responseOf(items(track)));

      yield* convert(response.items, "track");
      count = response.count;
    }
  }
});

relate(function* (type, to, page) {
  if (type !== "track") return;
  const id = yield* identify(to, type);
  if (!id) return;

  // Pagination or shuffling do not work for `target_audio` recommendations
  const { response } = yield* fetch("audio.getRecommendations", {
    params: { target_audio: id, count: page },
  }).as(responseOf(items(track)));
  yield* convert(response.items, type);
});

transcribe(function* (track) {
  const id = yield* identify(track, "track");
  if (!id) return;

  const { response } = yield* fetch("audio.getLyrics", {
    params: { audio_id: id },
  }).as(responseOf(optional(lyrics)));

  if (!response?.lyrics) return;
  yield response.lyrics.timestamps.map((x) => x.line || "").join("\n");
});

function* identify(to: { source: string }, type: "track" | "artist" | "album") {
  const regex = /vk\/([0-9_-]+)/;
  return (
    to.source?.match(regex)?.[1] ||
    (yield* map(search.where("vk")(type as any, format(to), 1), function* (x) {
      if (x.progress >= 1) x.close();
      return x.items[0]?.source.match(regex)?.[1];
    })).find((x) => x)
  );
}
