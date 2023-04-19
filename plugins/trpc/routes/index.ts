import { router } from "../plugin";
import { search } from "./search";
import { sync } from "./sync";

export const app = router({ sync, search });
export type App = typeof app;
