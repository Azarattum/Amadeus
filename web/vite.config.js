import { mergeConfig, defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import base from "../vite.config.js";

const config = defineConfig({
  plugins: [sveltekit()],
});

export default mergeConfig(base, config);
