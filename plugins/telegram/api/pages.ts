import {
  editMessageCaption,
  editMessageText,
  deleteMessage,
  sendMessage,
} from "./methods";
import { type Page as State, type Infer, async } from "@amadeus-music/core";
import { icon as icons, markdown, escape, pager, menu } from "./markup";
import type { Page as Options } from "../types/reply";
import { format } from "@amadeus-music/protocol";
import { sent } from "../types/core";

const pages = new Map<number, Page>();

function* sendPage(chat: number, { message, reset, page, icon }: Options) {
  const inline = !!message;
  const edit = inline ? editMessageCaption : editMessageText;
  const target =
    message ||
    (yield* sendMessage(chat, { text: icons.load })).result.message_id;

  const id = (Math.random() * 2 ** 32) >>> 0;
  let lastState = null as State<any> | null;
  pages.set(id, {
    *update(state) {
      lastState = state;
      const buttons = state.items.map((x) => ({
        callback: { download: x.id },
        text: format(x),
      }));

      const nextExists = state.progress >= 1 && state.items.length >= 8;
      const percent = Math.round(state.progress * 100);
      const header =
        state.progress < 1
          ? `${percent}% ${icons.load} *${escape(page)}*`
          : `${icon} *${escape(page)}*`;

      yield* async(
        edit(chat, target, {
          markup: pager(id, state.number, buttons, nextExists),
          [inline ? "caption" : "text"]: header,
          mode: markdown(),
        }),
      );
    },
    async close() {
      lastState?.close();
      pages.delete(id);
      if (!inline || !reset) return deleteMessage(chat, target);
      return editMessageCaption(chat, message, {
        markup: menu(reset),
        mode: markdown(),
      });
    },
    get all() {
      return lastState?.pages.flatMap((x) => x.items) || [];
    },
    get items() {
      return lastState?.items || [];
    },
    get loaded() {
      return lastState?.loaded;
    },
    next: () => lastState?.next(),
    prev: () => lastState?.prev(),
  });

  return { result: { message_id: id } } as { result: Infer<typeof sent> };
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
