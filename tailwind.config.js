/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F4D3A',
        secondary: '#3F7658',
        tertiary: '#A9C5AE',
        background: '#F7F8F3',
        surface: '#FFFFFF',
        textPrimary: '#26352C',
        textSecondary: '#7C8980',
        border: '#E5EBE5',
        success: '#4C9A69',
        warning: '#D99B42',
        error: '#C65A4D'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}