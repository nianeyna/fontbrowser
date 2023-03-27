/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,tsx}"],
  theme: {
    extend: {
      colors: {
        'nia-body': '#13424D',
        'nia-text': '#FFFFFF',
        'nia-primary': '#103740',
        'nia-accent': '#FF8C00'
      }
    },
  },
  plugins: []
}
