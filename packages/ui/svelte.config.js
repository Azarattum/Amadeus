import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { platform } from "os";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    alias: {
      "@amadeus-music/ui/internal": "./internal",
      "@amadeus-music/ui/action": "./action.ts",
      "@amadeus-music/ui": "./component.ts",
    },
    files: {
      appTemplate: "demo/+layout.html",
      routes: "demo",
      lib: "lib",
    },
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
