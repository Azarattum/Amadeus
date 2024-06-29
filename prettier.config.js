export default {
  plugins: [
    "prettier-plugin-svelte",
    "prettier-plugin-tailwindcss",
    "prettier-plugin-sort-imports",
  ],
  overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
  tailwindPreserveWhitespace: true,
};
