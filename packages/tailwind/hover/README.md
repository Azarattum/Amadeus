# Mobile Hover Tailwind Plugin
Tailwind plugin to fix hover styles on touch screens.

## Usage

Add `tailwind-mobile-hover` to your plugins in `tailwind.config.cjs`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    require("tailwind-mobile-hover"),
  ],
};
```

Now when you use `hover:` modifier it will work the same on desktop devices, but will become `active:` on touch devices to avoid the hover state being "stuck".