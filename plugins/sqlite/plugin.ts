import { register } from "@amadeus-music/core";
import { version, name } from "./package.json";

export const { persistence, users, stop, err } = register({ version, name });
