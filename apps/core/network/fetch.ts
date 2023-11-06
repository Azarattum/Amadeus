import { merge, pick } from "@amadeus-music/util/object";
import { type GretchOptions, gretch } from "gretchen";
import type { Context } from "../plugin/types";
import { errorify } from "libfun/utils/error";
import type { Struct } from "superstruct";
import { context, async } from "libfun";
import { Readable } from "node:stream";
import { pools } from "../event/pool";
import { Form } from "./form";

type FetchOptions = {
  [K in keyof GretchOptions]: K extends "baseURL"
    ? string[] | string
    : K extends "headers"
    ? Record<string, string[] | string>
    : GretchOptions[K];
} & {
  form?: Record<
    string,
    (string | number)[] | [Readable, string] | string | number | undefined
  >;
  params?: Record<string, (string | number)[] | string | number>;
};

function fetcher(this: Context, defaults: FetchOptions = {}) {
  const bound = fetch.bind(this);
  return (url: string, options: FetchOptions = {}) =>
    bound(url, merge(defaults, options));
}

function fetch(this: Context, url: string, options: FetchOptions = {}) {
  const group = this?.group || context.group;
  const ctx: any = group ? pools.contexts.get(group) || {} : {};
  if (typeof ctx.fetch === "object") options = merge(ctx.fetch, options);

  const params = new URLSearchParams(pick(options.params) as any).toString();
  if (params) {
    if (url.includes("?")) url += "&" + params;
    else url += "?" + params;
  }
  const body = options.form
    ? (Readable.toWeb(
        new Form(options.form),
      ) as ReadableStream<ArrayBufferView>)
    : undefined;

  const request = gretch<unknown, unknown>(url, {
    timeout: options.form ? 10 * 60 * 1000 : 10000,
    duplex: options.form ? "half" : undefined,
    method: options.form ? "POST" : "GET",
    body,
    ...options,
    headers: {
      ...(options.form ? Form.headers : {}),
      ...pick(options.headers),
    },
    signal: context.signal || options.signal,
    baseURL: pick(options.baseURL),
  });

  return {
    *as<T, S>(struct: Struct<T, S>) {
      const { error, data } = yield* async(request.json());
      if (error) throw errorify(error);
      return struct.create(data);
    },
    *arrayBuffer() {
      const { error, data } = yield* async(request.arrayBuffer());
      if (error) throw errorify(error);
      return data as ArrayBuffer;
    },
    *formData() {
      const { error, data } = yield* async(request.formData());
      if (error) throw errorify(error);
      return data as FormData;
    },
    *text() {
      const { error, data } = yield* async(request.text());
      if (error) throw errorify(error);
      return data as string;
    },
    *blob() {
      const { error, data } = yield* async(request.blob());
      if (error) throw errorify(error);
      return data as Blob;
    },
    *json() {
      const { error, data } = yield* async(request.json());
      if (error) throw errorify(error);
      return data;
    },
    *flush() {
      return yield* async(request.flush());
    },
    request,
  };
}

export { fetcher, fetch };
export type { FetchOptions };
