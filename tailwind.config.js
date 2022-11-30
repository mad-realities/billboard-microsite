// Created based on instructions from https://tailwindcss.com/docs/guides/nextjs.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        my_bg_image: "url('../../public/space.png')",
      },
      colors: {
        "mr-black": "#000000",
        "mr-navy": "#090037",
        "mr-sky-blue": "#00B9F1",
        "mr-lime": "#4EC800",
        "mr-yellow": "#F8D84A",
        "mr-white": "#FFFFFF",
        "mr-lilac": "#D99BFF",
        "mr-pink": "#FB6DF0",
        "mr-hot-pink": "#FF1F8C",
        "mr-orange": "#FF994B",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
