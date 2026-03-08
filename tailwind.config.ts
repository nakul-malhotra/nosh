/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0C0A08",
          50: "#161210",
          100: "#1E1A16",
          200: "#28221C",
          300: "#332C24",
          400: "#3E362C",
        },
        honey: {
          50: "#FFF9EF",
          100: "#FFEFD0",
          200: "#FFDDA0",
          300: "#F5C56A",
          400: "#D4A054",
          500: "#B8872E",
          600: "#9A6E1C",
          700: "#7A5614",
          800: "#5C400F",
          900: "#3D2B0A",
        },
        ember: {
          50: "#FFF2ED",
          100: "#FFE0D4",
          200: "#FFC0A8",
          300: "#FF9870",
          400: "#E8663C",
          500: "#CC4E28",
          600: "#A63D1E",
          700: "#7F2E17",
          800: "#5F2111",
          900: "#40160B",
        },
        herb: {
          50: "#EDFCF4",
          100: "#D5F5E4",
          200: "#ADE9CF",
          300: "#6ECBA0",
          400: "#3FB07E",
          500: "#1F9464",
          600: "#147750",
          700: "#105E40",
          800: "#0D4A33",
          900: "#0A3728",
        },
        cream: {
          DEFAULT: "#F2EBE1",
          muted: "#8A7E72",
          faint: "#4A433C",
          ghost: "#2A2420",
        },
      },
      fontFamily: {
        display: ['"Syne"', "system-ui", "sans-serif"],
        body: ['"Outfit"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
      },
      boxShadow: {
        "glow-honey": "0 0 30px -4px rgba(212, 160, 84, 0.3)",
        "glow-ember": "0 0 30px -4px rgba(232, 102, 60, 0.3)",
        "glow-herb": "0 0 24px -4px rgba(110, 203, 160, 0.3)",
        "glow-honey-lg": "0 0 60px -8px rgba(212, 160, 84, 0.35)",
        "card": "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
        "card-up": "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        "nav": "0 -8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        "inner": "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      animation: {
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "slide-up": "slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fadeIn 0.5s ease-out",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "spin-slow": "spin 4s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
