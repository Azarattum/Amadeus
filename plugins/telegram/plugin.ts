import {
  defaulted,
  fetcher,
  FetchOptions,
  Infer,
  number,
  object,
  record,
  register,
  string,
  type,
} from "@amadeus-music/core";
import { name, version } from "./package.json";
import { Me, Query } from "./types";

export const { info, err, wrn, init, stop, pool } = register({
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
});

const state = {
  request: {} as FetchOptions,
  users: {} as Record<string, number>,
  me: {} as Infer<typeof Me>["result"],
};

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

const fetch = fetcher(state.request);

export {
  callback,
  message,
  command,
  mention,
  invite,
  state,
  fetch,
  voice,
  post,
};
