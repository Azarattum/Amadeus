import { vitePreprocess } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    files: {
      lib: "lib",
      routes: "routes",
      appTemplate: "routes/+layout.html",
    },

    adapter: adapter({ pages: "../../build/public" }),
    prerender: {
      handleMissingId: "warn",
    },
  },
};

export default config;
