import { type Innertube, Misc, Platform, Player } from "youtubei.js";
import { describe, expect, it } from "vitest";
import { getAudioURL } from "./playback";

async function fixture(ciphered = false) {
  const player = await Player.fromSource("fixture", {
    signature_timestamp: 123,
    data: {
      exported: ["nsigFunction"],
      output: `var exportedVars = {
        nsigFunction: function (url, sp, sig) {
          function StreamingURL() { this.values = { n: "decoded-n" }; }
          StreamingURL.prototype.get = function (key) { return this.values[key]; };
          var result = new StreamingURL();
          if (sig) result.values[sp] = "decoded-signature";
          return result;
        }
      };`,
    },
  });
  const rawURL = "https://example.googlevideo.com/videoplayback?n=encoded-n";
  const format = new Misc.Format({
    itag: 140,
    mimeType: "audio/mp4",
    audioQuality: "AUDIO_QUALITY_MEDIUM",
    ...(ciphered
      ? {
          signatureCipher: new URLSearchParams({
            url: rawURL,
            s: "encoded-s",
            sp: "sig",
          }).toString(),
        }
      : { url: rawURL }),
  });
  const instance = {
    session: { player },
    getBasicInfo: async () => ({ chooseFormat: () => format }),
  } as unknown as Innertube;
  return { instance, format, rawURL };
}

describe("YouTube audio URLs", () => {
  it("deciphers n instead of returning the unchanged format URL", async () => {
    const { instance, format, rawURL } = await fixture();
    expect(await format.decipher()).toBe(rawURL);
    const url = new URL(await getAudioURL(instance, "fixture"));
    expect(url.searchParams.get("n")).toBe("decoded-n");
  });

  it("deciphers signatureCipher formats instead of returning an empty URL", async () => {
    const { instance, format } = await fixture(true);
    expect(await format.decipher()).toBe("");
    const url = new URL(await getAudioURL(instance, "fixture"));
    expect(url.searchParams.get("n")).toBe("decoded-n");
    expect(url.searchParams.get("sig")).toBe("decoded-signature");
  });

  it("reports a missing player before returning an unusable source", async () => {
    const { instance } = await fixture();
    instance.session.player = undefined;
    await expect(getAudioURL(instance, "fixture")).rejects.toThrow(
      "player is unavailable",
    );
  });

  it("limits execution time for player code", () => {
    expect(() =>
      Platform.shim.eval({ output: "while (true) {}", exported: [] }, {}),
    ).toThrow(/timed out/);
  });
});
