/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#5A5A50',
        'ink-1': '#636359',
        'ink-2': '#6d6d63',
        'ink-3': '#4a4a42',
        'ink-4': '#3e3e37',
        ivory: '#f5f4ee',
        'ivory-dim': '#c7c5bc',
        gold: '#e2d7c0',
        'gold-hi': '#ffffff',
        olive: '#5A5A50',
        'olive-hi': '#ffffff',
        bronze: '#707063'
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        subastas: ['"Copperplate Gothic 29 BC"', '"Copperplate Gothic Bold"', '"Copperplate Gothic"', 'Copperplate', 'serif'],
        insignia: ['Donau', '"Donau Neue"', '"Donau Uppercase Neue"', '"Donau Alte"', '"Donau-Regular"', '"Cormorant Garamond"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
