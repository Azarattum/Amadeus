import type { TrackInfo } from "@amadeus-music/protocol";
import { err } from "../status/log";
import ffmpeg from "fluent-ffmpeg";

function reencode(
  url: string,
  metadata: TrackInfo,
  format: "opus" | "ogg" | "caf" = "opus"
) {
  const artists = metadata.artists.map((x) => x.title).join(", ");
  return ffmpeg(url)
    .on("error", err.bind({ group: "ffmpeg" }))
    .outputOptions("-metadata", `Album=${metadata.album.title}`)
    .outputOptions("-metadata", `Title=${metadata.title}`)
    .outputOptions("-metadata", `Artist=${artists}`)
    .audioCodec("libopus")
    .toFormat(format)
    .pipe();
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
