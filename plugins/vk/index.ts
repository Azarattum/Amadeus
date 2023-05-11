import { Infer, array, create, string } from "@amadeus-music/core";
import { responseBlock, responseCatalog, convert } from "./types";
import { init, search, fetch, desource, expand } from "./plugin";

init(function* ({ vk: { token } }) {
  if (!token) throw "Plugin disabled! No token found!";
  this.fetch.baseURL = "https://api.vk.me/method/";
  this.fetch.params = { v: "5.184", access_token: token };
  this.fetch.headers = {
    "User-Agent":
      "VKAndroidApp/7.26-12338 (Android 11; SDK 30; armeabi-v7a; Android; ru; 2960x1440)",
    "x-vk-android-client": "new",
  };
});

search(function* (type, query, page) {
  const { response } = yield* fetch("catalog.getAudioSearch", {
    params: { query, need_blocks: "1" },
  }).as(responseCatalog);

  yield* convert(response, type);
  const next = { track: "All music", artist: "Artists", album: "Albums" }[type];
  yield* paginate(response, next, page, type);
});

desource(function* (source) {
  source = JSON.parse(source)?.find?.((x: string) => x.startsWith("vk/"));
  if (source) yield source.replace(/^vk\//, "");
});

expand(function* (type, source, page) {
  const ids = create(JSON.parse(source), array(string()))
    .filter((x: string) => x.startsWith("vk/"))
    .map((x) => x.slice(3));
  for (const source of ids) {
    if (type === "artist") {
      const { response } = yield* fetch("catalog.getAudioArtist", {
        params: { artist_id: source, need_blocks: "1" },
      }).as(responseCatalog);
      yield* convert(response, "track");
      yield* paginate(response, "Popular", page, "track");
    } else {
      const [owner_id, id, access_key] = source.split("/");
      const { response } = yield* fetch("execute.getPlaylist", {
        params: { owner_id, id, access_key },
      }).as(responseCatalog);
      yield* convert(response, "track");
    }
  }
});

function* paginate<T extends "track" | "artist" | "album">(
  response: Infer<typeof responseCatalog>["response"],
  next: string,
  page: number,
  type: T
) {
  const blocks = response.catalog?.sections.flatMap((x) => x.blocks) || [];
  const index = blocks.findIndex((x) => x.layout?.title === next);
  let block = ~index ? blocks[index + 1] : undefined;
  while (block?.next_from) {
    const { response } = yield* fetch("catalog.getBlockItems", {
      params: {
        block_id: block.id,
        count: page.toString(),
        start_from: block.next_from,
      },
    }).as(responseBlock);

    yield* convert(response, type);
    block = response.block;
  }
}
