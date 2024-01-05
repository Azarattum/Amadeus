import { mergeConfig, defineConfig } from "vite";
import base from "../../vite.node.js";

export default defineConfig((env) =>
  mergeConfig(base(env), {
    build: {
      outDir: "../../build",
      lib: {
        formats: ["cjs"],
        entry: "./app.ts",
        fileName: (ext) => `app.${ext}`,
      },
      rollupOptions: {
        external: /..\/..\/..\/plugins/,
      },
    },
    resolve: {
      alias: { "./lib-cov/fluent-ffmpeg": "./lib/fluent-ffmpeg" },
    },
  }),
);
