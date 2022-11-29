import type { Abstract, Media, Unique } from "@amadeus-music/protocol";
import { clean } from "@amadeus-music/util/string";
import { createHash } from "node:crypto";
import { pipe } from "libfun";

type Entity = string | Media | Abstract<Media> | Unique<Media>;

const sha = createHash("SHA1");

function hash(text: string) {
  return sha.update(text).copy().digest("hex");
}

function normalize<T extends Entity>(entity: T): T extends string ? string : T {
  if (typeof entity !== "object") return clean(entity) as any;
  const norm = { ...entity };
  if ("artists" in norm) norm.artists = norm.artists.map(clean).sort();
  if ("title" in norm) norm.title = clean(entity.title);
  if ("album" in norm) norm.album = clean(norm.album);
  return norm as any;
}

function stringify(entity: Entity) {
  entity = normalize(entity);
  return typeof entity === "string"
    ? entity
    : "artists" in entity && "title" in entity && "album" in entity
    ? `${entity.artists}-${entity.title}-${entity.album}`
    : "artists" in entity && "title" in entity
    ? `${entity.artists}-${entity.title}`
    : "title" in entity
    ? entity.title
    : entity;
}

function identify(data: Entity) {
  if (data && typeof data === "object" && "id" in data) return data.id;
  return pipe(data)(normalize, stringify, hash);
}

export { identify, stringify, normalize, hash };
