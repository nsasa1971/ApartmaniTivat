// Apartmani – početne vrijednosti (seed u Firestore `apartments` ako ne postoje).
// id mora odgovarati ID-jevima u assets/js/content.js i u firestore.rules.
export const DEFAULT_APARTMENTS = [
  { id: 'olive', naziv: 'Holiday home Olive', kapacitet: 4 },
  { id: 'lavanda', naziv: 'Holiday home Lavanda', kapacitet: 4 },
  { id: 'lemoni', naziv: 'Holiday home Lemoni', kapacitet: 4 },
];

export const SOURCES = {
  booking: { label: 'Booking', letter: 'B', cls: 'bg-midtone text-ink' },
  direct: { label: 'Direktno', letter: 'D', cls: 'bg-[#053133] text-white' },
  other: { label: 'Drugo', letter: 'O', cls: 'bg-charcoal text-white' },
};
