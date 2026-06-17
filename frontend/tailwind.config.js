/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        resort: {
          50: '#fdf8f0',
          100: '#f9edda',
          200: '#f2d7b0',
          300: '#e9bc7d',
          400: '#e0a04e',
          500: '#d4882e',
          600: '#b96d23',
          700: '#9a531f',
          800: '#7e4320',
          900: '#68391e',
          950: '#3a1c0d',
        },
      },
      maxWidth: {
        'screen-2xl': '1536px',
        'screen-3xl': '1920px',
      },
    },
  },
  plugins: [],
}
