/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#0f1114",
        surface: "#181c21",
        card:    "#1e2329",
        border:  "#2a3040",
        border2: "#363f50",
        yellow:  "#f5c518",
        orange:  "#e07b39",
        green:   "#3db882",
        red:     "#e05050",
        blue:    "#4a90d9",
        muted:   "#7a8499",
      },
      fontFamily: {
        head: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Barlow'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

