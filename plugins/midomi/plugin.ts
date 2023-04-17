import { register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const { init, connect, recognize } = register({ name, version });
