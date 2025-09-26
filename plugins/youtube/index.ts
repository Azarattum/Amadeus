import {
  desource,
  expand,
  info,
  init,
  lookup,
  relate,
  scrape,
  search,
  transcribe,
} from "./plugin";
import { ClientType, Innertube, YTNodes } from "youtubei.js";
import { async } from "@amadeus-music/core";
import { convert } from "./types";

init(function* () {
  const loadMessage = setTimeout(
    () => info("Retrieving player script..."),
    1000,
  );

  this.youtube = yield* async(
    Innertube.create({
      client_type: ClientType.ANDROID,
      player_id: "0004de42",
    }),
  );

  info("Player initialized successfully.");
  clearTimeout(loadMessage);
});

search(function* (type, query, _) {
  const filter = type === "track" ? { type: "song" as const } : { type };
  const media = `${filter.type}s` as const;

  let result = yield* async(this.youtube.music.search(query, filter));
  yield* convert(result[media]?.contents, type);

  while (result.has_continuation) {
    result = yield* async(result.getContinuation()) as any;
    yield* convert((result.contents as any)?.contents, type);
  }
});

desource(function* (track) {
  const id = yield* identify(track, "track");
  if (!id) return;

  yield yield* async<string>(
    this.youtube
      .getBasicInfo(id)
      .then((x) => x.chooseFormat({ type: "audio", quality: "best" }))
      .then((x) => x.decipher()),
  );
});

expand(function* (type, what, _) {
  const id = yield* identify(what, type);
  if (!id) return;

  const playlist = yield* async(
    type === "artist"
      ? this.youtube.music
          .getArtist(id)
          .then((x) => x.sections?.filter((x) => x.is(YTNodes.MusicShelf)))
          .then((x) => x.find((x) => x.title.toString() === "Songs"))
          .then<string | undefined>((x) => x?.endpoint?.payload?.browseId)
          .catch(() => undefined)
      : this.youtube.music
          .getAlbum(id)
          .then((x) => x.url?.match(/list=([^&]+)/)?.[1])
          .catch(() => undefined),
  );
  if (!playlist) return;

  let result = yield* async(
    this.youtube.music.getPlaylist(playlist).catch(() => undefined),
  );
  while (result) {
    yield* convert(result.items as any, "track");
    result = yield* async(result.getContinuation().catch(() => undefined));
  }
});

relate(function* (type, to, _) {
  if (type === "album") return;
  const id = typeof to === "string" ? to : yield* identify(to, type);
  if (!id) return;

  if (type === "artist") {
    const artists = yield* async(
      this.youtube.music.getArtist(id).then(
        (x) =>
          x.sections
            .find((x: any) => x.header?.title?.text === "Fans might also like")
            ?.contents.filter((x) => x.type === "MusicTwoRowItem"),
        () => undefined,
      ),
    );
    return yield* convert(artists as any, "artist");
  }

  const items = yield* async(
    this.youtube.music
      .getRelated(id)
      .then(
        (x) =>
          "contents" in x &&
          x.contents.find((x) => x.is(YTNodes.MusicCarouselShelf)),
      )
      .then((x) =>
        x
          ? x.contents.filter((x) => x.is(YTNodes.MusicResponsiveListItem))
          : undefined,
      )
      .catch(() => undefined),
  );
  yield* convert(items, type);
});

scrape(function* (url) {
  const id = url.match(/youtu(be.com|.be)\/(watch\?v=)?([a-zA-Z0-9_-]+)/)?.[3];
  if (!id) return;

  const info = yield* async(this.youtube.getBasicInfo(id));
  yield* convert([info["basic_info"]], "track");
});

transcribe(function* (track) {
  const id = yield* identify(track, "track");
  if (!id) return;

  const lyrics = yield* async(
    this.youtube.music
      .getLyrics(id)
      .then((x) => x?.description.toString())
      .catch(() => undefined),
  );
  if (lyrics) yield lyrics;
});

function* identify(
  data: { sources?: string[]; title?: string },
  type: "track" | "artist" | "album",
) {
  return (
    data.sources?.find((x) => x.startsWith("youtube/"))?.slice(8) ||
    (yield* lookup(type, data, "youtube"))?.sources
      .find((x) => x.startsWith("youtube/"))
      ?.slice(8)
  );
}
