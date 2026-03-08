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
        parchment: { DEFAULT: "#FFFBF5", deep: "#F7F3ED", warm: "#FFF5E9" },
        ink: { DEFAULT: "#1A1A2E", soft: "#6B6B80", muted: "#A8A8B8", ghost: "#D4D4DC" },
        coral: { 50: "#FFF1F0", 100: "#FFE0DD", 200: "#FFC2BD", 300: "#FF9B93", 400: "#FF6B6B", 500: "#F04848", 600: "#D43030" },
        peach: { 50: "#FFF6ED", 100: "#FFECD8", 200: "#FFD5AD", 300: "#FFBE76", 400: "#FFA94D", 500: "#F08C28" },
        teal: { 50: "#EDFCF9", 100: "#D0F5EE", 200: "#A5EAD9", 300: "#6BD4BF", 400: "#20B2AA", 500: "#0E9F96", 600: "#0A7F78" },
        violet: { 50: "#F5F2FF", 100: "#EBE5FF", 200: "#D4C8FF", 300: "#B8A4FF", 400: "#7C5CFC", 500: "#6344E0" },
      },
      fontFamily: {
        display: ['"Gabarito"', "system-ui", "sans-serif"],
        body: ['"Urbanist"', "system-ui", "sans-serif"],
      },
      borderRadius: { "2xl": "16px", "3xl": "22px", "4xl": "28px" },
      boxShadow: {
        "soft": "0 4px 24px -2px rgba(26,26,46,0.06)",
        "soft-lg": "0 8px 40px -4px rgba(26,26,46,0.08)",
        "soft-xl": "0 16px 60px -8px rgba(26,26,46,0.12)",
        "glow": "0 8px 40px -4px rgba(255,107,107,0.25)",
        "glow-lg": "0 12px 60px -8px rgba(255,107,107,0.35)",
        "glow-teal": "0 8px 40px -4px rgba(32,178,170,0.25)",
        "glow-violet": "0 8px 40px -4px rgba(124,92,252,0.2)",
        "nav": "0 -4px 30px -2px rgba(26,26,46,0.06)",
        "inner": "inset 0 2px 4px rgba(26,26,46,0.04)",
      },
      animation: {
        "float": "float 5s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "slide-up": "slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fadeIn 0.5s ease-out",
        "blob": "blob 8s ease-in-out infinite",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        pulseSoft: { "0%,100%": { transform: "scale(1)", opacity: "1" }, "50%": { transform: "scale(1.06)", opacity: "0.7" } },
        slideUp: { "0%": { transform: "translateY(24px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        blob: {
          "0%,100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", transform: "rotate(0deg)" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%", transform: "rotate(180deg)" },
        },
      },
    },
  },
  plugins: [],
};
