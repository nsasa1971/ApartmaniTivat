/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './politika-privatnosti.html', './assets/js/**/*.js', './admin/**/*.{html,js}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        ink: '#12302F',          // glavni tekst, naslovi, dugmad (tamna petrol)
        charcoal: '#1B4F4F',     // tamne sekcije
        night: '#0B2524',        // footer
        mist: '#EEF3EF',         // svetle sekcije
        body: '#4A5A57',         // tekst citata
        shadow: '#4F6360',
        midtone: '#9FB0AB',
        forest: '#145C5C',       // glavna boja logotipa (petrol zelena)
        lemon: '#F6CB1F',        // limun iz logotipa (akcenat)
        btn: '#145C5C',          // dugme "Pretraži"
        line: '#E6EEEA',         // ivice booking trake
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
