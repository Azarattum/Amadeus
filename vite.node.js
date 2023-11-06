import externals from "rollup-plugin-node-externals";
import { defineConfig } from "vite";

export default defineConfig((env) => ({
  test: {
    coverage: {
      reporter: ["lcovonly", "text"],
    },
    exclude: ["node_modules", "build", ".svelte-kit"],
  },
  resolve: {
    conditions: ["import", "module", "node", "default"],
    mainFields: ["module", "jsnext:main", "jsnext"],
  },
  plugins:
    env.mode !== "test"
      ? [{ ...externals({ deps: false }), enforce: "pre" }]
      : [],
  define: { "import.meta.env.SSR": false },
}));
