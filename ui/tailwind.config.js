/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#131923",
        panelAlt: "#1a2230",
        accent: "#7dd3fc",
        signal: "#38bdf8",
        success: "#4ade80",
        warning: "#f59e0b",
        danger: "#fb7185"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(2, 8, 23, 0.35)"
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

