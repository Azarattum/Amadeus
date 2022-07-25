import { load as loadPlugins } from "./plugin";

///TODO: Consider top level await (somehow \_(•_•)_/)
loadPlugins().then(() => {
  console.log("All plugins loaded!");
});

export * from "./plugin";
