module.exports = {
  plugins: [
    require("prettier-plugin-tailwindcss"),
    require("prettier-plugin-sort-imports"),
  ],
  overrides: [
    {
      files: "*.svelte",
      options: { parser: "svelte" },
    },
  ],
};
