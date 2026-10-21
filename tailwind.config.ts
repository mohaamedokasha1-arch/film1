import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        night: {
          950: "rgb(var(--night-950) / <alpha-value>)",
          900: "rgb(var(--night-900) / <alpha-value>)",
          800: "rgb(var(--night-800) / <alpha-value>)",
          700: "rgb(var(--night-700) / <alpha-value>)",
        },
        gold: {
          300: "#F2D98D",
          400: "#E3C264",
          500: "#D4AF37",
          600: "#B8952B",
          700: "#8F721F",
        },
        nile: {
          400: "#E23B4B",
          500: "#C8102E",
          600: "#A00D24",
        },
        ink: {
          50: "#FAF8F2",
          100: "#F0EDE4",
          200: "#D8D4C9",
          300: "#B9B4A8",
          400: "#9A96A6",
          500: "#7B7788",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem", "3xl": "2rem" },
      boxShadow: {
        glow: "0 0 45px -12px rgba(212,175,55,0.55)",
        card: "0 20px 45px -25px rgba(0,0,0,0.9)",
      },
      backgroundImage: {
        "gold-line": "linear-gradient(90deg, transparent, rgba(212,175,55,0.85), transparent)",
        "hero-fade": "linear-gradient(90deg, rgba(7,7,11,0.96) 0%, rgba(7,7,11,0.75) 45%, rgba(7,7,11,0.2) 100%)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up .6s ease both",
        marquee: "marquee 38s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
