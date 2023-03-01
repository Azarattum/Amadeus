import { externals } from "rollup-plugin-node-externals";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [{ ...externals({ deps: false }), enforce: "pre" }],
  test: {
    exclude: ["node_modules", "build", ".svelte-kit"],
    coverage: {
      reporter: ["lcovonly", "text"],
    },
  },
});
