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
        canvas: {
          DEFAULT: "#F6EFE4", // cream page
          muted: "#EDE3D3",
          card: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#2A2521", // near-black charcoal
          soft: "#5A5149",
          muted: "#8A7F73",
        },
        brand: {
          DEFAULT: "#D9884A", // terracotta / orange accent
          soft: "#E7A876",
          dark: "#B96C34",
        },
        // Score bands: منخفض / متوسط / عالية / مرضية شديدة
        band: {
          low: "#F3D9BE",
          mid: "#E7A876",
          high: "#D9772F",
          severe: "#5E3418",
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
