import { nodeResolve } from "@rollup/plugin-node-resolve";
import loader from "rollup-plugin-typescript2";
import typescript from "ttypescript";
import { defineConfig } from "vite";

const transformer = { ...loader({ typescript }), enforce: "pre" };
const resolve = { ...nodeResolve(), enforce: "pre" };

export default defineConfig({
  plugins: [transformer, resolve],
});
