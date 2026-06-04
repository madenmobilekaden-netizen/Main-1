/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#060810",
        surface: "#0a0e1a",
        card:    "#0d1220",
        border:  "#1e2a40",
        border2: "#2a3a55",
        yellow:  "#3d6fab",
        orange:  "#3d6fab",
        green:   "#3db882",
        red:     "#e05050",
        blue:    "#3d6fab",
        muted:   "#6b80a0",
      },
      fontFamily: {
        head: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Barlow'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

