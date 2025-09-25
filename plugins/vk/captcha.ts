import {
  type Struct,
  StructError,
  async,
  path,
  first,
} from "@amadeus-music/core";
import type { FetchOptions } from "@amadeus-music/core/network/fetch";
import { fetch as call, ok, pool, wrn } from "./plugin";
// @ts-ignore
import * as onnx from "onnxruntime-web";
import { captcha } from "./types";
import { readFileSync } from "fs";
import { decode } from "jpeg-js";
import { resolve } from "path";

// Use constant sid to avoid cyrillic captchas.
//   This does seem to work, but is there a better way?..
const CAPTCHA_SID = "625944628258";
const CAPTCHA_URL = `https://vk.ru/captcha.php?sid=${CAPTCHA_SID}&s=1`;

// Throttles expensive API calls
const safeCall = pool<
  (url: string, options: FetchOptions, type: Struct<any, any>) => unknown
>("fetch", { concurrency: 1, rate: 90 });

async function recognize(bytes: ArrayBuffer) {
  const image = decode(bytes, { formatAsRGBA: false, useTArray: true });
  const size = [1, image.width, image.height, 3];
  const tensor = new onnx.Tensor("float32", preprocess(image), size);

  onnx.env.wasm.numThreads = 1;
  onnx.env.wasm.wasmPaths = { "ort-wasm-simd.wasm": paths.wasm };
  const session = await onnx.InferenceSession.create(readFileSync(paths.model));
  const result = await session.run({ image: tensor });

  return interpret(result.dense2.data as Uint8Array);

  function preprocess({
    width,
    height,
    data,
  }: {
    width: number;
    height: number;
    data: Uint8Array;
  }) {
    const result = new Float32Array(data.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let i = 0; i < 3; i++) {
          result[x * height * 3 + y * 3 + (2 - i)] =
            data[y * width * 3 + x * 3 + i] / 255;
        }
      }
    }
    return result;
  }

  function interpret(results: Uint8Array) {
    const characters = "zshqdv278xy5eau4knmcp";
    let confidence = 1;
    let last = null;
    let answer = "";

    for (let i = 0; i < results.length; i += 23) {
      const slice = results.slice(i, i + 23);
      const index = slice.indexOf(Math.max.apply(null, slice as any));

      if (index !== last && index && index < characters.length + 1) {
        answer += characters[index - 1];
        confidence *= slice[index];
      }

      last = index;
    }
    answer = answer.slice(0, 7);

    return { answer, confidence };
  }
}

async function solve(url: string, accuracy = 0.8, limit = 4) {
  url = CAPTCHA_URL; // url.replace("resized=1", "resized=0")
  for (let i = 0; i < limit; i++) {
    const image = await fetch(url).then((x) => x.arrayBuffer());
    try {
      const { confidence, answer } = await recognize(image);
      if (confidence >= accuracy || i === limit - 1) return answer;
    } catch (error) {
      wrn("Captcha recognition failed with: ", error);
    }
    await new Promise((r) => setTimeout(r, i * i * 500));
  }
}

safeCall(function* (url, options, type) {
  const err = new Error("Unable to solve captcha!");
  const retries = 5;

  let captcha_sid = "";
  let captcha_key = "";

  for (let i = 0; i < retries; i++) {
    const merged = {
      ...options,
      params: { ...options.params, captcha_sid, captcha_key },
    };

    try {
      yield yield* call(url, merged).as(type);
      if (captcha_sid) ok("Successfully solved captcha!");
      return;
    } catch (error) {
      if (error instanceof StructError && captcha.is(error.branch[0])) {
        if (!captcha_sid) wrn("Got captcha! Solving...");
        const details = error.branch[0].error;
        const key = yield* async(solve(details["captcha_img"]));
        if (!key) throw err;

        // VK doesn't allow to solve captchas fast
        const delay = 3500 + Math.random() * 500;
        yield* async(new Promise((r) => setTimeout(r, delay)));
        captcha_sid = CAPTCHA_SID; // details["captcha_sid"];
        captcha_key = key;
      } else throw error;
    }
  }
  throw err;
});

function* safeFetch<T>(
  url: string,
  options: FetchOptions,
  type: Struct<T, any>,
) {
  return (yield* async(first(safeCall(url, options, type)))) as T;
}

const paths = {
  model: import.meta.env.DEV
    ? resolve(__dirname, "assets/captcha.onnx")
    : path(`plugins/vk/captcha.onnx`),
  wasm: import.meta.env.DEV
    ? resolve(__dirname, "assets/onnx.wasm")
    : path(`plugins/vk/onnx.wasm`),
};

export { safeFetch };
