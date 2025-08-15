/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        handwritten: ['"Gloria Hallelujah"', "cursive"],
        handwritten2: ['"Shadows Into Light"', "cursive"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        cream: "#FFF9ED",
        pastelYellow: "#FFF6BF",
        pastelBlue: "#DDEBFF",
        pastelGreen: "#DFF7E6",
      },
      boxShadow: { soft: "0 10px 25px rgba(0,0,0,0.06)" },
      borderRadius: { mega: "1.25rem" },
    },
  },
  plugins: [],
};
