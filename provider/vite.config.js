import { nodeResolve } from "@rollup/plugin-node-resolve";
import { mergeConfig, defineConfig } from "vite";
import { copy } from "vite-plugin-copy";
import base from "../vite.config.js";

const dest = "../build";

const data = copy([{ src: "config", dest }]);
const resolve = { ...nodeResolve(), enforce: "pre" };

const config = defineConfig({
  plugins: [resolve, data],
  build: {
    outDir: dest,
    lib: {
      formats: ["cjs"],
      entry: "./app.ts",
      fileName: (ext) => `app.${ext}`,
    },
  },
});

export default mergeConfig(base, config);
