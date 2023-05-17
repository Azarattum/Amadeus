import { merge, pick } from "@amadeus-music/util/object";
import { gretch, type GretchOptions } from "gretchen";
import type { Context } from "../plugin/types";
import { errorify } from "libfun/utils/error";
import type { Struct } from "superstruct";
import { async, context } from "libfun";
import { Readable } from "node:stream";
import { pools } from "../event/pool";
import { Form } from "./form";

type FetchOptions = {
  [K in keyof GretchOptions]: K extends "baseURL"
    ? string | string[]
    : K extends "headers"
    ? Record<string, string | string[]>
    : GretchOptions[K];
} & {
  params?: Record<string, string | number | (string | number)[]>;
  form?: Record<
    string,
    string | number | (string | number)[] | [Readable, string] | undefined
  >;
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
        new Form(options.form)
      ) as ReadableStream<ArrayBufferView>)
    : undefined;

  const request = gretch<unknown, unknown>(url, {
    duplex: options.form ? "half" : undefined,
    method: options.form ? "POST" : "GET",
    body,
    ...options,
    signal: context.signal || options.signal,
    baseURL: pick(options.baseURL),
    headers: {
      ...(options.form ? Form.headers : {}),
      ...pick(options.headers),
    },
  });

  return {
    request,
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

export { fetcher, fetch };
export type { FetchOptions };
