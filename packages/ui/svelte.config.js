import { vitePreprocess } from "@sveltejs/kit/vite";

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
};

export default config;
