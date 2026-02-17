import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6366F1",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          400: "#22D3EE",
          500: "#06B6D4",
        },
        emerald: {
          DEFAULT: "#10B981",
          400: "#34D399",
          500: "#10B981",
        },
        amber: {
          DEFAULT: "#F59E0B",
          400: "#FBBF24",
          500: "#F59E0B",
        },
        rose: {
          DEFAULT: "#F43F5E",
          400: "#FB7185",
          500: "#F43F5E",
        },
        surface: {
          DEFAULT: "#111111",
          50: "#fafafa",
          100: "#1a1a1a",
          200: "#222222",
          300: "#2a2a2a",
          400: "#333333",
          500: "#444444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        "heading": ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
        "subheading": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body": ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        "small": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
      },
      animation: {
        "slide-in": "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out": "slideOut 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.2s ease-out",
        "fade-out": "fadeOut 0.15s ease-in",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-gentle": "pulseGentle 2s ease-in-out infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOut: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
