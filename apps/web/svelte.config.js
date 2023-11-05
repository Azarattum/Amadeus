import { vitePreprocess } from "@sveltejs/kit/vite";
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
    },
  },
  vitePlugin: {
    inspector: {
      toggleKeyCombo: platform() === "darwin" ? "meta-shift-x" : "control-shift-x",
    },
  },
};

export default config;
