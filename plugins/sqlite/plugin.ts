import { register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const { database, users, stop } = register({ name, version });
