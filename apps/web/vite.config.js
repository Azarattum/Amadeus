import { mergeConfig, defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import base from "../vite.config.js";

const config = defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: { allow: ["."], deny: ["node_modules"] },
  },
});

export default mergeConfig(base, config);
