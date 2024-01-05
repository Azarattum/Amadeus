import externals from "rollup-plugin-node-externals";
import { defineConfig } from "vite";

export default defineConfig((env) => ({
  plugins:
    env.mode !== "test"
      ? [{ ...externals({ deps: false }), enforce: "pre" }]
      : [],
  define: { "import.meta.env.SSR": false },
  resolve: {
    conditions: ["import", "module", "node", "default"],
    browserField: false,
  },
  test: {
    exclude: ["node_modules", "build", ".svelte-kit"],
    coverage: {
      reporter: ["lcovonly", "text"],
    },
  },
}));
