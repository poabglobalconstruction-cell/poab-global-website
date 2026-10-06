import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        poab: {
          navy: {
            DEFAULT: "#071B2D",
            deep: "#04101B",
            surface: "#0D2942",
            muted: "#133757",
          },
          gold: {
            DEFAULT: "#C89B3C",
            light: "#DFC077",
            dark: "#A37B24",
            subtle: "#F5ECD7",
          },
          stone: {
            DEFAULT: "#F3F0E9",
            light: "#FAF8F5",
            dark: "#E5E1D8",
          },
          charcoal: {
            DEFAULT: "#20252A",
            light: "#353D45",
          },
          grey: {
            DEFAULT: "#E7E8E6",
            border: "#D6D8D5",
          },
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        heading: [
          "var(--font-cinzel)",
          "Georgia",
          "serif",
        ],
      },
      maxWidth: {
        "7xl": "80rem",
      },
    },
  },
  plugins: [],
};

export default config;
