module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "prettier",
    "eslint:recommended",
    "plugin:svelte/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:perfectionist/recommended-line-length",
  ],
  plugins: ["eslint-plugin-svelte", "@typescript-eslint", "perfectionist"],
  ignorePatterns: ["*.cjs"],
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    extraFileExtensions: [".svelte"],
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  rules: {
    "no-var": "error",
    "no-undef": "off",
    "no-empty": "off",
    "require-yield": "off",
    "svelte/no-at-html-tags": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^\\$\\$(Props|Events|Slots)$",
      },
    ],
    "spaced-comment": ["warn", "always", { markers: ["/"] }],
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          Function: false,
        },
      },
    ],
    "perfectionist/sort-imports": [
      "error",
      {
        "newlines-between": "never",
        type: "line-length",
        order: "desc",
      },
    ],
    "perfectionist/sort-objects": [
      "error",
      {
        "partition-by-comment": true,
        type: "line-length",
        order: "desc",
      },
    ],
    "perfectionist/sort-object-types": [
      "error",
      {
        "custom-groups": { accessor: "+(get|set) *", method: "*(*):*" },
        groups: ["unknown", "method", "accessor"],
        type: "line-length",
        order: "desc",
      },
    ],
    "perfectionist/sort-union-types": [
      "error",
      {
        "nullable-last": true,
        type: "line-length",
        order: "desc",
      },
    ],
    "perfectionist/sort-svelte-attributes": [
      "error",
      {
        groups: [
          "this",
          "preposition",
          "shorthand",
          ["svelte-shorthand", "unknown"],
          "directives",
        ],
        "custom-groups": {
          preposition: "+(at|of|as|to|for|from)",
          directives: "*:*",
          this: "*this",
        },
        type: "line-length",
        order: "desc",
      },
    ],
    "perfectionist/sort-enums": "off",
  },
  globals: { $$Generic: "readable" },
};
