// Ganti data toko ini sebelum website dipublikasikan.
export const STORE = {
  name: 'Dapur Teman',
  tagline: 'Makanan enak, bikin hari lebih hangat.',
  // GANTI dengan nomor WhatsApp toko, format internasional tanpa +, spasi, atau strip.
  whatsappNumber: '6285111345803',
  address: 'Makassar, Sulawesi Selatan',
  // null berarti ongkir belum ditentukan dan perlu dikonfirmasi lewat WhatsApp.
  deliveryFee: null as number | null,
  isOpen: true,
}