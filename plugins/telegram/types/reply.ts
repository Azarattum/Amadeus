import type { Track } from "@amadeus-music/protocol";
import { editor, replier } from "../api/reply";

type Queue = (tracks: Track[]) => number;
type Replier = (message: Message) => number;
type Reply = ReturnType<typeof replier>;
type Edit = ReturnType<typeof editor>;

type Audio = {
  url: string;
  track: Track;
  file?: string;
  mode?: string;
  markup?: string;
  caption?: string;
};

type Text = {
  to?: string;
  text?: string;
  mode?: string;
  markup?: string;
};

type Page = {
  page: string;
  icon: string;
  message?: number;
  reset?: number;
};

type Message = Audio | Text | Page;

export type { Queue, Replier, Reply, Edit, Message, Audio, Text, Page };
