import {
  defaulted,
  register,
  number,
  object,
  string,
  Infer,
} from "@amadeus-music/core";
import { name, version } from "./package.json";
import { Reply, Edit } from "./api/reply";
import { Query } from "./types/action";
import { Me } from "./types/core";

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
  desource,
  aggregate,
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
    user: undefined as string | undefined,
    edit: null as any as Edit,
    reply: null as any as Reply,
    state: {
      me: {} as Infer<typeof Me>["result"],
    },
  },
});

const update = pool<(data: string) => void>("update");
const message = pool<(text: string) => void>("message");
const command = pool<(command: string, replied?: number) => void>("command");
const mention = pool<(chat: number) => void>("mention");
const voice = pool<(file: string) => void>("voice");
const post = pool<(file: string, chat: number) => void>("post");
const invite = pool<(chat: number, title: string) => void>("invite");
const callback =
  pool<(request: Infer<typeof Query>, message: number, chat: number) => void>(
    "callback"
  );

update.catch((error: any) =>
  wrn(error.cause?.message || error.cause || error.message)
);

export { callback, message, command, mention, invite, update, voice, post };
