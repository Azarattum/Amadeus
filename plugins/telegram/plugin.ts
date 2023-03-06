import {
  defaulted,
  register,
  number,
  object,
  string,
  Infer,
} from "@amadeus-music/core";
import { name, version } from "./package.json";
import { Reply, Edit } from "./types/reply";
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
  desource,
  aggregate,
  transcribe,
  persistence,
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
      me: {} as Infer<typeof me>["result"],
    },
  },
});

const temp = new Map<number, Set<number>>();
const update = pool<(data: string) => void>("update");
const message = pool<(text: string) => void>("message");
const command = pool<(command: string, replied?: number) => void>("command");
const mention = pool<(chat: number) => void>("mention");
const voice = pool<(file: string) => void>("voice");
const post = pool<(file: string, chat: number) => void>("post");
const invite = pool<(chat: number, title: string) => void>("invite");
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
  invite,
  update,
  voice,
  post,
  temp,
};
