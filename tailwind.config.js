/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: '#0B1957',
        rose: '#E2C3C9',
      },
      letterSpacing: {
        vega: '0.75rem',
      },
    },
  },
  plugins: [],
};
