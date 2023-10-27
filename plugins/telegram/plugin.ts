import {
  defaulted,
  register,
  number,
  object,
  string,
  type Infer,
} from "@amadeus-music/core";
import type { Meta } from "@amadeus-music/protocol";
import type { Reply, Edit } from "./types/reply";
import { name, version } from "./package.json";
import { query } from "./types/action";
import { me } from "./types/core";

export const {
  ok,
  err,
  wrn,
  info,
  init,
  pool,
  stop,
  fetch,
  users,
  search,
  relate,
  expand,
  lookup,
  desource,
  recognize,
  transcribe,
  persistence,
  command: cli,
} = register({
  name,
  version,
  config: {
    telegram: defaulted(
      object({
        token: defaulted(string(), ""),
        webhook: defaulted(string(), ""),
      }),
      {}
    ),
  },
  settings: {
    telegram: defaulted(number(), -1),
  },
  context: {
    chat: 0,
    name: "",
    edit: null as any as Edit,
    reply: null as any as Reply,
    user: undefined as string | undefined,
    state: {
      me: {} as Infer<typeof me>,
    },
  },
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
    "callback"
  );

update.catch((error: any) =>
  wrn(error.cause?.message || error.cause || error.message)
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
