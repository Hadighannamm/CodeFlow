/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'off-white': '#f5f5f0',
        'off-white-dark': '#ebe8e3',
        'primary-orange': '#f97316',
        'primary-orange-dark': '#ea580c',
        'primary-orange-light': '#fed7aa',
      },
    },
  },
  plugins: [],
}
