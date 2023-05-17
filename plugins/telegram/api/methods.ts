import { format, reencode, resize } from "@amadeus-music/core";
import { Audio, Message, Text } from "../types/reply";
import { file, me, sent } from "../types/core";
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
    params: { chat_id: chat, message_id: message },
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
  const art = JSON.parse(message.track.album.art)[0];
  return fetch("sendAudio", {
    form: {
      chat_id: chat,
      title: message.track.title,
      duration: message.track.length,
      audio: [reencode(message.url, message.track), `./${filename}.opus`],
      thumbnail: art ? [resize(art, 320), "./art.jpg"] : undefined,
      performer: message.track.artists.map((x: any) => x.title).join(", "),
      ...paramify(message),
    },
  }).as(sent);
};

export const sendMessage = (chat: number, message: Text) =>
  fetch("sendMessage", {
    params: {
      chat_id: chat,
      ...paramify(message),
    },
  }).as(sent);

export const setWebhook = (url: URL | string, secret: string) =>
  fetch("setWebhook", {
    params: { url: url.toString(), secret_token: secret },
  }).text();

export const setMyCommands = (
  commands: { command: string; description: string }[]
) =>
  fetch("setMyCommands", {
    params: { commands: JSON.stringify(commands) },
  }).text();

export const editMessageCaption = (
  chat: number,
  message: number,
  params: Message
) =>
  fetch("editMessageCaption", {
    params: {
      chat_id: chat,
      message_id: message,
      ...paramify(params),
    },
  }).text();

export const editMessageText = (
  chat: number,
  message: number,
  params: Message
) =>
  fetch("editMessageText", {
    params: {
      chat_id: chat,
      message_id: message,
      ...paramify(params),
    },
  }).text();

export const getFile = (id: string) =>
  fetch("getFile", {
    params: {
      file_id: id,
    },
  }).as(file);

export const getMe = () => fetch("getMe").as(me);
