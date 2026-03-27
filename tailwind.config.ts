import { radixThemePreset } from "radix-themes-tw";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        np: {
          background: "#0B0E14",
          surface: "#0B0E14",
          "surface-container": "#161A21",
          "surface-container-low": "#111419",
          "surface-container-high": "#1C2028",
          "surface-container-highest": "#22262F",
          "surface-container-lowest": "#000000",
          primary: "#C19CFF",
          "primary-dim": "#9146FF",
          secondary: "#00E3FD",
          "secondary-dim": "#00B8CC",
          tertiary: "#FF6B99",
          "on-surface": "#ECEDF6",
          "on-surface-variant": "#94A3B8",
          outline: "#45484F",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-15deg)" },
          "50%": { transform: "rotate(15deg)" },
        },
      },
    },
  },
  plugins: [],
  presets: [radixThemePreset],
};
export default config;
