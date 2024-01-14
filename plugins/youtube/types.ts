import type { YTMusic } from "youtubei.js";

function toAssets(url?: string, secondary = url) {
  if (!url) return { arts: [], thumbnails: [] };
  return {
    arts: [url.replace(/w[0-9]+-h[0-9]+/, "w800-h800")],
    thumbnails: [secondary!.replace(/w[0-9]+-h[0-9]+/, "w120-h120")],
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
    title: data.title || "Unknown",
    year: +(data.year || 0) || 0,
    sources: [`youtube/${data.id}`],
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
        title: x.text as string,
        sources: [`youtube/${x.endpoint.payload.browseId}`],
      })),
  };
}

function toTrack(data: MusicResponsiveListItem & TrackInfo) {
  if (!data.artists?.length && !data.view_count) return;

  return {
    title: data.title + (data.subtitle ? ` (${data.subtitle})` : ""),
    duration: data.duration?.seconds || +data.duration! || 0,
    sources: [`youtube/${data.id}`],
    album: {
      title: data.album?.name || data.title || "Unknown",
      sources: data.album?.id ? [`youtube/${data.album?.id}`] : [],
      year: 0,
      ...toAssets(
        data.thumbnail?.contents?.[0].url || data.thumbnail?.[0].url,
        data.thumbnail?.[data.thumbnail.length - 1]?.url,
      ),
    },
    artists:
      data.artists?.map((x) => ({
        title: x.name,
        sources: x.channel_id ? [`youtube/${x.channel_id}`] : [],
      })) ||
      (typeof data.author === "string"
        ? [
            {
              title: data.author.toString(),
              sources: data.channel_id ? [`youtube/${data.channel_id}`] : [],
            },
          ]
        : []),
  };
}

function convert<T extends "track" | "artist" | "album">(
  data: (MusicResponsiveListItem | TrackInfo)[] | undefined,
  type: T,
) {
  const map = { track: toTrack, artist: toArtist, album: toAlbum }[type];
  const truthy = <T>(x: T): x is NonNullable<T> => !!x;
  const convert = map as (
    x: Parameters<typeof map>[0],
  ) => ReturnType<typeof map>;
  return data?.map((x: any) => convert(x)).filter(truthy) || [];
}

type TrackInfo = YTMusic.TrackInfo["basic_info"];
type MusicResponsiveListItem = YTMusic.Album["contents"][number];
type MusicTwoRowItem = Extract<
  YTMusic.Album["sections"][number]["contents"][number],
  { id: string | undefined }
>;

export { convert };
