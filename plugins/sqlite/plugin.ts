import { register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const { persistence, users, stop } = register({ name, version });
