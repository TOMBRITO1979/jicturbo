/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Chatwoot color scheme
        primary: {
          50: '#e6f3fc',
          100: '#c0e1f8',
          200: '#99cef4',
          300: '#73bbf0',
          400: '#4ca8ec',
          500: '#2695e8',
          600: '#1f7ce8', // Main Chatwoot color
          700: '#1a6bcc',
          800: '#1559b0',
          900: '#104894',
        },
      },
    },
  },
  plugins: [],
}
