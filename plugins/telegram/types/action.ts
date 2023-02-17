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

const Page = object({
  page: integer(),
});

const All = object({
  all: integer(),
});

const Shuffle = object({
  shuffle: integer(),
});

const Query = union([Next, Prev, Close, Download, Page, All, Shuffle]);

export { Next, Prev, Close, Download, Query, Page, All, Shuffle };
