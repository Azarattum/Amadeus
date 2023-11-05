import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";
import { platform } from "os";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    files: {
      lib: "lib",
      routes: "routes",
      serviceWorker: "./cache.worker.ts",
      appTemplate: "routes/+layout.html",
    },

    adapter: adapter({ pages: "../../build/public" }),
    prerender: {
      handleMissingId: "warn",
      entries: [
        "/explore/album",
        "/explore/artist",
        "/library/artist",
        "/library/playlist",
        "*",
      ],
    },
  },
  vitePlugin: {
    inspector: {
      toggleKeyCombo:
        platform() === "darwin" ? "meta-shift-x" : "control-shift-x",
    },
  },
};

export default config;
