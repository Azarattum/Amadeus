import { assert, object, optional, string, type Infer } from "superstruct";
import { capitalize, unprefix } from "@amadeus/util/string";
import { readdir } from "fs/promises";
import * as sdk from "./sdk";

const PluginInfo = object({
  name: string(),
  version: optional(string()),
});

function register(plugin: Infer<typeof PluginInfo>) {
  assert(plugin, PluginInfo);
  plugin.name = capitalize(unprefix(plugin.name));
  //TODO: actually register the plugin
  console.log("Registered", plugin);
  //TODO: bind SDK methods to the plugin
  return sdk;
}

async function load(from = "./plugins") {
  const plugins = await readdir(from);
  const promises = plugins.map((x) => import(`./plugins/${x}`));
  return Promise.all(promises);
}

export { register, load };
