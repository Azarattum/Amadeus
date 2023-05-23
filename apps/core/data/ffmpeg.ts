import type { Meta } from "@amadeus-music/protocol";
import { err } from "../status/log";
import ffmpeg from "fluent-ffmpeg";
import { context } from "libfun";

function reencode(
  url: string,
  metadata: Meta,
  format: "opus" | "ogg" | "caf" = "opus"
) {
  const artists = metadata.artists?.map((x) => x.title).join(", ");
  let stream = ffmpeg(url).on("error", error);
  if (metadata.album?.title) {
    stream = stream.outputOptions("-metadata", `Album=${metadata.album.title}`);
  }
  if (metadata.title) {
    stream = stream.outputOptions("-metadata", `Title=${metadata.title}`);
  }
  if (artists?.length) {
    stream = stream.outputOptions("-metadata", `Artist=${artists}`);
  }

  context?.signal?.addEventListener("abort", () => stream.kill("SIGINT"), {
    once: true,
  });
  return stream.audioCodec("libopus").toFormat(format).pipe();
}

function resize(url: string, size: number) {
  const stream = ffmpeg(url)
    .on("error", error)
    .addOptions("-vf", "crop=ih:ih")
    .size(`${size}x${size}`)
    .toFormat("mjpeg");

  context?.signal?.addEventListener("abort", () => stream.kill("SIGINT"), {
    once: true,
  });
  return stream.pipe();
}

function error(reason: unknown) {
  if (String(reason).includes("received signal 2")) return;
  err.bind({ group: "ffmpeg" })(reason);
}

export { reencode, resize };
