import type {
  MusicResponsiveListItem,
  MusicTwoRowItem,
} from "youtubei.js/dist/src/parser/nodes";

function toAssets(url?: string) {
  if (!url) return { arts: [], thumbnails: [] };
  return {
    arts: [url.replace(/w[0-9]+-h[0-9]+/, "w800-h800")],
    thumbnails: [url.replace(/w[0-9]+-h[0-9]+/, "w120-h120")],
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
            "MUSIC_PAGE_TYPE_ARTIST" && x.endpoint?.payload?.browseId
      )
      .map((x: any) => ({
        title: x.text as string,
        sources: [`youtube/${x.endpoint.payload.browseId}`],
      })),
  };
}

function toTrack(data: MusicResponsiveListItem) {
  if (!data.artists?.length) return;

  return {
    title: data.title + (data.subtitle ? ` (${data.subtitle})` : ""),
    duration: data.duration?.seconds || 0,
    sources: [`youtube/${data.id}`],
    album: {
      title: data.album?.name || data.title || "Unknown",
      sources: data.album?.id ? [`youtube/${data.album?.id}`] : [],
      year: 0,
      ...toAssets(data.thumbnail?.contents[0].url),
    },
    artists:
      data.artists?.map((x) => ({
        title: x.name,
        sources: x.channel_id ? [`youtube/${x.channel_id}`] : [],
      })) || [],
  };
}

function convert<T extends "track" | "artist" | "album">(
  data: MusicResponsiveListItem[] | undefined,
  type: T
) {
  const map = { track: toTrack, artist: toArtist, album: toAlbum }[type];
  const truthy = <T>(x: T): x is NonNullable<T> => !!x;
  const convert = map as (
    x: Parameters<typeof map>[0]
  ) => ReturnType<typeof map>;
  return data?.map((x) => convert(x)).filter(truthy) || [];
}

export { convert };
