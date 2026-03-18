/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Aquí podrías agregar colores personalizados si quieres
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
