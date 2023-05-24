import { next as streams } from "./stream";
import { transcribe } from "./transcribe";
import { desource } from "./desource";
import { router } from "../plugin";
import { expand } from "./expand";
import { search } from "./search";
import { sync } from "./sync";

export const app = router({
  sync,
  expand,
  search,
  streams,
  desource,
  transcribe,
});
export type App = typeof app;
