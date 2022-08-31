module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["svelte3", "@typescript-eslint"],
  ignorePatterns: ["*.cjs"],
  overrides: [{ files: ["*.svelte"], processor: "svelte3/svelte3" }],
  settings: {
    "svelte3/typescript": () => require("typescript"),
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  rules: {
    "no-var": "error",
    "no-empty": "off",
    "require-yield": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function": "off",
    "spaced-comment": ["warn", "always", { markers: ["/"] }],
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          Function: false,
        },
      },
    ],
  },
};
