import type { TrackMeta } from "@amadeus-music/protocol";
import { err } from "../status/log";
import ffmpeg from "fluent-ffmpeg";

function reencode(
  url: string,
  metadata: TrackMeta,
  format: "opus" | "ogg" | "caf" = "opus"
) {
  const artists = metadata.artists?.map((x) => x.title).join(", ");
  let stream = ffmpeg(url).on("error", err.bind({ group: "ffmpeg" }));
  if (metadata.album?.title) {
    stream = stream.outputOptions("-metadata", `Album=${metadata.album.title}`);
  }
  if (metadata.title) {
    stream = stream.outputOptions("-metadata", `Title=${metadata.title}`);
  }
  if (artists?.length) {
    stream = stream.outputOptions("-metadata", `Artist=${artists}`);
  }
  return stream.audioCodec("libopus").toFormat(format).pipe();
}

function resize(url: string, size: number) {
  return ffmpeg(url)
    .on("error", err.bind({ group: "ffmpeg" }))
    .addOptions("-vf", "crop=ih:ih")
    .size(`${size}x${size}`)
    .toFormat("mjpeg")
    .pipe();
}

export { reencode, resize };
