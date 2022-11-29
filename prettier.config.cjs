module.exports = {
  pluginSearchDirs: false,
  plugins: [
    require("prettier-plugin-svelte"),
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
