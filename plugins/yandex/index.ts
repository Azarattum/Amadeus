import { init, wrn, search } from "./plugin";
import { fetch } from "@amadeus-music/core";
import { convert, Tracks } from "./types";

init(function* (config) {
  const { token } = config.yandex;
  if (!token) return wrn("Plugin disabled! No token found!");
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
      "page-size": "20",
      page: (page++).toString(),
    };

    const { result } = yield* fetch("search", { params }).as(Tracks);
    if (!result.tracks) break;
    yield* result.tracks.results.map(convert);
  }
});
