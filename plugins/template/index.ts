import { register } from "@amadeus-music/core";
import { name, version } from "./package.json";

const { init, stop, info } = register({ name, version });

init((config) => {
  info(`Plugin initialized with ${JSON.stringify(config)}!`);
});

stop(() => {
  info("Plugin stopped!");
});
