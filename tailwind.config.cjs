/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './politika-privatnosti.html', './assets/js/**/*.js'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        ink: '#191B18',          // glavni tekst, naslovi, dugmad
        charcoal: '#404040',     // tamne sekcije
        night: '#141513',        // footer
        mist: '#EAEAEA',         // svetle sekcije
        body: '#4E524C',         // tekst citata
        shadow: '#555754',
        midtone: '#9C9F9B',
        forest: '#042E28',       // zeleni akcenat iz teme
        btn: '#292829',          // dugme "Pretraži"
        line: '#F1F1F1',         // ivice booking trake
      },
      fontFamily: {
        display: ['Spinnaker', 'sans-serif'],
        sans: ['Lato', 'sans-serif'],
      },
      maxWidth: { page: '1140px' },
    },
  },
  plugins: [],
};
