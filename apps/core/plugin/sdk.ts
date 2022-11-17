import {
  PluginInfo,
  type ConfigStruct,
  type Configure,
  type Plugin,
} from "./types";
import { gretch, type GretchOptions } from "gretchen";
import { bright, reset } from "@amadeus/util/color";
import { assert } from "@amadeus/util/superstruct";
import { command, usage } from "../status/cli";
import { errorify } from "libfun/utils/error";
import { merge } from "@amadeus/util/object";
import { init, stop, pool } from "../event";
import type { Struct } from "superstruct";
import { async, context } from "libfun";
import * as log from "../status/log";
import { info } from "../status/log";
import { format, plugins } from ".";

const bound = { pool, init, stop, command, usage, ...log };

function register<T extends ConfigStruct = undefined>(plugin: Plugin<T>) {
  assert(plugin, PluginInfo, "Tried to register an invalid plugin!");
  plugin.name = format(plugin.name);
  plugins.add(plugin);

  info(`Loading ${bright}${plugin.name}${reset} plugin v${plugin.version}...`);

  const context = { group: plugin.name.toLowerCase() };
  return Object.fromEntries(
    Object.entries(bound).map(([key, fn]) => [key, (fn as any).bind(context)])
  ) as Configure<typeof bound, T>;
}

type FetchOptions = GretchOptions & { params?: Record<string, string> };
function fetcher(defaults: FetchOptions = {}) {
  return (url: string, options: FetchOptions = {}) =>
    fetch(url, merge(defaults, options));
}

function fetch(url: string, options: FetchOptions = {}) {
  const params = new URLSearchParams(options.params).toString();
  if (params) {
    if (url.includes("?")) url += "&" + params;
    else url += "?" + params;
    delete options.params;
  }

  const request = gretch<unknown, unknown>(url, {
    ...options,
    signal: context.signal || options.signal,
  });

  return {
    *flush() {
      return yield* async(request.flush());
    },
    *arrayBuffer() {
      const { data, error } = yield* async(request.arrayBuffer());
      if (error) throw errorify(error);
      return data as ArrayBuffer;
    },
    *blob() {
      const { data, error } = yield* async(request.blob());
      if (error) throw errorify(error);
      return data as Blob;
    },
    *formData() {
      const { data, error } = yield* async(request.formData());
      if (error) throw errorify(error);
      return data as FormData;
    },
    *text() {
      const { data, error } = yield* async(request.text());
      if (error) throw errorify(error);
      return data as string;
    },
    *json() {
      const { data, error } = yield* async(request.json());
      if (error) throw errorify(error);
      return data;
    },
    *as<T, S>(struct: Struct<T, S>) {
      const { data, error } = yield* async(request.json());
      if (error) throw errorify(error);
      return struct.create(data);
    },
  };
}

export { register, fetch, fetcher };
export { async, take, first, map } from "libfun";
