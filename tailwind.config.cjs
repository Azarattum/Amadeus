const plugin = require("tailwindcss/plugin");
const resolve = (path) => require("path").resolve(__dirname, path);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/routes/**/*.{html,js,svelte,ts}",
    "./packages/ui/lib/**/*.{html,js,svelte,ts}",
    "./packages/ui/demo/**/*.{html,js,svelte,ts}",
    "./packages/ui/stories/**/*.{html,js,svelte,ts}",
  ].map(resolve),
  theme: require("./packages/ui/lib/theme.cjs"),
  darkMode: "custom",
  plugins: [
    require("./packages/tailwind/dark"),
    require("./packages/tailwind/hover"),
  ],
};
