/** @type {import('tailwindcss').Config["theme"]} */
const theme = {
  fontSize: {
    "2xs": [
      "0.625rem",
      { fontWeight: "500", letterSpacing: "0.03em", lineHeight: "1rem" },
    ],
    xs: ["0.8125rem", { lineHeight: "1rem" }],
    sm: ["0.9375rem", { lineHeight: "1.125rem" }],
    md: ["1.0625rem", { lineHeight: "1.3125rem" }],
    lg: ["1.375rem", { lineHeight: "1.55rem", fontWeight: "600" }],
    xl: ["1.5rem", { fontWeight: "600", lineHeight: "1.6875rem" }],
    "2xl": [
      "2.125rem",
      { fontWeight: "700", letterSpacing: "0.01em", lineHeight: "3rem" },
    ],
  },
  extend: {
    screens: {
      tall: { raw: "(min-height: 30rem)" },
    },
    transitionProperty: {
      paint: "transform, opacity, color, background-color",
      composite: "transform, opacity",
    },
    colors: {
      primary: {
        100: "hsl(var(--color-primary-100) / <alpha-value>)",
        200: "hsl(var(--color-primary-200) / <alpha-value>)",
        300: "hsl(var(--color-primary-300) / <alpha-value>)",
        400: "hsl(var(--color-primary-400) / <alpha-value>)",
        500: "hsl(var(--color-primary-500) / <alpha-value>)",
        600: "hsl(var(--color-primary-600) / <alpha-value>)",
        700: "hsl(var(--color-primary-700) / <alpha-value>)",
        800: "hsl(var(--color-primary-800) / <alpha-value>)",
        900: "hsl(var(--color-primary-900) / <alpha-value>)",
      },
      content: {
        DEFAULT: "hsl(var(--color-content) / <alpha-value>)",
        100: "hsl(var(--color-content-100) / <alpha-value>)",
        200: "hsl(var(--color-content-200) / <alpha-value>)",
      },
      highlight: {
        DEFAULT: "hsl(var(--color-highlight))",
        100: "hsl(var(--color-highlight-100))",
        200: "hsl(var(--color-highlight-200))",
      },
      surface: {
        DEFAULT: "hsl(var(--color-surface) / <alpha-value>)",
        100: "hsl(var(--color-surface-100) / <alpha-value>)",
        200: "hsl(var(--color-surface-200))",
        300: "hsl(var(--color-surface-300) / <alpha-value>)",
        highlight: "hsl(var(--color-surface-highlight) / <alpha-value>)",
        "highlight-100":
          "hsl(var(--color-surface-highlight-100) / <alpha-value>)",
        "highlight-200":
          "hsl(var(--color-surface-highlight-200) / <alpha-value>)",
        "highlight-300":
          "hsl(var(--color-surface-highlight-300) / <alpha-value>)",
      },
    },
  },
};

module.exports = theme;
