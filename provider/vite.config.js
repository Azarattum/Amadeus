import { copy } from "vite-plugin-copy";
import base from "../vite.config.js";
import { mergeConfig } from "vite";

const dest = "../build";
const data = copy([{ src: "config", dest }]);

export default mergeConfig(base, {
  plugins: [data],
  build: {
    outDir: dest,
    lib: {
      formats: ["cjs"],
      entry: "./app.ts",
      fileName: (ext) => `app.${ext}`,
    },
  },
});
