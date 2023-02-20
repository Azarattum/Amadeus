import {
  Volumes,
  convert,
  Download,
  Source,
  Search,
  Tracks,
  Similar,
} from "./types";
import { init, search, desource, fetch, relate } from "./plugin";
import { createHash } from "node:crypto";

init(function* ({ yandex: { token, page } }) {
  if (!token) throw "Plugin disabled! No token found!";
  this.fetch.baseURL = "https://api.music.yandex.net/";
  this.fetch.params = { "page-size": page.toString() };
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

    const { result } = yield* fetch("search", { params }).as(Search);
    if (!result.tracks) break;
    /// Properly support other `type`s!
    yield* result.tracks.results.map(convert);
  }
});

desource(function* (type, source) {
  const id = source?.match(/yandex\/([0-9]+)/)?.[1];
  if (!id) return;
  if (type === "track") {
    const { result } = yield* fetch(`tracks/${id}/download-info`).as(Source);
    const url = result[0].downloadInfoUrl + "&format=json";
    const info = yield* fetch(url).as(Download);
    const trackUrl = `XGRlBW9FXlekgbPrRHuSiA${info.path.slice(1)}${info.s}`;
    const sign = createHash("md5").update(trackUrl).digest("hex");
    yield `https://${info.host}/get-mp3/${sign}/${info.ts}${info.path}`;
  } else if (type === "album") {
    const { result } = yield* fetch(`albums/${id}/with-tracks`).as(Volumes);
    yield* result.volumes.flat().map(convert);
  } else if (type === "artist") {
    let page = 0;
    for (;;) {
      const url = `artists/${id}/tracks`;
      const params = { page: (page++).toString() };
      const { result } = yield* fetch(url, { params }).as(Tracks);
      if (!result.tracks) break;
      yield* result.tracks.map(convert);
    }
  }
});

relate(function* (type, to) {
  let id = to.source.match(/yandex\/([0-9]+)/)?.[1];
  if (type === "track") {
    if (!id) {
      const text = `${to.artists.map((x) => x.title)} - ${to.title}`;
      const params = { text, type, "page-size": "1", page: "0" };
      const { result } = yield* fetch("search", { params }).as(Search);
      id = result.tracks?.results[0]?.id.toString();
      if (!id) return;
    }
    const { result } = yield* fetch(`tracks/${id}/similar`).as(Similar);
    yield* result.similarTracks.map(convert);
  }
  /// Properly support other `type`s!
});
