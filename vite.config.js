import { nodeResolve } from "@rollup/plugin-node-resolve";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

const addon = {
  node: { ...nodeResolve(), enforce: "pre" },
  svelte: sveltekit(),
};

export default defineConfig(({ mode }) => ({
  plugins: [addon[mode]],
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
