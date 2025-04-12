/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'teal': '#13bbaf',
        'dark-teal': '#003333',
        'highlight': '#F7FF59',
      },
      fontFamily: {
        sans: ['Cash Sans', 'system-ui', 'sans-serif'],
        mono: ['Cash Sans Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} 