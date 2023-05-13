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
} from "./plugin";
import {
  volumes,
  toTrack,
  download,
  link,
  results,
  tracks,
  similar,
  lyrics,
  match,
} from "./types";
import { format, map } from "@amadeus-music/core";
import { auth, header, transform } from "./meta";
import { createHash } from "node:crypto";

init(function* ({ yandex: { token } }) {
  if (!token) throw "Plugin disabled! No token found!";
  this.connect.baseURL = "wss://uniproxy.alice.yandex.net/uni.ws";
  this.fetch.baseURL = "https://api.music.yandex.net/";
  this.fetch.params = { page: "0" };
  this.fetch.headers = {
    "User-Agent": "Yandex-Music-API",
    Authorization: `OAuth ${token}`,
  };
});

search(function* (type, query, page) {
  /// Properly support other `type`s!
  if (type !== "track") return;

  for (let i = 0; ; i++) {
    const params = {
      type,
      text: query,
      nococrrect: "false",
      page: i,
      "page-size": page,
    };

    const { result } = yield* fetch("search", { params }).as(results);
    if (!result.tracks || result.tracks.results.length < page) break;
    yield* result.tracks.results.map(toTrack);
  }
});

desource(function* (source) {
  const id = source?.match(/yandex\/([0-9]+)/)?.[1];
  if (!id) return;
  const { result } = yield* fetch(`tracks/${id}/download-info`).as(link);
  const url = result[0].downloadInfoUrl + "&format=json";
  const info = yield* fetch(url).as(download);
  const trackUrl = `XGRlBW9FXlekgbPrRHuSiA${info.path.slice(1)}${info.s}`;
  const sign = createHash("md5").update(trackUrl).digest("hex");
  yield `https://${info.host}/get-mp3/${sign}/${info.ts}${info.path}`;
});

expand(function* (type, source, page) {
  const id = source?.match(/yandex\/([0-9]+)/)?.[1];
  if (!id) return;
  if (type === "album") {
    const { result } = yield* fetch(`albums/${id}/with-tracks`).as(volumes);
    yield* result.volumes.flat().map(toTrack);
  } else if (type === "artist") {
    for (let i = 0; ; i++) {
      const url = `artists/${id}/tracks`;
      const params = { page: i++, "page-size": page };
      const { result } = yield* fetch(url, { params }).as(tracks);
      if (!result.tracks || result.tracks.length < page) break;
      yield* result.tracks.map(toTrack);
    }
  }
});

relate(function* (type, to, _) {
  /// Properly support other `type`s!
  if (type !== "track") return;
  const id = yield* identify(to, type);
  if (!id) return;

  const { result } = yield* fetch(`tracks/${id}/similar`).as(similar);
  yield* result.similarTracks.map(toTrack);
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
  if ("data" in directive.payload) yield toTrack(directive.payload.data.match);
  yield* connection.close();
});

function* identify(to: { source: string }, type: "track" | "artist" | "album") {
  const regex = /yandex\/([0-9]+)/;
  return (
    to.source.match(regex)?.[1] ||
    (yield* map(
      search.where("yandex")(type as any, format(to), 1),
      function* (x) {
        if (x.progress >= 1) x.close();
        return x.items[0]?.source.match(regex)?.[1];
      }
    )).find((x) => x)
  );
}
