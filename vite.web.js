import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["lcovonly", "text"],
    },
    exclude: ["node_modules", "build", ".svelte-kit"],
  },
  server: {
    fs: { deny: ["node_modules"], allow: ["."] },
  },
  build: { rollupOptions: { external: ["path", "url"] } },
  ssr: {
    noExternal: "crstore",
  },
  plugins: [sveltekit()],
});
