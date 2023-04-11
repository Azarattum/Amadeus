# Dark Toggle Tailwind Plugin
Tailwind plugin to make CSS only dark toggles that respect user's preference.

## Usage

Add `tailwind-dark-toggle` to your plugins in `tailwind.config.cjs` and set the `darkMode` option to `custom`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "custom",
  plugins: [
    require("tailwind-dark-toggle"),
  ],
};
```

You can optionally provide your toggle's id (the default is `light-switch`):
```js
require("tailwind-dark-toggle")("my-light-switch"),
```

Then create an input element **at the start** of your page. Optionally you might add `absolute appearance-none` classes to visually hide the input.
```html
<body>
  <input class="absolute appearance-none" id="light-switch" type="checkbox" />
  <!-- You content... -->
</body>
```

Then anywhere on the page you can create `label` elements to toggle dark and light themes.
```html
<label for="light-switch" class="bg-white dark:bg-black" />
```

You use the new dark mode the same way you already do with Tailwind by adding the `dark:` modifier. If you don't touch your input element it will use user's preference to toggle between dark and light themes. Upon activation the current theme is flipped to the other one. 

For example a new user with `prefers-color-scheme: dark` visits your page, the page will appear dark. Then as they click on the light switch, their page becomes light. This works **without any JavaScript**!