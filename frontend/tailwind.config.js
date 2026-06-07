/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0F14',
        surface: '#111827',
        emerald: { DEFAULT: '#2EE6A6', hover: '#6FFFCF' },
        danger: '#FF5D73',
        border: 'rgba(46,230,166,0.12)',
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}