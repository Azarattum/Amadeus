const plugin = require("tailwindcss/plugin");

module.exports = plugin.withOptions(
  (id = "light-switch") =>
    ({ addVariant, e }) => {
      addVariant("dark-focus", `:where(#${id}:focus-visible~*) &`);
      addVariant("dark", [
        ({ modifySelectors }) => (
          modifySelectors(
            ({ className }) =>
              `:where(#${id}:not(:checked)~*) .dark\\:${e(className)}`,
          ),
          "@media (prefers-color-scheme: dark)"
        ),
        ({ modifySelectors }) => (
          modifySelectors(
            ({ className }) =>
              `:where(#${id}:checked~*) .dark\\:${e(className)}`,
          ),
          "@media (prefers-color-scheme: light)"
        ),
      ]);
    },
);
