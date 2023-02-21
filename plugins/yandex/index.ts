import {
  volumes,
  convert,
  download,
  link,
  results,
  tracks,
  similar,
  lyrics,
} from "./types";
import { init, search, desource, fetch, relate, transcribe } from "./plugin";
import { format } from "@amadeus-music/protocol";
import { createHash } from "node:crypto";

init(function* ({ yandex: { token, page } }) {
  if (!token) throw "Plugin disabled! No token found!";
  this.fetch.baseURL = "https://api.music.yandex.net/";
  this.fetch.params = { "page-size": page.toString(), page: "0" };
  this.fetch.headers = {
    "User-Agent": "Yandex-Music-API",
    Authorization: `OAuth ${token}`,
  };
});

search(function* (type, query) {
  let page = 0;
  for (;;) {
    const params = {
      type,
      text: query,
      nococrrect: "false",
      page: (page++).toString(),
    };

    const { result } = yield* fetch("search", { params }).as(results);
    if (!result.tracks) break;
    /// Properly support other `type`s!
    yield* result.tracks.results.map(convert);
  }
});

desource(function* (type, source) {
  const id = source?.match(/yandex\/([0-9]+)/)?.[1];
  if (!id) return;
  if (type === "track") {
    const { result } = yield* fetch(`tracks/${id}/download-info`).as(link);
    const url = result[0].downloadInfoUrl + "&format=json";
    const info = yield* fetch(url).as(download);
    const trackUrl = `XGRlBW9FXlekgbPrRHuSiA${info.path.slice(1)}${info.s}`;
    const sign = createHash("md5").update(trackUrl).digest("hex");
    yield `https://${info.host}/get-mp3/${sign}/${info.ts}${info.path}`;
  } else if (type === "album") {
    const { result } = yield* fetch(`albums/${id}/with-tracks`).as(volumes);
    yield* result.volumes.flat().map(convert);
  } else if (type === "artist") {
    let page = 0;
    for (;;) {
      const url = `artists/${id}/tracks`;
      const params = { page: (page++).toString() };
      const { result } = yield* fetch(url, { params }).as(tracks);
      if (!result.tracks) break;
      yield* result.tracks.map(convert);
    }
  }
});

relate(function* (type, to) {
  let id = to.source.match(/yandex\/([0-9]+)/)?.[1];
  if (type === "track") {
    if (!id) {
      const params = { text: format(to), type, "page-size": "1" };
      const { result } = yield* fetch("search", { params }).as(results);
      id = result.tracks?.results[0]?.id.toString();
      if (!id) return;
    }
    const { result } = yield* fetch(`tracks/${id}/similar`).as(similar);
    yield* result.similarTracks.map(convert);
  }
  /// Properly support other `type`s!
});

transcribe(function* (track) {
  let id = track.source.match(/yandex\/([0-9]+)/)?.[1];
  if (!id) {
    const params = { text: format(track), type: "track", "page-size": "1" };
    const { result } = yield* fetch("search", { params }).as(results);
    id = result.tracks?.results[0]?.id.toString();
    if (!id) return;
  }
  const { result } = yield* fetch(`tracks/${id}/supplement`).as(lyrics);
  if (result.lyrics) yield result.lyrics.fullLyrics;
});
