import type { BaseConfig } from "../data/config";
import { err } from "../status/log";
import { pools } from "libfun";

const all = pools({ group: "core" });
const { pool } = all;
all.catch(err);

// Internal events
const log = pool<(text: string) => void>("log");

// Plugin events
const init = pool<(config: BaseConfig) => void>("init");
const stop = pool("stop");

export { log, init, stop };
export { all as pools, pool };
