import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#04070D",
          elev: "#0A0E17",
          card: "#0F1626",
          input: "#141B2D",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          dim: "#A8B3C7",
          mute: "#5A6785",
        },
        cyber: {
          cyan: "#00E5FF",
          "cyan-dim": "#00B8D4",
          violet: "#7C4DFF",
          magenta: "#FF00C8",
          green: "#3CFFB4",
        },
        line: {
          DEFAULT: "#1A2340",
          bright: "#233056",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(ellipse at center top, rgba(0,229,255,0.12), transparent 60%)",
        "grid-cyber":
          "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)",
      },
      animation: {
        "spin-slow": "spin 18s linear infinite",
        "pulse-cyber": "pulse-cyber 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        "pulse-cyber": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 22px rgba(0,229,255,0.55)",
          },
          "50%": {
            opacity: "0.85",
            boxShadow: "0 0 44px rgba(0,229,255,0.85)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
