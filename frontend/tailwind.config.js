/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#090A0D",
        charcoal: "#14161C",
        ivory: "#F8F5EF",
        champagne: "#D8B866",
        antique: "#B58A3B"
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        gold: "0 24px 70px rgba(216, 184, 102, 0.18)"
      }
    }
  },
  plugins: []
};
