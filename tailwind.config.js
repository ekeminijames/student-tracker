/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Bold uppercase grotesque for headings (matches the flyer)
        display: ['Archivo', 'system-ui', 'sans-serif'],
        // Clean body text
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        emi: {
          black: '#05070b',
          dark: '#0a0f1a',
          navy: '#0d1b2a',
          blue: '#15243a',
        },
      },
    },
  },
  plugins: [],
}
