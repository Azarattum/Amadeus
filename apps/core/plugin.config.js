import externals from "rollup-plugin-node-externals";
import { existsSync, readFileSync } from "node:fs";
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
