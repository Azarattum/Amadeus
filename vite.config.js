import { nodeResolve } from "@rollup/plugin-node-resolve";
import { sveltekit } from "@sveltejs/kit/vite";
import loader from "rollup-plugin-typescript2";
import typescript from "ttypescript";
import { defineConfig } from "vite";

const transformer = { ...loader({ typescript }), enforce: "pre" };
const addon = {
  node: { ...nodeResolve(), enforce: "pre" },
  svelte: sveltekit(),
};

export default defineConfig(({ mode }) => ({
  plugins: [transformer, addon[mode]],
  test: {
    exclude: ["node_modules", "build", ".svelte-kit"],
    coverage: {
      reporter: ["lcovonly", "text"],
    },
  },
  server: {
    fs: { allow: ["."], deny: ["node_modules"] },
  },
}));
