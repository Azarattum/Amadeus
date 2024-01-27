import { nully } from "@amadeus-music/util/string";
import type { YTMusic } from "youtubei.js";

function toAssets(url?: string, secondary = url) {
  if (!url) return { thumbnails: [], arts: [] };
  return {
    thumbnails: [secondary!.replace(/w[0-9]+-h[0-9]+/, "w120-h120")],
    arts: [url.replace(/w[0-9]+-h[0-9]+/, "w800-h800")],
  };
}

function toArtist(data: MusicResponsiveListItem | MusicTwoRowItem) {
  const thumbnail = Array.isArray(data.thumbnail)
    ? data.thumbnail[0]
    : data.thumbnail?.contents[0];

  return {
    title: ("name" in data ? data.name : data.title?.toString()) || "Unknown",
    sources: [`youtube/${data.id}`],
    ...toAssets(thumbnail?.url),
  };
}

function toAlbum(data: MusicResponsiveListItem) {
  return {
    sources: [`youtube/${data.id}`],
    title: data.title || "Unknown",
    year: +(data.year || 0) || 0,
    ...toAssets(data.thumbnail?.contents[0].url),
    artists: data.flex_columns
      .flatMap((x) => x.title.runs)
      .filter(
        (x: any) =>
          x.endpoint?.payload?.browseEndpointContextSupportedConfigs
            ?.browseEndpointContextMusicConfig?.pageType ===
            "MUSIC_PAGE_TYPE_ARTIST" && x.endpoint?.payload?.browseId,
      )
      .map((x: any) => ({
        sources: [`youtube/${x.endpoint.payload.browseId}`],
        title: x.text as string,
      })),
  };
}

function toTrack(data: MusicResponsiveListItem & TrackInfo) {
  if (!data.artists?.length && !data.view_count) return;

  return {
    artists:
      data.artists?.map((x) => ({
        sources: x.channel_id ? [`youtube/${x.channel_id}`] : [],
        title: x.name,
      })) ||
      (typeof data.author === "string"
        ? [
            {
              sources: data.channel_id ? [`youtube/${data.channel_id}`] : [],
              title: data.author.toString(),
            },
          ]
        : []),
    album: {
      sources: data.album?.id ? [`youtube/${data.album?.id}`] : [],
      title: data.album?.name || data.title || "Unknown",
      year: 0,
      ...toAssets(
        data.thumbnail?.contents?.[0].url || data.thumbnail?.[0].url,
        data.thumbnail?.[data.thumbnail.length - 1]?.url,
      ),
    },
    duration: data.duration?.seconds || +data.duration! || 0,
    title: data.title + (nully` (${data.subtitle})` || ""),
    sources: [`youtube/${data.id}`],
  };
}

function convert<T extends "artist" | "track" | "album">(
  data: (MusicResponsiveListItem | TrackInfo)[] | undefined,
  type: T,
) {
  const map = { artist: toArtist, track: toTrack, album: toAlbum }[type];
  const truthy = <T>(x: T): x is NonNullable<T> => !!x;
  const convert = map as (
    x: Parameters<typeof map>[0],
  ) => ReturnType<typeof map>;
  return data?.map((x: any) => convert(x)).filter(truthy) || [];
}

type MusicResponsiveListItem = YTMusic.Album["contents"][number];
type TrackInfo = YTMusic.TrackInfo["basic_info"];
type MusicTwoRowItem = Extract<
  YTMusic.Album["sections"][number]["contents"][number],
  { id: string | undefined }
>;

export { convert };
