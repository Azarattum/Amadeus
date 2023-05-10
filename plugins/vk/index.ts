import {
  toTrack,
  toAlbum,
  toArtist,
  responseBlock,
  responseCatalog,
} from "./types";
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
  const { name, map, next } = {
    track: { name: "audios", map: toTrack, next: "All music" } as const,
    artist: { name: "links", map: toArtist, next: "Artists" } as const,
    album: { name: "playlists", map: toAlbum, next: "Albums" } as const,
  }[type];
  const covert = map as (
    x: Parameters<typeof map>[0]
  ) => ReturnType<typeof map>;
  const truthy = <T>(x: T): x is NonNullable<T> => !!x;

  // Perform search
  const { response } = yield* fetch("catalog.getAudioSearch", {
    params: { query, need_blocks: "1" },
  }).as(responseCatalog);

  yield* response[name]?.map(covert).filter(truthy) || [];

  // Continue pagination
  const blocks = response.catalog.sections.flatMap((x) => x.blocks);
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
    yield* response[name]?.map(covert).filter(truthy) || [];
    block = response.block;
  }
});

desource(function* (source) {
  source = JSON.parse(source).find((x: string) => x.startsWith("vk/"));
  if (source) yield source.replace(/^vk\//, "");
});
