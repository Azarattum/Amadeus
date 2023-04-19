import { changed, persistence } from "../plugin";

changed(function* (type, entries) {
  yield* this.reply(yield* persistence(this.user)[type].get(entries));
});

export function parseChanges(changes: any[]) {
  const entries = new Map<number, [Set<number>, "feed" | "library"]>();
  let lastId = 0;
  let consequent = 0;
  let target = -1;
  for (let i = 3; i < changes.length; i += 6) {
    const table = changes[i];
    if (table !== "library" && table !== "feed") continue;
    const column = changes[i - 2];
    const value = changes[i + 1];
    const id = changes[i - 1];
    if (lastId === id) consequent++;
    else consequent = 1;
    lastId = id;
    if (table === "library" && column === "playlist") target = value;
    if (table === "feed" && column === "type") target = value;
    if (
      // 3 & 4 are the number of columns other than the primary one
      (table === "feed" && consequent === 3) ||
      (table === "library" && consequent === 4)
    ) {
      if (!entries.has(target)) entries.set(target, [new Set(), table]);
      entries.get(target)?.[0]?.add(id);
    }
  }
  return entries;
}
