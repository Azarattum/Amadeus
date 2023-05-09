import { convert, responseBlock, responseCatalog } from "./types";
import { init, search, fetch } from "./plugin";

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
  if (type !== "track") return;
  const { response } = yield* fetch("catalog.getAudioSearch", {
    params: { query, need_blocks: "1" },
  }).as(responseCatalog);

  yield* response.audios.map(convert);
  let block = response.catalog.sections
    .flatMap((x) => x.blocks)
    .find((x) => x.audios_ids);
  while (block?.next_from) {
    const { response } = yield* fetch("catalog.getBlockItems", {
      params: {
        block_id: block.id,
        count: page.toString(),
        start_from: block.next_from,
      },
    }).as(responseBlock);
    yield* response.audios.map(convert);
    block = response.block;
  }
});
