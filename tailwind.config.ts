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
            DEFAULT: "#0A1931",
            deep: "#050C18",
            surface: "#102342",
            muted: "#18325C",
          },
          gold: {
            DEFAULT: "#D4AF37",
            light: "#E2C35D",
            dark: "#B89628",
            subtle: "#F7F0D8",
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
