import adapter from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({ postcss: true }),

  kit: {
    files: {
      lib: "lib",
      routes: "routes",
      appTemplate: "routes/+layout.html",
    },

    adapter: adapter({ pages: "../../build/public" }),
  },
};

export default config;
