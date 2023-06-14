import {
  transcribe,
  desource,
  search,
  expand,
  relate,
  fetch,
  init,
  lookup,
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
import { array, optional } from "@amadeus-music/core";
import { safeFetch } from "./captcha";

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
    const { response } = yield* safeFetch(
      `audio.search${method}`,
      { params: { q: query, count: page, offset: i } },
      responseOf(items(struct))
    );
    if (!response.items.length) break;
    yield* convert(response.items, type);
  }
});

desource(function* (target) {
  const id = yield* identify(target, "track");
  if (!id) return;

  const { response } = yield* fetch("audio.getById", {
    params: { audios: id },
  }).as(responseOf(array(track)));
  yield* response.map((x) => x.url);
});

expand(function* (type, what, page) {
  const method = { artist: "getAudiosByArtist", album: "get" }[type];
  const args = {
    artist: (src: string) => ({ artist_id: src }),
    album: (src: string) => {
      const [owner_id, album_id, access_key] = src.split("/");
      return { owner_id, album_id, access_key };
    },
  }[type];
  const id = yield* identify(what, type);
  if (!id) return;

  for (let i = 0, count = 1; i < count; i += +page) {
    const { response } = yield* fetch(`audio.${method}`, {
      params: { ...args(id), count: page, offset: i },
    }).as(responseOf(items(track)));

    yield* convert(response.items, "track");
    count = response.count;
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

function* identify(
  data: { sources?: string[]; title?: string },
  type: "track" | "artist" | "album"
) {
  return (
    data.sources?.find((x) => x.startsWith("vk/"))?.slice(3) ||
    (yield* lookup(type, data, "vk"))?.sources
      .find((x) => x.startsWith("vk/"))
      ?.slice(3)
  );
}
