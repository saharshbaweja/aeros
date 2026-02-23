import type { Config } from "tailwindcss";

const config: Config = {
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
        accent: {
          DEFAULT: "#22D3EE",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        surface: {
          DEFAULT: "#09090B",
          50: "#18181B",
          100: "#1C1C22",
          200: "#27272A",
          300: "#3F3F46",
          400: "#52525B",
          500: "#71717A",
        },
        emerald: {
          DEFAULT: "#34D399",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        amber: {
          DEFAULT: "#FBBF24",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        rose: {
          DEFAULT: "#FB7185",
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
        sky: {
          DEFAULT: "#38BDF8",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          400: "#22D3EE",
          500: "#06B6D4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: ["2rem", { lineHeight: "1.1", fontWeight: "700" }],
        heading: ["1.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        subheading: ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
      },
      animation: {
        "slide-in": "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out": "slideOut 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.2s ease-out",
        "fade-out": "fadeOut 0.15s ease-in",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-gentle": "pulseGentle 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
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
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
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
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.15)" },
          "100%": { boxShadow: "0 0 40px rgba(99, 102, 241, 0.3)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 50%, rgba(34,211,238,0.08) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
