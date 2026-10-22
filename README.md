# Dapur Teman — Food Ordering MVP

Website pemesanan makanan berbasis React + Vite + TypeScript + Tailwind CSS. Keranjang disimpan di LocalStorage dan checkout membuat struk WhatsApp tanpa backend/database.

## Menjalankan secara lokal

Pastikan Node.js versi LTS terpasang, lalu jalankan dari folder project:

```bash
npm install
npm run dev
```

Vite akan menampilkan alamat lokal (biasanya `http://localhost:5173`).

## Konfigurasi sebelum dipakai

Buka `src/config.ts`:
- Ganti `name`, `tagline`, `address`, dan `whatsappNumber`.
- `whatsappNumber` wajib berupa nomor WhatsApp toko dengan kode negara, tanpa `+`, spasi, atau strip. Contoh format Indonesia: `62812...`.
- `deliveryFee: null` berarti ongkir belum diketahui dan harus dikonfirmasi penjual. Ubah ke angka Rupiah jika tarif flat sudah ditentukan.
- Ubah `isOpen` jika ingin menampilkan status toko (status ini belum memblokir checkout).

Buka `src/data.ts` untuk mengganti menu, harga, kategori, ketersediaan, variasi, dan URL gambar.

## Build

```bash
npm run build
npm run preview
```

Folder hasil build adalah `dist/`.

## Deploy gratis ke Netlify

1. Push project ke GitHub.
2. Di Netlify, pilih Add new site / Import an existing project.
3. Pilih repository ini.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy.

## Batasan MVP

- Tidak ada backend, database, login, atau dashboard admin.
- Pesanan tidak tersimpan di server. Nomor pesanan hanya dibuat di browser untuk dimasukkan ke struk.
- WhatsApp terbuka dengan pesan terisi; customer tetap perlu menekan tombol kirim.
- Tarif ongkir `null` tidak ditambahkan ke total; struk menyebut total sementara belum termasuk ongkir.
- Metode transfer hanya pilihan informasi; pembayaran tidak diproses otomatis.
- Gambar menu memakai URL Unsplash; ganti dengan foto usaha sendiri sebelum produksi.
