export type Category = 'Semua Menu' | 'Makanan Utama' | 'Minuman' | 'Snack' | 'Paket Hemat'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: Exclude<Category, 'Semua Menu'>
  image: string
  badge?: string
  available: boolean
  options?: { label: string; choices: { name: string; extra: number }[] }[]
}

export const categories: Category[] = ['Semua Menu', 'Makanan Utama', 'Paket Hemat', 'Snack', 'Minuman']

export const products: Product[] = [
  {
    id: 'ayam-geprek', name: 'Nasi Ayam Geprek', description: 'Ayam renyah, sambal mantap, dan nasi hangat.', price: 15000,
    category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85',
    badge: 'Best Seller', available: true,
    options: [{ label: 'Level pedas', choices: [{ name: 'Tidak pedas', extra: 0 }, { name: 'Sedang', extra: 0 }, { name: 'Pedas', extra: 0 }, { name: 'Extra pedas', extra: 2000 }] }],
  },
  {
    id: 'ayam-bakar', name: 'Nasi Ayam Bakar', description: 'Ayam bakar berbumbu dengan aroma yang menggoda.', price: 18000,
    category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=900&q=85',
    available: true,
  },
  {
    id: 'mie-goreng', name: 'Mie Goreng Spesial', description: 'Mie gurih dengan sayuran dan topping pilihan.', price: 14000,
    category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=85',
    available: true,
  },
  {
    id: 'kentang', name: 'Kentang Goreng', description: 'Kentang renyah, cocok buat teman santai.', price: 10000,
    category: 'Snack', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',
    available: true,
  },
  {
    id: 'es-teh', name: 'Es Teh Manis', description: 'Teh segar dengan manis yang pas.', price: 5000,
    category: 'Minuman', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85',
    available: true,
  },
  {
    id: 'es-jeruk', name: 'Es Jeruk', description: 'Segarnya jeruk untuk temani makanmu.', price: 7000,
    category: 'Minuman', image: 'https://images.unsplash.com/photo-1513558161293-c7306c1976bc?auto=format&fit=crop&w=900&q=85',
    available: true,
  },
  {
    id: 'paket-hemat', name: 'Paket Ayam Geprek + Es Teh', description: 'Paket lengkap yang lebih hemat.', price: 19000,
    category: 'Paket Hemat', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85',
    badge: 'Paket Hemat', available: true,
  },
]