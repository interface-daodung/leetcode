/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        primary: "var(--color-primary)",
        "primary-fg": "var(--color-primary-fg)",
        card: "var(--color-card)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};
