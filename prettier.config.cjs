module.exports = {
  pluginSearchDirs: false,
  plugins: [
    "prettier-plugin-svelte",
    "prettier-plugin-tailwindcss",
    "prettier-plugin-sort-imports",
  ],
  overrides: [
    {
      files: "*.svelte",
      options: { parser: "svelte" },
    },
  ],
};
