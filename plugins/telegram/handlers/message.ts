import { info, message, search, fetch, voice, post } from "../plugin";
import { aggregate, match } from "@amadeus-music/core";
import { markdown, pager } from "../api/markup";
import { paramify } from "../api/reply";

message(function* (text) {
  info(`${this.name} is searching for "${text}"...`);
  const chat = this.chat;

  const { message_id: message } = yield* this.reply({ text: "⏳" });
  const id = aggregate(search, ["track", text] as const)({
    update(tracks, progress, page) {
      const buttons = tracks.map((x) => ({
        text: `${x.artists.join(", ")} - ${x.title}`,
        callback: { download: x.id },
      }));

      const params = {
        mode: markdown(),
        text:
          progress < 1
            ? `${Math.round(progress * 100)}% ⏳ ${escape(text)}`
            : `🔎 *${escape(text)}*`,
        markup: pager(id, page, buttons),
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
