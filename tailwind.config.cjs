/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './politika-privatnosti.html', './assets/js/**/*.js', './admin/**/*.{html,js}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        ink: '#1F2F25',          // glavni tekst, naslovi, dugmad (tamnozelena)
        charcoal: '#34493A',     // tamne sekcije
        night: '#16221A',        // footer
        mist: '#F4EFE2',         // svetle sekcije
        body: '#4F5A50',         // tekst citata
        shadow: '#566057',
        midtone: '#A5AD9F',
        forest: '#34493A',       // glavna boja logotipa (tamnozelena)
        lemon: '#F4CC4C',        // limun iz logotipa (akcenat)
        lavender: '#A58FB5',     // lavanda iz logotipa (akcenat)
        btn: '#34493A',          // dugme "Pretraži"
        line: '#ECE6D6',         // ivice booking trake
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
