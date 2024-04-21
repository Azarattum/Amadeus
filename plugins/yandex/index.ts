import {
  init,
  search,
  desource,
  fetch,
  relate,
  transcribe,
  expand,
  recognize,
  connect,
  lookup,
} from "./plugin";
import {
  download,
  link,
  lyrics,
  match,
  convert,
  resultsOf,
  track,
  resultOf,
  artist,
  album,
} from "./types";
import { auth, header, transform } from "./meta";
import { array } from "@amadeus-music/core";
import { createHash } from "node:crypto";

init(function* ({ yandex: { tokens } }) {
  if (!tokens.length) throw "No token found!";
  this.connect.baseURL = "wss://uniproxy.alice.yandex.net/uni.ws";
  this.fetch.baseURL = "https://api.music.yandex.net/";
  this.fetch.params = { page: "0" };
  this.fetch.tls = "TLSv1.2";
  this.fetch.headers = {
    "X-Yandex-Music-Client": "YandexMusicAndroid/24023621",
    Authorization: tokens.map((x) => `OAuth ${x}`),
    "User-Agent": "Yandex-Music-API",
  };
});

search(function* (type, query, page) {
  const struct = { track, artist, album }[type];
  const collection = `${type}s` as const;
  for (let i = 0; ; i++) {
    const params = {
      type,
      text: query,
      nococrrect: "false",
      page: i,
      "page-size": page,
    };

    const { result } = yield* fetch("search", { params }).as(
      resultsOf(collection, struct),
    );

    const items = result[collection];
    if (!items?.results || !items.results.length) break;
    yield* convert(items.results, type);
  }
});

desource(function* (target) {
  const id = yield* identify(target, "track");
  if (!id) return;

  const { result } = yield* fetch(`tracks/${id}/download-info`).as(link);
  const url = result[0].downloadInfoUrl + "&format=json";
  const info = yield* fetch(url).as(download);
  const trackUrl = `XGRlBW9FXlekgbPrRHuSiA${info.path.slice(1)}${info.s}`;
  const sign = createHash("md5").update(trackUrl).digest("hex");
  yield `https://${info.host}/get-mp3/${sign}/${info.ts}${info.path}`;
});

expand(function* (type, what, page) {
  const id = yield* identify(what, type);
  if (!id) return;
  if (type === "album") {
    const { result } = yield* fetch(`albums/${id}/with-tracks`).as(
      resultOf("volumes", array(track)),
    );

    yield* convert(result.volumes?.flat(), "track");
  } else if (type === "artist") {
    for (let i = 0; ; i++) {
      const url = `artists/${id}/tracks`;
      const params = { page: i, "page-size": page };
      const { result } = yield* fetch(url, { params }).as(
        resultOf("tracks", track),
      );
      if (!result.tracks) break;
      yield* convert(result.tracks, "track");
      if (result.tracks.length < page) break;
    }
  }
});

relate(function* (type, to, _) {
  if (type === "album") return;
  const id = yield* identify(to, type);
  if (!id) return;
  const collection = `${type}s` as const;
  const struct = { track, artist, album }[type];
  const upper = (x: string) => x[0].toUpperCase() + x.slice(1);

  const { result } = yield* fetch(`${collection}/${id}/similar`).as(
    resultOf(`similar${upper(collection)}`, struct),
  );
  yield* convert(result[`similar${upper(collection)}`], type);
});

transcribe(function* (track) {
  const id = yield* identify(track, "track");
  if (!id) return;

  const { result } = yield* fetch(`tracks/${id}/supplement`).as(lyrics);
  if (result.lyrics) yield result.lyrics.fullLyrics;
});

recognize(function* (stream) {
  const connection = connect();
  const init = header();
  const id = init.event.header.streamId;

  yield* connection.send(auth);
  yield* connection.send(init);
  yield* connection.send(stream().pipeThrough(transform(id)));
  const { directive } = yield* connection.recv(match);
  if ("data" in directive.payload) {
    yield* convert([directive.payload.data.match], "track");
  }
  yield* connection.close();
});

function* identify(
  data: { sources?: string[]; title?: string },
  type: "track" | "artist" | "album",
) {
  return (
    data.sources?.find((x) => x.startsWith("yandex/"))?.slice(7) ||
    (yield* lookup(type, data, "yandex"))?.sources
      .find((x) => x.startsWith("yandex/"))
      ?.slice(7)
  );
}
