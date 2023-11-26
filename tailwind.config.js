module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "group-hover:scale-[100%]",
    "group-hover:scale-[125%]",
    "group-hover:scale-[150%]",
    "group-hover:scale-[175%]",
    "group-hover:scale-[200%]",
  ],
  theme: {
    extend: {
      spacing: {
        128: "28rem",
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("tailwind-scrollbar"),
    require("@tailwindcss/typography"),
  ],
  daisyui: {
    darkTheme: "upscayl",
    themes: [
      {
        upscayl: {
          primary: "#334155",
          secondary: "#4f46e5",
          accent: "#6d28d9",
          neutral: "#475569",
          "base-100": "#1e293b",
          "base-200": "#0f172a",
          "base-300": "#020617",
          "--rounded-btn": "2rem", // border radius rounded-btn utility class, used in buttons and similar element
          "--rounded-badge": "2rem", // border radius rounded-badge utility class, used in badges and similar
          "--animation-btn": "0.5s", // duration of animation when you click on button
          "--animation-input": "0.5s", // duration of animation for inputs like checkbox, toggle, radio, etc
          "--btn-text-case": "uppercase", // set default text transform for buttons
          "--btn-focus-scale": "0.95", // scale transform of button when you focus on it
          "--border-btn": "1px", // border width of buttons
          "--tab-border": "1px", // border width of tabs
          "--tab-radius": "0.5rem", // border radius of tabs
        },
      },
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
  },
};
