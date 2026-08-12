import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./emails/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        store: {
          bg: "#0D0F14",
          surface: "#161A23",
          border: "#252A35",
          text: "#F0EEE8",
          muted: "#8B8F9E",
          gold: "#F5C842"
        },
        admin: {
          sidebar: "#1A1D23",
          accent: "#2563EB",
          surface: "#F8F9FA"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        display: ["var(--font-syne)"]
      }
    }
  },
  plugins: []
};

export default config;
