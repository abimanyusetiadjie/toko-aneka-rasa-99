/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./main.js",
  ],
  theme: {
    extend: {
      colors: {
        'pos-bg': '#0f172a',     // slate-900
        'pos-panel': '#1e293b',  // slate-800
        'pos-accent': '#3b82f6', // blue-500
      }
    },
  },
  plugins: [],
}
