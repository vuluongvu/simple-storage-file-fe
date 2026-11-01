/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e5edff',
          500: '#0061fe',
          600: '#0052d4',
          700: '#0043ad',
        },
        sidebar: '#f7f5f2',
        brownblack: {
          DEFAULT: '#231d19',
          50: '#fbf9f8',
          100: '#f5f2ef',
          200: '#e8e2dc',
          300: '#d2c6bd',
          400: '#a8978c',
          500: '#847165',
          600: '#67564d',
          700: '#4e413a',
          800: '#352b26',
          900: '#231d19',
          950: '#171210',
        },
      },
    },
  },
  plugins: [],
}
