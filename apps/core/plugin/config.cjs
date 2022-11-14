const node = require("@rollup/plugin-node-resolve").default;
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { mergeConfig } = require("vite");

/**
 * Automatic vite configuration for amadeus plugins
 * @param {string | undefined} name Plugin name
 * @param {import("vite").UserConfigExport} config Configuration overrides
 * @returns {import("vite").UserConfigExport} Generated config
 */
function config(name, config = {}) {
  name = name || require(resolve("./package.json")).name;
  // Detect a monorepo setup
  const dest = existsSync(resolve("../../package.json"))
    ? "../../build/plugins"
    : "./build";

  return mergeConfig(
    {
      plugins: [{ ...node(), enforce: "pre" }],
      // We want to include sdk from the app itself in runtime
      define: { '"@amadeus/core"': '"../app.cjs"' },
      build: {
        outDir: dest,
        lib: {
          formats: ["cjs"],
          entry: "./index.ts",
          fileName: (ext) =>
            `${name.replace(/(@(\w|-)*\/)|((\w|-)*-)/g, "")}.${ext}`,
        },
        rollupOptions: {
          external: ["../app.cjs"],
        },
      },
    },
    config
  );
}

module.exports = config;
