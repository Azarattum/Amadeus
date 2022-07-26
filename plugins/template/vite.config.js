import resolve from "@rollup/plugin-node-resolve";
import { name } from "./package.json";
import { defineConfig } from "vite";
import { existsSync } from "fs";

// Detect a monorepo setup
const dest = existsSync("../../package.json")
  ? "../../build/plugins"
  : "./build";

const config = defineConfig({
  plugins: [{ ...resolve(), enforce: "pre" }],
  // We want to include sdk from the app itself in runtime
  define: { '"@amadeus/core"': '"../app.cjs"' },
  build: {
    outDir: dest,
    lib: {
      formats: ["cjs"],
      entry: "./index.ts",
      fileName: (ext) => `${name.split("-").pop()}.${ext}`,
    },
    rollupOptions: {
      external: ["../app.cjs"],
    },
  },
});

export default config;
