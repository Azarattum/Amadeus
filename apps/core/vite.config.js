import { mergeConfig, defineConfig } from "vite";

import base from "../../vite.config.js";
const dest = "../../build";

const config = defineConfig((options) =>
  mergeConfig(base(options), {
    build: {
      outDir: dest,
      lib: {
        formats: ["cjs"],
        entry: "./app.ts",
        fileName: (ext) => `app.${ext}`,
      },
    },
  })
);

export default config;
