import { name, version } from "./package.json";
import { register } from "@amadeus/core";

const { init, stop, info } = register({ name, version });

init((config) => {
  info(`Plugin initialized with ${JSON.stringify(config)}!`);
});

stop(() => {
  info("Plugin stopped!");
});
