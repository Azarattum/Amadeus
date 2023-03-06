import {
  deleteMessage,
  editMessageCaption,
  editMessageText,
  sendMessage,
} from "./methods";
import { icon as icons, markdown, pager, escape, menu } from "./markup";
import { Page as State } from "@amadeus-music/core";
import { format } from "@amadeus-music/protocol";
import { Page as Options } from "../types/reply";

const pages = new Map<number, Page>();

function* sendPage(chat: number, { page, icon, message, reset }: Options) {
  const inline = !!message;
  const edit = inline ? editMessageCaption : editMessageText;
  const target =
    message ||
    (yield* sendMessage(chat, { text: icons.load })).result.message_id;

  const id = (Math.random() * 2 ** 32) >>> 0;
  let lastState = null as null | State<any>;
  pages.set(id, {
    *update(state) {
      lastState = state;
      const buttons = state.items.map((x) => ({
        text: format(x),
        callback: { download: x.id },
      }));

      const nextExists = state.progress >= 1 && state.items.length >= 8;
      const percent = Math.round(state.progress * 100);
      const header =
        state.progress < 1
          ? `${percent}% ${icons.load} *${escape(page)}*`
          : `${icon} *${escape(page)}*`;

      yield* edit(chat, target, {
        mode: markdown(),
        [inline ? "caption" : "text"]: header,
        markup: pager(id, state.number, buttons, nextExists),
      });
    },
    async close() {
      lastState?.close();
      pages.delete(id);
      if (!inline || !reset) return deleteMessage(chat, target);
      return editMessageCaption(chat, message, {
        mode: markdown(),
        markup: menu(reset),
      });
    },
    get loaded() {
      return lastState?.loaded;
    },
    get items() {
      return lastState?.items || [];
    },
    get all() {
      return lastState?.pages.flatMap((x) => x.items) || [];
    },
    next: () => lastState?.next(),
    prev: () => lastState?.prev(),
  });

  return { result: { message_id: id } };
}

type Page<T = any> = {
  update(state: State<T>): Generator<any>;
  close(): Promise<any>;
  next(): void;
  prev(): void;

  get loaded(): Promise<void> | undefined;
  get items(): T[];
  get all(): T[];
};

export { sendPage, pages };
