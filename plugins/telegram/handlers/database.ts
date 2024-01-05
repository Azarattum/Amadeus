import { bright, reset } from "@amadeus-music/core";
import { changed, persistence } from "../plugin";
import { editor, replier } from "../api/reply";
import { decode } from "crstore";

changed(function* (entries) {
  yield* this.reply(yield* persistence(this.user).library.get(entries));
});

function handleChanges(user: string) {
  const storage = persistence(user);
  return async (changes: any[]) => {
    const parsed = parseChanges(changes);
    const id = await storage.settings.extract("name", "settings");
    const name = `${bright}${id}${reset}`;

    for (const [playlist, entries] of parsed) {
      try {
        const chat = await storage.settings.extract(playlist);
        const reply = replier(chat, name, true);
        const edit = editor(chat);
        changed.context({ chat, user, reply, name, edit });
        await changed([...entries]);
      } catch {}
    }
  };
}

function parseChanges(changes: any) {
  let target: string | undefined;
  let consequent = 0;
  let last = "";

  const library = new Map<string, Set<number>>();

  for (const { table, cid, val, pk } of decode(changes)) {
    if (table !== "library") continue;
    if (last === pk.toString()) consequent++;
    else consequent = 1;
    last = pk.toString();
    if (cid === "playlist") target = val?.toString();
    // 4 is the number of columns other than the primary one
    if (consequent !== 4 || !target) continue;
    const entry = +(pk || NaN);
    if (!Number.isInteger(entry)) continue;
    if (!library.has(target)) library.set(target, new Set());
    library.get(target)?.add(entry);
  }
  return library;
}

export { handleChanges };
