import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08080a",
        panel: "#0f0f12",
        panel2: "#16161a",
        border: "#232328",
        muted: "#8f8f9a",
        text: "#f5f5f7",
        accent: "#ffffff", // premium: white primary
        accentSoft: "#7aa2ff", // soft blue for links/highlights
        accent2: "#34d399", // success
        warn: "#fbbf24",
        danger: "#f87171",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "Roboto", "sans-serif"],
      },
      borderRadius: { xl: "14px", "2xl": "18px", "3xl": "24px" },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px -12px rgba(0,0,0,0.8)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 40px -20px rgba(0,0,0,0.9)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-up": "fade-up 0.35s ease both" },
    },
  },
  plugins: [],
};

export default config;
