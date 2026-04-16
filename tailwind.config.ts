import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fairy: {
          purple: "#c084fc",
          "purple-dark": "#9333ea",
          rose: "#f472b6",
          "rose-dark": "#ec4899",
          lavender: "#e9d5ff",
          dark: "#0d0618",
          "dark-2": "#150d28",
          "dark-3": "#1e1040",
          glass: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.12)",
          text: "#e2d9f3",
          "text-muted": "#9d8ec0",
        },
        mood: {
          happy: "#fbbf24",
          sad: "#60a5fa",
          calm: "#34d399",
          angry: "#f87171",
          dreamy: "#a78bfa",
          romantic: "#f472b6",
          neutral: "#9ca3af",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "fairy-gradient": "linear-gradient(135deg, #1a0533 0%, #0d0618 50%, #130d30 100%)",
        "fairy-card": "linear-gradient(135deg, rgba(192,132,252,0.1), rgba(244,114,182,0.08))",
        "fairy-button": "linear-gradient(135deg, #c084fc, #f472b6)",
        "fairy-glow": "radial-gradient(ellipse at center, rgba(192,132,252,0.15) 0%, transparent 70%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "glow": "glow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(192,132,252,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(192,132,252,0.6)" },
        },
      },
      boxShadow: {
        "fairy": "0 0 40px rgba(192,132,252,0.2)",
        "fairy-lg": "0 0 80px rgba(192,132,252,0.3)",
        "glass": "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glass-hover": "0 12px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        "button": "0 4px 20px rgba(192,132,252,0.4)",
        "button-hover": "0 6px 30px rgba(192,132,252,0.6)",
      },
      backdropBlur: {
        "xs": "4px",
      },
    },
  },
  plugins: [],
};

export default config;
