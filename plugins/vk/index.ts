import {
  transcribe,
  desource,
  search,
  expand,
  relate,
  lookup,
  fetch,
  init,
} from "./plugin";
import {
  responseOf,
  convert,
  artist,
  lyrics,
  items,
  track,
  album,
} from "./types";
import { optional, array } from "@amadeus-music/core";
import { safeFetch } from "./captcha";

init(function* ({ vk: { tokens } }) {
  if (!tokens.length) throw "No token found!";
  this.fetch.baseURL = "https://api.vk.me/method/";
  this.fetch.params = { access_token: tokens, v: "5.190" };
  this.fetch.headers = {
    "User-Agent": "Mrs.ia/1520 CFNetwork/1331.0.7 Darwin/21.4.0",
  };
});

search(function* (type, query, page) {
  const method = { artist: "Artists", album: "Albums", track: "" }[type];
  const struct = { artist, track, album }[type];
  let empty = 0;

  for (let i = 0; ; i += +page) {
    const { response } = yield* safeFetch(
      `audio.search${method}`,
      { params: { count: page, offset: i, q: query } },
      responseOf(items(struct)),
    );
    if (!response.items.length) break;
    const results = convert(response.items, type);
    // Don't search through empty pages
    if (!results.length) empty += 1;
    else (empty = 0), yield* results;
    if (empty > 2) break;
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
    album: (src: string) => {
      const [owner_id, album_id, access_key] = src.split("/");
      return { access_key, owner_id, album_id };
    },
    artist: (src: string) => ({ artist_id: src }),
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

  const lines =
    response?.lyrics.timestamps?.map((x) => x.line || "") ||
    response?.lyrics.text;

  if (lines?.length) yield lines.join("\n");
});

function* identify(
  data: { sources?: string[]; title?: string },
  type: "artist" | "track" | "album",
) {
  return (
    data.sources?.find((x) => x.startsWith("vk/"))?.slice(3) ||
    (yield* lookup(type, data, "vk"))?.sources
      .find((x) => x.startsWith("vk/"))
      ?.slice(3)
  );
}
