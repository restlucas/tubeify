import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        spotify: "#1db954",
        youtube: "#ff4444",
      },
      keyframes: {
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeInRightToLeft: {
          "0%": {
            opacity: "0",
            transform: "translateX(10%)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        slideDown: "slideDown 0.5s ease-out",
        slideUp: "slideUp 0.5s ease-out",
        fadeInRightToLeft: "fadeInRightToLeft 0.35s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
