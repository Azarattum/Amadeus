import {
  aggregate,
  message,
  search,
  fetch,
  voice,
  info,
  post,
  persistence,
} from "../plugin";
import { markdown, pager, escape } from "../api/markup";
import { match } from "@amadeus-music/core";
import { paramify } from "../api/reply";

message(function* (text) {
  info(`${this.name} is searching for "${text}"...`);
  const chat = this.chat;

  const cache = persistence();
  const { message_id: message } = yield* this.reply({ text: "⏳" });
  const id = aggregate(search, ["track", text] as const, {
    async update(tracks, progress, page) {
      await Promise.all(tracks.map((x) => cache.add(x)));
      const buttons = tracks.map((x) => ({
        text: `${x.artists.map((x) => x.title).join(", ")} - ${x.title}`,
        callback: { download: x.id },
      }));

      const params = {
        mode: markdown(),
        text:
          progress < 1
            ? `${Math.round(progress * 100)}% ⏳ ${escape(text)}`
            : `🔎 *${escape(text)}*`,
        markup: pager(id, page, buttons, progress >= 1),
      };

      fetch("editMessageText", {
        params: {
          chat_id: chat.toString(),
          message_id: message.toString(),
          ...paramify(params),
        },
      });
    },
    invalidate() {
      fetch("deleteMessage", {
        params: {
          message_id: message.toString(),
          chat_id: chat.toString(),
        },
      }).flush();
    },
    compare: match(text),
    page: 8,
  });
});

voice((file) => {
  info("voice", file);
});

post((file, chat) => {
  info("post", file, chat);
});
