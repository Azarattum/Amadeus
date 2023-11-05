import { vitePreprocess } from "@sveltejs/kit/vite";
import { platform } from "os";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    files: {
      lib: "lib",
      routes: "demo",
      appTemplate: "demo/+layout.html",
    },
    alias: {
      "@amadeus-music/ui/internal": "./internal",
      "@amadeus-music/ui/action": "./action.ts",
      "@amadeus-music/ui": "./component.ts",
    },
  },
  vitePlugin: {
    inspector: {
      toggleKeyCombo: platform() === "darwin" ? "meta-shift-x" : "control-shift-x",
    },
  },
};

export default config;
