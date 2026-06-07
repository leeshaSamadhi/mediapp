/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#529917',
        'primary-light': '#E5F9CE',
        'primary-dark': '#254907',
        'primary-accent': '#325B10',
      },
    },
  },
  plugins: [],
}