import { toTrack, responseBlock, responseCatalog, toArtist } from "./types";
import { init, search, fetch, desource } from "./plugin";

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
  // Setup context
  const { target, convert, next } = {
    track: { target: "audios", convert: toTrack, next: "audios_ids" } as const,
    artist: { target: "links", convert: toArtist, next: "links_ids" } as const,
    album: {} as never, /// TODO: implement album
  }[type];
  const map = convert as (
    x: Parameters<typeof convert>[0]
  ) => ReturnType<typeof convert>;
  const truthy = <T>(x: T): x is NonNullable<T> => !!x;

  // Perform search
  const { response } = yield* fetch("catalog.getAudioSearch", {
    params: { query, need_blocks: "1" },
  }).as(responseCatalog);

  yield* response[target]?.map(map).filter(truthy) || [];

  // Continue pagination
  let block = response.catalog.sections
    .flatMap((x) => x.blocks)
    .find((x) => x[next] && x.next_from);
  while (block?.next_from) {
    const { response } = yield* fetch("catalog.getBlockItems", {
      params: {
        block_id: block.id,
        count: page.toString(),
        start_from: block.next_from,
      },
    }).as(responseBlock);
    yield* response[target]?.map(map).filter(truthy) || [];
    block = response.block;
  }
});

desource(function* (source) {
  source = JSON.parse(source).find((x: string) => x.startsWith("vk/"));
  if (source) yield source.replace(/^vk\//, "");
});
