import { responseOf, chat, file, sent, me } from "../types/core";
import { reencode, format, resize } from "@amadeus-music/core";
import type { Message, Audio, Text } from "../types/reply";
import { has } from "@amadeus-music/util/object";
import { fetch, wrn } from "../plugin";
import { paramify } from "./reply";

export const sendChatAction = (chat: number, action: "upload_voice") =>
  fetch("sendChatAction", {
    params: { chat_id: chat, action },
  })
    .request.text()
    .catch(wrn);

export const deleteMessage = (chat: number, message: number) =>
  fetch("deleteMessage", {
    params: { message_id: message, chat_id: chat },
  })
    .request.text()
    .catch(wrn);

export const answerCallbackQuery = (query: string) =>
  fetch("answerCallbackQuery", {
    params: { callback_query_id: query },
  })
    .request.text()
    .catch(wrn);

export const sendAudio = (chat: number, message: Audio) => {
  const filename = format(message.track).replace(/[/\\?%*:|"<>]/gi, "");
  const art = !message.file ? message.track.album.arts?.[0] : undefined;
  return fetch("sendAudio", {
    form: {
      audio: message.file || [
        reencode(message.url, message.track),
        `${filename}.ogm`,
      ],
      performer: message.track.artists.map((x: any) => x.title).join(", "),
      thumbnail: art ? [resize(art, 320), "art.jpg"] : undefined,
      duration: Math.round(message.track.duration),
      title: message.track.title,
      chat_id: chat,
      ...paramify(message),
    },
  }).as(responseOf(sent));
};

export const sendMessage = (chat: number, message: Text) =>
  fetch("sendMessage", {
    params: {
      chat_id: chat,
      ...paramify(message),
    },
  }).as(responseOf(sent));

export const setWebhook = (url: string | URL, secret: string) =>
  fetch("setWebhook", {
    params: { secret_token: secret, url: url.toString() },
  }).text();

export const setMyCommands = (
  commands: { description: string; command: string }[],
) =>
  fetch("setMyCommands", {
    params: { commands: JSON.stringify(commands) },
  }).text();

export const editMessageCaption = (
  chat: number,
  message: number,
  params: Message,
) =>
  fetch("editMessageCaption", {
    params: {
      message_id: message,
      chat_id: chat,
      ...paramify(params),
    },
  })
    .request.json()
    .then(({ error }) => {
      if (has(error, "error_code") && error["error_code"] !== 400) {
        wrn("Failed to edit message caption:", error);
      }
    });

export const editMessageText = (
  chat: number,
  message: number,
  params: Message,
) =>
  fetch("editMessageText", {
    params: {
      message_id: message,
      chat_id: chat,
      ...paramify(params),
    },
  })
    .request.json()
    .then(({ error }) => {
      if (has(error, "error_code") && error["error_code"] !== 400) {
        wrn("Failed to edit message text:", error);
      }
    });

export const getFile = (id: string) =>
  fetch("getFile", {
    params: {
      file_id: id,
    },
  }).as(responseOf(file));

export const getChat = (id: number) =>
  fetch("getChat", {
    params: {
      chat_id: id,
    },
  }).as(responseOf(chat));

export const getMe = () => fetch("getMe").as(responseOf(me));
