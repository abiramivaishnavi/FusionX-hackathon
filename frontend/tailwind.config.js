/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070b0a',
        primary: '#5ed29c',
        cyber: {
          dark: '#070b0a',
          purple: '#0a1210',
          violet: '#070b0a',
          accent: '#5ed29c',
          neon: '#5ed29c'
        },
        codenest: {
          bg: '#070b0a',
          green: '#5ed29c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        instrument: ['"Instrument Serif"', 'serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
        halfre: ['"halfre"', 'sans-serif'],
        grift: ['"Grift"', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(94, 210, 156, 0.4)',
        'neon-strong': '0 0 30px rgba(94, 210, 156, 0.7)'
      }
    },
  },
  plugins: [],
}
