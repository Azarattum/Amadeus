import type { Track } from "@amadeus-music/protocol";
import { pipeline } from "libfun";

/// NOT USED! (yet)
const uuid = pipeline(
  (x: Track) => `${x.artists.sort().join(",")}-${x.title}-${x.album}`,
  (x) => x.toLowerCase().replace(/\s/g, " "),
  (x) => new TextEncoder().encode(x),
  (x) => crypto.subtle.digest("SHA-1", x),
  (x) => Array.from(new Uint8Array(x)),
  (x) => x.map((b) => b.toString(16).padStart(2, "0")).join("")
);

export { uuid };
