const resolve = (path) => require("path").resolve(__dirname, path);

module.exports = {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": {},
    tailwindcss: { config: resolve("tailwind.config.cjs") },
    autoprefixer: {},
    cssnano: {},
  },
};
