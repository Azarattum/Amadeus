import { bright, reset } from "@amadeus-music/core";
import { changed, persistence } from "../plugin";
import { editor, replier } from "../api/reply";
import { decode } from "crstore";

persistence(function* (user = "shared") {
  const storage = persistence(user);
  yield {
    async merge(changes) {
      const parsed = parseChanges(changes);
      const id = await storage.settings.extract("name", "settings");
      const name = `${bright}${id}${reset}`;

      for (const type in parsed) {
        for (const [playlist, entries] of parsed[type as keyof typeof parsed]) {
          try {
            const chat = await storage.settings.extract(playlist);
            const reply = replier(chat, name, true);
            const edit = editor(chat);
            changed.context({ chat, user, reply, name, edit });
            await changed(type as keyof typeof parsed, [...entries]);
          } catch {}
        }
      }
    },
  };
});

changed(function* (type, entries) {
  yield* this.reply(yield* persistence(this.user)[type].get(entries));
});

function parseChanges(changes: any) {
  let target: string | null = null;
  let consequent = 0;
  let last = "";

  const feed = new Map<string, Set<number>>();
  const library = new Map<string, Set<number>>();

  for (const { table, cid, val, pk } of decode(changes)) {
    if (table !== "library" && table !== "feed") continue;
    if (last === pk) consequent++;
    else consequent = 1;
    last = pk;
    if (table === "library" && cid === "playlist") target = val;
    if (table === "feed" && cid === "type") target = val;
    if (consequent < 3 || !target) continue;
    const entry = +(pk || NaN);
    if (!Number.isInteger(entry)) continue;
    // 3 & 4 are the number of columns other than the primary one
    if (table === "feed" && consequent === 3) {
      if (!feed.has(target)) feed.set(target, new Set());
      feed.get(target)?.add(entry);
    } else if (table === "library" && consequent === 4) {
      if (!library.has(target)) library.set(target, new Set());
      library.get(target)?.add(entry);
    }
  }
  return { feed, library };
}
