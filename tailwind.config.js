const daisyuiColorObj = require("daisyui/src/theming/index");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    ...[...Array(101).keys()].flatMap((index) => [
      `group-hover:scale-[${index * 10}%]`,
      `group-hover:scale-[${index * 10}%]`,
    ]),
  ],
  prefix: "",
  theme: {
    extend: {
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      spacing: {
        128: "28rem",
      },
      colors: {
        border: daisyuiColorObj["primary"],
        input: daisyuiColorObj["base-content"],
        ring: daisyuiColorObj["base-content"],
        background: daisyuiColorObj["base-100"],
        foreground: daisyuiColorObj["base-content"],
        primary: {
          DEFAULT: daisyuiColorObj["primary"],
          foreground: daisyuiColorObj["primary-content"],
        },
        secondary: {
          DEFAULT: daisyuiColorObj["secondary"],
          foreground: daisyuiColorObj["secondary-content"],
        },
        destructive: {
          DEFAULT: daisyuiColorObj["error"],
          foreground: daisyuiColorObj["error-content"],
        },
        muted: {
          DEFAULT: daisyuiColorObj["base-300"],
          foreground: daisyuiColorObj["base-content"],
        },
        accent: {
          DEFAULT: daisyuiColorObj["accent"],
          foreground: daisyuiColorObj["accent-content"],
        },
        popover: {
          DEFAULT: daisyuiColorObj["base-100"],
          foreground: daisyuiColorObj["base-content"],
        },
        card: {
          DEFAULT: daisyuiColorObj["base-100"],
          foreground: daisyuiColorObj["base-content"],
        },
      },
      borderRadius: {
        lg: "var(--rounded-btn)",
        md: "calc(var(--rounded-btn) - 2px)",
        sm: "calc(var(--rounded-btn) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("tailwindcss-animate"),
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

// @layer base {
//   :root {
//     --background: 0 0% 100%;
//     --foreground: 222.2 84% 4.9%;
//     --card: 0 0% 100%;
//     --card-foreground: 222.2 84% 4.9%;
//     --popover: 0 0% 100%;
//     --popover-foreground: 222.2 84% 4.9%;
//     --primary: 222.2 47.4% 11.2%;
//     --primary-foreground: 210 40% 98%;
//     --secondary: 210 40% 96.1%;
//     --secondary-foreground: 222.2 47.4% 11.2%;
//     --muted: 210 40% 96.1%;
//     --muted-foreground: 215.4 16.3% 46.9%;
//     --accent: 210 40% 96.1%;
//     --accent-foreground: 222.2 47.4% 11.2%;
//     --destructive: 0 84.2% 60.2%;
//     --destructive-foreground: 210 40% 98%;
//     --border: 214.3 31.8% 91.4%;
//     --input: 214.3 31.8% 91.4%;
//     --ring: 222.2 84% 4.9%;
//     --radius: 0.5rem;
//   }

//   .dark {
//     --background: 222.2 84% 4.9%;
//     --foreground: 210 40% 98%;
//     --card: 222.2 84% 4.9%;
//     --card-foreground: 210 40% 98%;
//     --popover: 222.2 84% 4.9%;
//     --popover-foreground: 210 40% 98%;
//     --primary: 210 40% 98%;
//     --primary-foreground: 222.2 47.4% 11.2%;
//     --secondary: 217.2 32.6% 17.5%;
//     --secondary-foreground: 210 40% 98%;
//     --muted: 217.2 32.6% 17.5%;
//     --muted-foreground: 215 20.2% 65.1%;
//     --accent: 217.2 32.6% 17.5%;
//     --accent-foreground: 210 40% 98%;
//     --destructive: 0 62.8% 30.6%;
//     --destructive-foreground: 210 40% 98%;
//     --border: 217.2 32.6% 17.5%;
//     --input: 217.2 32.6% 17.5%;
//     --ring: 212.7 26.8% 83.9;
//   }
// }
