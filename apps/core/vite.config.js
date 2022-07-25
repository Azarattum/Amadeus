import { mergeConfig, defineConfig } from "vite";
import { copy } from "vite-plugin-copy";

import base from "../../vite.config.js";

const dest = "../../build";

const data = copy([{ src: "config", dest }]);

const config = defineConfig((options) =>
  mergeConfig(base(options), {
    plugins: [data],
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
