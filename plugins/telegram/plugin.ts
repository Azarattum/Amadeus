import {
  defaulted,
  Infer,
  number,
  object,
  record,
  register,
  string,
  type,
} from "@amadeus-music/core";
import { name, version } from "./package.json";
import { Query } from "./types/action";
import { Reply, Edit } from "./reply";
import { Me } from "./types/core";

export const { info, err, wrn, init, stop, search, desource, pool, fetch } =
  register({
    name,
    version,
    config: {
      users: record(
        string(),
        type({
          telegram: defaulted(number(), -1),
        })
      ),
      telegram: defaulted(
        object({
          token: defaulted(string(), ""),
          webhook: defaulted(string(), ""),
        }),
        {}
      ),
    },
    context: {
      chat: 0,
      name: "",
      edit: null as any as Edit,
      reply: null as any as Reply,
      state: {
        users: {} as Record<string, number>,
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
