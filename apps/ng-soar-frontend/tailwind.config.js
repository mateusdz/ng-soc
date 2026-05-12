/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        signal: "#0b7285",
        cobalt: "#1d4ed8",
        surface: "#f7f9fc"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(18, 29, 43, 0.08)"
      }
    }
  },
  plugins: []
};
