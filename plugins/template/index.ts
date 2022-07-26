import { name, version } from "./package.json";
import { register } from "@amadeus/core";

const { init, stop, search, relate, recognize, info } = register({
  name,
  version,
});

init((config) => {
  info(`Plugin initialized with ${JSON.stringify(config)}!`);
});

stop(() => {
  info("Plugin stopped!");
});

search((type, query) => {
  info(`Plugin is searching for ${type} "${query}"...`);
});

relate((type, query) => {
  info(`Trying to relate to ${type} "${query}"...`);
});

recognize((stream) => {
  info("Trying to recognize...", stream);
});
