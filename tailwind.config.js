/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Serif éditorial de l'univers Fiche Logement (`font-serif`). Piles système
      // uniquement : aucune requête de police en plus, et c'est exactement le rendu
      // de la maquette de référence, qui compose elle-même en Georgia.
      // Aucun écran n'utilisait `font-serif` avant : ce réglage n'affecte que les
      // pages de cet univers.
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
