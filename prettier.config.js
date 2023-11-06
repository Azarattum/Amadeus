export default {
  plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
  overrides: [{ options: { parser: "svelte" }, files: "*.svelte" }],
  tailwindPreserveWhitespace: true,
};
