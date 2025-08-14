/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#161622",
        secondary: {
          DEFAULT: "#FF9C01",
          100: "#FF9001",
          200: "#FF8E01",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
        },
      },
      fontFamily: {
        pthin: ["System", "sans-serif"],
        pextralight: ["System", "sans-serif"],
        plight: ["System", "sans-serif"],
        pregular: ["System", "sans-serif"],
        pmedium: ["System", "sans-serif"],
        psemibold: ["System", "sans-serif"],
        pbold: ["System", "sans-serif"],
        pextrabold: ["System", "sans-serif"],
        pblack: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};

