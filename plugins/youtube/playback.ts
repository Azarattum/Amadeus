import { type Innertube, Platform } from "youtubei.js";
import { runInNewContext } from "node:vm";

// YouTube.js downloads and extracts the current player code. We only execute it.
Platform.shim.eval = (data) =>
  runInNewContext(`(function () { ${data.output}\n})()`, Object.create(null), {
    timeout: 1000,
    contextCodeGeneration: { strings: false, wasm: false },
  });

export async function getAudioURL(instance: Innertube, id: string) {
  const player = instance.session.player;
  if (!player)
    throw new Error("YouTube player is unavailable for deciphering.");

  const info = await instance.getBasicInfo(id);
  const format = info.chooseFormat({ type: "audio", quality: "best" });
  const url = await format.decipher(player);
  if (!url) throw new Error("YouTube returned an empty audio URL.");
  return url;
}
