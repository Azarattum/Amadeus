import { interactive } from "./status/cli";
import { complete, start } from "./status";
import { configure } from "./data/config";
import { err } from "./status/log";
import { load } from "./plugin";

start().then(configure).then(load).then(complete).then(interactive).catch(err);

export { register } from "./plugin";
