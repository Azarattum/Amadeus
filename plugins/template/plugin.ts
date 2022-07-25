import { name, version } from "./package.json";
import { register } from "@amadeus/core";

const { init, stop, search, relate, recognize } = register({ name, version });

init((config) => {
  console.log(`Plugin initialized with ${JSON.stringify(config)}!`);
});

stop(() => {
  console.log("Plugin stopped!");
});

search((type, query) => {
  console.log(`Plugin is searching for ${type} "${query}"`);
});

relate((type, query) => {
  console.log("Trying to relate...");
});

recognize((stream) => {
  console.log("Trying to recognize...");
});

console.log("Plugin loaded!");
