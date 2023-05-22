import { StructError, async, path } from "@amadeus-music/core";
import { fetch as call, ok, wrn } from "./plugin";
// @ts-ignore Exports on `onnxruntime-web` are a bit broken
import onnx from "onnxruntime-web";
import { captcha } from "./types";
import { readFileSync } from "fs";
import { decode } from "jpeg-js";
import { resolve } from "path";

async function recognize(bytes: ArrayBuffer) {
  const image = decode(bytes, { formatAsRGBA: false, useTArray: true });
  const size = [1, image.width, image.height, 3];
  const tensor = new onnx.Tensor("float32", preprocess(image), size);

  onnx.env.wasm.numThreads = 1;
  onnx.env.wasm.wasmPaths = { "ort-wasm-simd.wasm": paths.wasm };
  const session = await onnx.InferenceSession.create(readFileSync(paths.model));
  const result = await session.run({ image: tensor });

  return interpret(result.dense2.data);

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

async function solve(url: string, accuracy = 0.9, limit = 25) {
  url = url.replace("resized=1", "resized=0");
  for (let i = 0; i < limit; i++) {
    const image = await fetch(url).then((x) => x.arrayBuffer());
    const { confidence, answer } = await recognize(image);
    if (confidence >= accuracy) return answer;
  }
}

function* handle(error: unknown) {
  if (error instanceof StructError && captcha.is(error.branch[0])) {
    wrn("Got captcha! Solving...");
    const err = new Error("Unable to solve captcha!");
    const { captcha_img: url, captcha_sid } = error.branch[0].error;
    const captcha_key = yield* async(solve(url));
    if (!captcha_key) throw err;

    // VK doesn't allow to solve captchas faster that 2.5s
    yield* async(new Promise((r) => setTimeout(r, 2500)));
    const data = yield* call(`audio.search`, {
      params: { q: "", captcha_sid, captcha_key },
    }).json();
    if (typeof data !== "object" || !data || "error" in data) throw err;
    ok("Successfully solved captcha!");
  } else throw error;
}

const paths = {
  model: import.meta.env.DEV
    ? resolve(__dirname, "assets/captcha.onnx")
    : path(`plugins/vk/captcha.onnx`),
  wasm: import.meta.env.DEV
    ? resolve(__dirname, "assets/onnx.wasm")
    : path(`plugins/vk/onnx.wasm`),
};

export { solve, handle };
