import { items, convert, responseOf, track, artist, album } from "./types";
import { init, search, fetch, desource, expand } from "./plugin";
import { array, create, string } from "@amadeus-music/core";

init(function* ({ vk: { token } }) {
  if (!token) throw "Plugin disabled! No token found!";
  this.fetch.baseURL = "https://api.vk.me/method/";
  this.fetch.params = { v: "5.190", access_token: token };
  this.fetch.headers = {
    "User-Agent": "Mrs.ia/1520 CFNetwork/1331.0.7 Darwin/21.4.0",
  };
});

search(function* (type, query, page) {
  const method = { track: "", artist: "Artists", album: "Albums" }[type];
  const struct = { track, artist, album }[type];

  for (let i = 0; ; i += page) {
    const { response } = yield* fetch(`audio.search${method}`, {
      params: { q: query, count: page.toString(), offset: i.toString() },
    }).as(responseOf(items(struct)));

    yield* convert(response.items, type);
    if (response.items.length < page) break;
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
    for (let i = 0, count = 1; i < count; i += page) {
      const { response } = yield* fetch(`audio.${method}`, {
        params: { ...args(src), count: page.toString(), offset: i.toString() },
      }).as(responseOf(items(track)));

      yield* convert(response.items, "track");
      count = response.count;
    }
  }
});
