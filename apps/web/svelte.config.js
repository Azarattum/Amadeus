import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";
import { platform } from "os";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    prerender: {
      entries: [
        "/explore/album",
        "/explore/artist",
        "/library/artist",
        "/library/playlist",
        "*",
      ],
      handleMissingId: "warn",
    },
    files: {
      serviceWorker: "./cache.worker.ts",
      appTemplate: "routes/+layout.html",
      routes: "routes",
      lib: "lib",
    },
    adapter: adapter({ pages: "../../build/public" }),
  },
  vitePlugin: {
    inspector: {
      toggleKeyCombo:
        platform() === "darwin" ? "meta-shift-x" : "control-shift-x",
    },
  },
  preprocess: vitePreprocess(),
};

export default config;
