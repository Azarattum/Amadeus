import { convert, Download, Source, Tracks } from "./types";
import { init, search, desource, fetch } from "./plugin";
import { createHash } from "node:crypto";

init(function* (config) {
  const { token } = config.yandex;
  if (!token) throw "Plugin disabled! No token found!";
  this.fetch.baseURL = "https://api.music.yandex.net/";
  this.fetch.headers = {
    "User-Agent": "Yandex-Music-API",
    Authorization: `OAuth ${token}`,
  };
});

search(function* (type, query) {
  /// Properly support other `type`s!
  let page = 0;
  for (;;) {
    const params = {
      type,
      text: query,
      nococrrect: "false",
      /// Consider page size
      "page-size": "30",
      page: (page++).toString(),
    };

    const { result } = yield* fetch("search", { params }).as(Tracks);
    if (!result.tracks) break;
    yield* result.tracks.results.map(convert);
  }
});

desource(function* (sources: string[]) {
  const schema = "amadeus://yandex/";
  const source = sources.find((x) => x.startsWith(schema));
  if (!source) return;
  const id = source.slice(schema.length);

  const { result } = yield* fetch(`tracks/${id}/download-info`).as(Source);
  const url = result[0].downloadInfoUrl + "&format=json";
  const info = yield* fetch(url).as(Download);

  const trackUrl = `XGRlBW9FXlekgbPrRHuSiA${info.path.slice(1)}${info.s}`;
  const sign = createHash("md5").update(trackUrl).digest("hex");
  yield `https://${info.host}/get-mp3/${sign}/${info.ts}${info.path}`;
});
