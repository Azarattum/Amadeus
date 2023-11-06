import { defineConfig, mergeConfig } from "vite";
import base from "../../vite.node.js";

export default defineConfig((env) =>
  mergeConfig(base(env), {
    build: {
      lib: {
        fileName: (ext) => `app.${ext}`,
        entry: "./app.ts",
        formats: ["cjs"],
      },
      rollupOptions: {
        external: /..\/..\/..\/plugins/,
      },
      outDir: "../../build",
    },
    resolve: {
      alias: { "./lib-cov/fluent-ffmpeg": "./lib/fluent-ffmpeg" },
    },
  }),
);
