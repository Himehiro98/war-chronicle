import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parch: '#f5f0e8',
        'parch-dark': '#e8e0cc',
        'parch-mid': '#ede6d6',
        ink: '#2a2218',
        'ink-mid': '#4a3f30',
        'ink-light': '#7a6e5c',
        rust: '#8b3a1e',
        'rust-light': '#c4623a',
        'rust-pale': '#f0d5c8',
        'teal-dark': '#1a4a42',
        teal: '#2d7a6e',
        'teal-light': '#5aada0',
        'teal-pale': '#d0eae6',
        gold: '#b8860b',
        'gold-light': '#d4a820',
        'gold-pale': '#f5e8c0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
