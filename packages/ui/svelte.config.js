import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({ postcss: true }),

  kit: {
    files: {
      lib: "lib",
      routes: "demo",
      template: "demo/__layout.html",
    },
    prerender: { default: true },
  },
};

export default config;
