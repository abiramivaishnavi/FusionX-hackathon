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
        cyber: {
          dark: '#0f0c29',
          purple: '#302b63',
          violet: '#24243e',
          accent: '#b829ff',
          neon: '#00f3ff'
        }
      },
      boxShadow: {
        'neon': '0 0 15px rgba(184, 41, 255, 0.4)',
        'neon-strong': '0 0 30px rgba(184, 41, 255, 0.7)'
      }
    },
  },
  plugins: [],
}
