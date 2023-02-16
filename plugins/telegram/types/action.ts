import { integer, object, union } from "@amadeus-music/core";

const Next = object({
  next: integer(),
});

const Prev = object({
  prev: integer(),
});

const Close = object({
  close: integer(),
});

const Download = object({
  download: integer(),
});

const Query = union([Next, Prev, Close, Download]);

export { Next, Prev, Close, Download, Query };
