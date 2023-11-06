import { next as streams } from "./stream";
import { transcribe } from "./transcribe";
import { desource } from "./desource";
import { router } from "../plugin";
import { expand } from "./expand";
import { search } from "./search";
import { sync } from "./sync";

export const app = router({
  transcribe,
  desource,
  streams,
  expand,
  search,
  sync,
});
export type App = typeof app;
