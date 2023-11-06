import {
  type Infer,
  defaulted,
  register,
  number,
  object,
  string,
} from "@amadeus-music/core";
import type { Meta } from "@amadeus-music/protocol";
import type { Reply, Edit } from "./types/reply";
import { version, name } from "./package.json";
import { query } from "./types/action";
import { me } from "./types/core";

export const {
  command: cli,
  persistence,
  transcribe,
  recognize,
  desource,
  search,
  scrape,
  relate,
  expand,
  lookup,
  fetch,
  users,
  info,
  init,
  pool,
  stop,
  err,
  wrn,
  ok,
} = register({
  context: {
    state: {
      me: {} as Infer<typeof me>,
    },
    user: undefined as string | undefined,
    reply: null as any as Reply,
    edit: null as any as Edit,
    name: "",
    chat: 0,
  },
  config: {
    telegram: defaulted(
      object({
        webhook: defaulted(string(), ""),
        token: defaulted(string(), ""),
      }),
      {},
    ),
  },
  settings: {
    telegram: defaulted(number(), -1),
  },
  version,
  name,
});

const temp = new Map<number, Set<number>>();

const voice = pool<(url: string) => void>("voice");
const update = pool<(data: string) => void>("update");
const mention = pool<(chat: number) => void>("mention");
const post = pool<(text: Meta, chat: number) => void>("post");
const message = pool<(text: string | Meta) => void>("message");
const invite = pool<(chat: number, title: string) => void>("invite");
const command = pool<(command: string, replied?: number) => void>("command");
const changed = pool<(entries: number[]) => void>("changed");
const callback =
  pool<(request: Infer<typeof query>, message: number, chat: number) => void>(
    "callback",
  );

update.catch((error: any) =>
  wrn(error.cause?.message || error.cause || error.message),
);

export {
  callback,
  message,
  command,
  mention,
  changed,
  invite,
  update,
  voice,
  post,
  temp,
};
