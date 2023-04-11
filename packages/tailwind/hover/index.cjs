const plugin = require("tailwindcss/plugin");

module.exports = plugin(({ addVariant, e }) => {
  addVariant("hover", [
    ({ modifySelectors }) => (
      modifySelectors(({ className }) => `.hover\\:${e(className)}:hover`),
      "@media (hover: hover) and (pointer: fine)"
    ),
    ({ modifySelectors }) => (
      modifySelectors(({ className }) => `.hover\\:${e(className)}:active`),
      "@media (pointer: coarse)"
    ),
  ]);
});
