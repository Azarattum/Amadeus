import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  build: { rollupOptions: { external: ["path"] } },
  test: {
    exclude: ["node_modules", "build", ".svelte-kit"],
    coverage: {
      reporter: ["lcovonly", "text"],
    },
  },
  server: {
    fs: { allow: ["."], deny: ["node_modules"] },
  },
});
