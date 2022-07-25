import resolve from "@rollup/plugin-node-resolve";
import { name } from "./package.json";
import { defineConfig } from "vite";

// You might change this location to suit your project
const dest = "../../build/plugins";

const config = defineConfig({
  plugins: [{ ...resolve(), enforce: "pre" }],
  // We want to include sdk from the app itself in runtime
  define: {
    'import { register } from "@amadeus/core";':
      'const { register } = require("../app.cjs")',
  },
  build: {
    outDir: dest,
    lib: {
      formats: ["cjs"],
      entry: "./plugin.ts",
      fileName: (ext) => `${name.split("-").pop()}.${ext}`,
    },
  },
});

export default config;
