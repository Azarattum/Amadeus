const { externals } = require("rollup-plugin-node-externals");
const replace = require("@rollup/plugin-replace").default;
const copy = require("rollup-plugin-copy");
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { defineConfig } = require("vite");

const identifier = require(resolve("./package.json")).name;
const name = identifier.replace(/(@(\w|-)*\/)|((\w|-)*-)/g, "");
const monorepo = existsSync(resolve("../../package.json"));
const build = monorepo ? "../../build/plugins" : "./build";

module.exports = defineConfig({
  plugins: [
    { ...externals({ deps: false }), enforce: "pre" },
    replace({
      "import.meta.url": '"file://"+__filename',
      preventAssignment: true,
    }),
    copy({
      targets: [
        {
          src: "./assets/*",
          dest: resolve(build, name),
        },
      ],
    }),
  ],
  resolve: {
    conditions: ["import", "module", "node", "default"],
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
    outDir: build,
    lib: {
      formats: ["cjs"],
      entry: "./index.ts",
      fileName: (ext) => `${name}.${ext}`,
    },
    commonjsOptions: {
      ignoreDynamicRequires: true,
    },
  },
});
