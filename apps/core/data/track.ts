import { clean } from "@amadeus-music/util/string";
import { createHash } from "node:crypto";
import { pipe } from "libfun";

const sha = createHash("SHA1");

const identify = (track: Info) =>
  track.id ||
  pipe(track)(
    normalize,
    (x) => `${x.artists}-${x.title}-${x.album}`,
    (x) => sha.update(x).copy().digest("hex")
  );

const normalize = (track: Info) => ({
  artists: track.artists.map(clean).sort().join(","),
  album: clean(track.album || track.title),
  title: clean(track.title),
});

type Info = { id?: string; artists: string[]; title: string; album: string };

export { identify, normalize };
