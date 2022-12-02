// Created based on instructions from https://tailwindcss.com/docs/guides/nextjs.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "star-texture": "url('../../public/billboard_starry_small.jpg')",
      },
      fontSize: {
        "2xs": "0.6rem",
      },
      colors: {
        "mr-black": "#000000",
        "mr-navy": "#090037",
        "mr-sky-blue": "#00B9F1",
        "mr-lime": "#4EC800",
        "mr-yellow": "#F8D84A",
        "mr-white": "#FFFFFF",
        "mr-offwhite": "#EAE4CE",
        "mr-lilac": "#D99BFF",
        "mr-pink": "#FB6DF0",
        "mr-hot-pink": "#FF1F8C",
        "mr-orange": "#FF994B",
      },
      fontFamily: {
        sans: ["Londrina Solid"],
        mono: ['"Lilita One"'],
      },
      fontWeight: {
        regular: 500,
        semibold: 700,
        bold: 800,
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
