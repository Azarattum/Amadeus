import { sveltekit } from "@sveltejs/kit/vite";
import svgToFont from "vite-svg-2-webfont";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    sveltekit(),
    svgToFont({
      cssTemplate: resolve(__dirname, "packages/ui/icons/+icons.css.hbs"),
      htmlTemplate: resolve(__dirname, "packages/ui/icons/+icons.ts.hbs"),
      htmlDest: resolve(__dirname, "packages/ui/icons/index.ts"),
      context: resolve(__dirname, "packages/ui/icons"),
      generateFiles: "html",
      moduleId: "icons.css",
      fontName: "icons",
      types: "woff2",
      inline: true,
    }),
  ],
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
});
