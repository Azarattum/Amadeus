import { router } from "../plugin";
import { expand } from "./expand";
import { search } from "./search";
import { next } from "./stream";
import { sync } from "./sync";

export const app = router({ sync, search, expand, streams: next });
export type App = typeof app;
