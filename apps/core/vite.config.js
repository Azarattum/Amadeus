import { mergeConfig, defineConfig } from "vite";

import base from "../../vite.node.js";

const config = defineConfig(
  mergeConfig(base, {
    build: {
      outDir: "../../build",
      lib: {
        formats: ["cjs"],
        entry: "./app.ts",
        fileName: (ext) => `app.${ext}`,
      },
    },
  })
);

export default config;
