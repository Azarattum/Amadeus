import type { Track } from "@amadeus-music/protocol";
import { replier, editor } from "../api/reply";

type Queue = (tracks: Track[]) => number;
type Replier = (message: Message) => number;
type Reply = ReturnType<typeof replier>;
type Edit = ReturnType<typeof editor>;

type Audio = {
  caption?: string;
  markup?: string;
  file?: string;
  mode?: string;
  track: Track;
  url: string;
};

type Text = {
  markup?: string;
  text?: string;
  mode?: string;
  to?: string;
};

type Page = {
  message?: number;
  reset?: number;
  page: string;
  icon: string;
};

type Message = Audio | Text | Page;

export type { Replier, Message, Queue, Reply, Audio, Edit, Text, Page };
