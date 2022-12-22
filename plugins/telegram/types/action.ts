import { object, string, union } from "@amadeus-music/core";

const Next = object({
  next: string(),
});

const Prev = object({
  prev: string(),
});

const Close = object({
  close: string(),
});

const Query = union([Next, Prev, Close]);

export { Next, Prev, Close, Query };
