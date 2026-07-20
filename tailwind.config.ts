import type { Config } from "tailwindcss";

// Palette lifted from the Frost Scale (مقياس فروست) booklet:
// warm cream canvas, terracotta/orange accent, deep charcoal ink,
// and a 4-step band ramp (low → severe) that mirrors the PDF's
// score bars.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sampled directly from the booklet.
        canvas: {
          DEFAULT: "#F7F2EC", // cream page
          muted: "#EBE0CE", // Likert header / pill track beige
          card: "#FFFFFF",
        },
        cover: {
          DEFAULT: "#14150F", // near-black cover background
          soft: "#20211A",
        },
        ink: {
          DEFAULT: "#2A2521", // charcoal text
          soft: "#5A5149",
          muted: "#8A7F73",
        },
        brand: {
          DEFAULT: "#DF803E", // orange (title + header pills)
          soft: "#E7A170", // lighter bubble orange
          dark: "#B96C34",
        },
        // Score bands: منخفض / متوسط / عالية / مرضية شديدة
        // Spread across lightness so all four are clearly distinguishable.
        band: {
          low: "#F4DEBE",
          mid: "#EDAF66",
          high: "#CA6316",
          severe: "#542D12",
        },
      },
      fontFamily: {
        sans: ["var(--font-arabic)", "Tajawal", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
