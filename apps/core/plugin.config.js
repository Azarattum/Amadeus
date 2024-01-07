import externals from "rollup-plugin-node-externals";
import { readFileSync, existsSync } from "node:fs";
import replace from "@rollup/plugin-replace";
import copy from "rollup-plugin-copy";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const identifier = JSON.parse(readFileSync(resolve("./package.json"))).name;
const name = identifier.replace(/(@(\w|-)*\/)|((\w|-)*-)/g, "");
const monorepo = existsSync(resolve("../../package.json"));
const build = monorepo ? "../../build/plugins" : "./build";

export default defineConfig({
  plugins: [
    { ...externals({ deps: false }), enforce: "pre" },
    replace({
      "import.meta.url": '"file://"+__filename',
      preventAssignment: true,
    }),
    copy({
      targets: [
        {
          dest: resolve(build, name),
          src: "./assets/*",
        },
      ],
    }),
  ],
  resolve: {
    alias: [
      {
        customResolver: (id) => ({ external: "relative", id }),
        find: "@amadeus-music/core",
        replacement: "../app.cjs",
      },
    ],
    conditions: ["import", "module", "node", "default"],
    mainFields: ["module", "jsnext:main", "jsnext"]
  },
  build: {
    lib: {
      fileName: (ext) => `${name}.${ext}`,
      entry: "./index.ts",
      formats: ["cjs"],
    },
    commonjsOptions: {
      ignoreDynamicRequires: true,
    },
    emptyOutDir: monorepo ? false : true,
    outDir: build, 
  },
});
