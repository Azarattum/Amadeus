const node = require("@rollup/plugin-node-resolve").default;
const replace = require("@rollup/plugin-replace").default;
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { defineConfig } = require("vite");

const name = require(resolve("./package.json")).name;
const monorepo = existsSync(resolve("../../package.json"));

module.exports = defineConfig({
  plugins: [
    { ...node({ preferBuiltins: true }), enforce: "pre" },
    replace({
      "process.env.NODE_ENV": '"production"',
      preventAssignment: true,
    }),
  ],
  resolve: {
    alias: [
      {
        find: "@amadeus-music/core",
        replacement: "../app.cjs",
        customResolver: (id) => ({ external: "relative", id }),
      },
    ],
  },
  build: {
    emptyOutDir: monorepo ? false : true,
    outDir: monorepo ? "../../build/plugins" : "./build",
    lib: {
      formats: ["cjs"],
      entry: "./index.ts",
      fileName: (ext) =>
        `${name.replace(/(@(\w|-)*\/)|((\w|-)*-)/g, "")}.${ext}`,
    },
  },
});
