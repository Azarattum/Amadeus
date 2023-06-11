import { resolve } from "node:path";

export const path = (to = ".") =>
  import.meta.env.DEV ? resolve(__dirname, "..", to) : resolve(__dirname, to);
