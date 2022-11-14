import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({ postcss: true }),

  kit: {
    files: {
      lib: "lib",
      routes: "demo",
      appTemplate: "demo/+layout.html",
    },
    alias: {
      "@amadeus/ui/internal": "./internal",
      "@amadeus/ui/action": "./action.ts",
      "@amadeus/ui": "./component.ts",
    },
  },
};

export default config;
