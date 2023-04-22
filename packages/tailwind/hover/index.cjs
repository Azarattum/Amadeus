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
  addVariant("group-hover", [
    ({ modifySelectors }) => (
      modifySelectors(
        ({ className }) => `.group:hover .group-hover\\:${e(className)}`
      ),
      "@media (hover: hover) and (pointer: fine)"
    ),
    ({ modifySelectors }) => (
      modifySelectors(
        ({ className }) => `.group:active .group-hover\\:${e(className)}`
      ),
      "@media (pointer: coarse)"
    ),
  ]);
});
