module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        128: "28rem",
      },
    },
  },
  plugins: [require("daisyui"), require("tailwind-scrollbar")],
};
