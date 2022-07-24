const resolve = (path) => require("path").resolve(__dirname, path);

module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-nested": {},
    tailwindcss: {
      config: resolve("tailwind.config.cjs"),
    },
    autoprefixer: {},
    cssnano: {},
  },
};
