/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          DEFAULT: "#7C3AED",
          mid: "#C4B5FD",
          light: "#EDE9FE",
        },
        mint: {
          DEFAULT: "#059669",
          mid: "#6EE7B7",
          light: "#D1FAE5",
        },
        salmon: {
          DEFAULT: "#DC2626",
          mid: "#FCA5A5",
          light: "#FEE2E2",
        },
        blue: {
          DEFAULT: "#2563EB",
          mid: "#93C5FD",
          light: "#DBEAFE",
        },
        amber: {
          DEFAULT: "#D97706",
          mid: "#FCD34D",
          light: "#FEF3C7",
        },
        text: {
          dark: "#1E1B4B",
          mid: "#6B7280",
          light: "#9CA3AF",
        },
        bg: "#F5F3FF",
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '22px',
      }
    },
  },
  plugins: [],
};
