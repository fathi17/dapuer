import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, ChefHat, Flame,
  Heart, Minus, Plus, Search, ShoppingBag, ShoppingCart, SlidersHorizontal,
  Sparkles, Trash2, Utensils, X, MessageCircle, MapPin, Bike, Store, CreditCard,
} from 'lucide-react'
import { categories, products, type Category, type Product } from './data'
import { STORE } from './config'

type CartItem = {
  key: string
  productId: string
  quantity: number
  optionName?: string
  optionExtra: number
  note: string
}
type OrderForm = {
  name: string
  phone: string
  orderType: 'Pickup' | 'Delivery'
  address: string
  schedule: string
  payment: 'Tunai' | 'Transfer Bank'
  note: string
}
const initialForm: OrderForm = { name: '', phone: '', orderType: 'Pickup', address: '', schedule: 'Secepatnya', payment: 'Tunai', note: '' }
const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
const imageFallback = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80'

function App() {
  const [category, setCategory] = useState<Category>('Semua Menu')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('dapur-teman-cart') || '[]') as CartItem[] } catch { return [] }
  })
  const [view, setView] = useState<'menu' | 'cart' | 'checkout'>('menu')
  const [selected, setSelected] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [optionName, setOptionName] = useState('')
  const [itemNote, setItemNote] = useState('')
  const [checkout, setCheckout] = useState<OrderForm>(initialForm)
  const [toast, setToast] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [mobileSearch, setMobileSearch] = useState(false)

  useEffect(() => { localStorage.setItem('dapur-teman-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const filtered = useMemo(() => products.filter(p =>
    (category === 'Semua Menu' || p.category === category) &&
    `${p.name} ${p.description}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [category, query])

  const cartDetails = cart.map(item => {
    const product = products.find(p => p.id === item.productId)!
    return { ...item, product, unitPrice: product.price + item.optionExtra, total: (product.price + item.optionExtra) * item.quantity }
  }).filter(item => item.product)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartDetails.reduce((sum, item) => sum + item.total, 0)
  const deliveryFee = checkout.orderType === 'Delivery' && STORE.deliveryFee !== null ? STORE.deliveryFee : 0
  const total = subtotal + deliveryFee

  const openProduct = (product: Product) => {
    if (!product.available) return
    setSelected(product); setQty(1); setOptionName(product.options?.[0]?.choices[0]?.name || ''); setItemNote('')
  }

  const addToCart = () => {
    if (!selected) return
    const extra = selected.options?.flatMap(o => o.choices).find(c => c.name === optionName)?.extra || 0
    const key = `${selected.id}::${optionName}::${itemNote.trim()}`
    setCart(current => {
      const existing = current.find(i => i.key === key)
      return existing
        ? current.map(i => i.key === key ? { ...i, quantity: i.quantity + qty } : i)
        : [...current, { key, productId: selected.id, quantity: qty, optionName: optionName || undefined, optionExtra: extra, note: itemNote.trim() }]
    })
    setSelected(null); setToast(`${selected.name} ditambahkan ke keranjang`)
  }

  const updateQty = (key: string, delta: number) => setCart(current => current.map(i => i.key === key ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0))
  const removeItem = (key: string) => setCart(current => current.filter(i => i.key !== key))

  const updateForm = <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => setCheckout(current => ({ ...current, [key]: value }))

  const createReceipt = () => {
    const orderId = `DT-${Date.now().toString().slice(-7)}`
    const lines = [
      `🛒 *PESANAN BARU — ${STORE.name.toUpperCase()}*`,
      '',
      'Halo kak! Saya ingin memesan makanan 😊',
      '',
      '━━━━━━━━━━━━━━━━',
      '📋 *INFORMASI PESANAN*',
      `Nomor pesanan: ${orderId}`,
      `Nama: ${checkout.name.trim()}`,
      ...(checkout.phone.trim() ? [`Nomor HP: ${checkout.phone.trim()}`] : []),
      `Jenis pesanan: ${checkout.orderType}`,
      ...(checkout.orderType === 'Delivery' ? [`Alamat: ${checkout.address.trim()}`] : []),
      `Waktu pesanan: ${checkout.schedule}`,
      `Pembayaran: ${checkout.payment}`,
      '',
      '━━━━━━━━━━━━━━━━',
      '🍽️ *DETAIL PESANAN*',
      '',
      ...cartDetails.flatMap((item, index) => [
        `${index + 1}. ${item.product.name}`,
        `   ${item.quantity} x ${rupiah(item.unitPrice)} = ${rupiah(item.total)}`,
        ...(item.optionName ? [`   Variasi: ${item.optionName}`] : []),
        ...(item.note ? [`   Catatan: ${item.note}`] : []),
        '',
      ]),
      '━━━━━━━━━━━━━━━━',
      '💰 *RINGKASAN PEMBAYARAN*',
      `Subtotal: ${rupiah(subtotal)}`,
      ...(checkout.orderType === 'Delivery' ? [`Ongkir: ${STORE.deliveryFee === null ? 'Dikonfirmasi oleh penjual' : rupiah(STORE.deliveryFee)}`] : []),
      ...(checkout.orderType === 'Delivery' && STORE.deliveryFee === null ? [`*TOTAL SEMENTARA: ${rupiah(subtotal)} (belum termasuk ongkir)*`] : [`*TOTAL: ${rupiah(total)}*`]),
      ...(checkout.note.trim() ? ['', `Catatan pesanan: ${checkout.note.trim()}`] : []),
      '',
      '━━━━━━━━━━━━━━━━',
      'Mohon konfirmasi ketersediaan dan total pembayaran pesanan saya ya, kak.',
      'Terima kasih! 🙏',
    ]
    return lines.join('\n')
  }

  const submitOrder = () => {
    if (!checkout.name.trim()) { setToast('Nama pemesan wajib diisi'); return }
    if (checkout.orderType === 'Delivery' && !checkout.address.trim()) { setToast('Alamat delivery wajib diisi'); return }
    if (cartDetails.length === 0) { setToast('Keranjang masih kosong'); setView('menu'); return }
    if (!STORE.whatsappNumber || STORE.whatsappNumber === '6281234567890') {
      setToast('Ganti nomor WhatsApp toko di src/config.ts sebelum digunakan')
      return
    }
    const url = `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(createReceipt())}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="app-shell">
      <div className="announcement"><Sparkles size={14} /> Dibuat dengan hangat, disajikan dengan cinta <span className="announcement-dot">•</span> Pesan mudah via WhatsApp</div>
      <header className="site-header">
        <button className="brand" onClick={() => { setView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Kembali ke beranda">
          <span className="brand-mark"><ChefHat size={25} strokeWidth={2.1} /></span>
          <span className="brand-copy"><strong>{STORE.name}</strong><small>Rasa rumahan, hati senang.</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          <button className={view === 'menu' ? 'nav-link active' : 'nav-link'} onClick={() => setView('menu')}>Menu</button>
          <a className="nav-link" href="#tentang">Tentang Kami</a>
          <a className="nav-link" href="#cara-pesan">Cara Pesan</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-toggle" aria-label="Cari menu" onClick={() => { setMobileSearch(v => !v); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }) }}><Search size={19} /></button>
          <button className="cart-header" onClick={() => setView('cart')}><ShoppingBag size={18} /><span>Keranjang</span>{itemCount > 0 && <b>{itemCount}</b>}</button>
        </div>
      </header>

      {view === 'menu' && <>
        <main>
          <section className="hero container">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-icon"><Utensils size={14} /></span> HANGAT DARI DAPUR KAMI</div>
              <h1>Yang enak-enak,<br /><em>dekat di hati.</em></h1>
              <p>Masakan favorit untuk nemenin harimu. Pilih menu kesukaanmu, kami siapkan dengan sepenuh hati.</p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>Lihat Menu <ArrowRight size={17} /></button>
                <div className="hero-note"><span className="mini-avatars"><i>🍗</i><i>🍜</i><i>🧋</i></span><span><strong>Rasa bikin rindu</strong><small>Setiap hari, setiap suapan</small></span></div>
              </div>
              <div className="hero-perks">
                <span><Check size={15} /> Dibuat fresh</span><span><Check size={15} /> Harga bersahabat</span><span><Check size={15} /> Pesan gampang</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=90" alt="Hidangan makanan segar" onError={e => { e.currentTarget.src = imageFallback }} /></div>
              <div className="hero-sticker"><span>♡</span><strong>Dimasak</strong><small>dengan cinta</small></div>
              <div className="floating-card"><span className="floating-icon"><Flame size={18} /></span><span><strong>Favorit hari ini</strong><small>Nasi Ayam Geprek</small></span><span className="floating-rating">★ 4.9</span></div>
              <span className="hero-spark hero-spark-one">✳</span><span className="hero-spark hero-spark-two">✳</span>
            </div>
          </section>

          <section className="menu-section container" id="menu">
            <div className="section-heading">
              <div><div className="eyebrow">PILIHAN DARI DAPUR</div><h2>Menu yang bikin <em>happy.</em></h2><p>Temukan favoritmu hari ini.</p></div>
              <div className="menu-count"><span className="count-icon"><Utensils size={17} /></span><span><strong>{products.filter(p => p.available).length} menu</strong><small>dibuat sepenuh hati</small></span></div>
            </div>
            <div className="menu-toolbar">
              <div className="category-list" role="tablist" aria-label="Kategori menu">
                {categories.map(c => <button key={c} role="tab" aria-selected={category === c} className={`category-pill ${category === c ? 'selected' : ''}`} onClick={() => setCategory(c)}>{c}</button>)}
              </div>
              <label className={`search-field ${mobileSearch ? 'search-visible' : ''}`}><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari makanan..." aria-label="Cari makanan" /><SlidersHorizontal size={16} className="search-end" /></label>
            </div>
            {filtered.length > 0 ? <div className="product-grid">
              {filtered.map(product => <article className={`product-card ${!product.available ? 'unavailable' : ''}`} key={product.id}>
                <button className="product-image" onClick={() => openProduct(product)} aria-label={`Lihat ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" onError={e => { e.currentTarget.src = imageFallback }} />{product.badge && <span className="product-badge">{product.badge === 'Best Seller' ? <Flame size={12} /> : <Sparkles size={12} />}{product.badge}</span>}{!product.available && <span className="sold-out">Habis</span>}<span className="image-arrow"><ArrowUpRightIcon /></span></button>
                <div className="product-info"><span className="product-category">{product.category}</span><div className="product-title-row"><h3>{product.name}</h3><button className={`favorite-button ${favorites.includes(product.id) ? 'favorited' : ''}`} aria-label={favorites.includes(product.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'} onClick={() => setFavorites(v => v.includes(product.id) ? v.filter(id => id !== product.id) : [...v, product.id])}><Heart size={17} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button></div><p>{product.description}</p><div className="product-bottom"><strong>{rupiah(product.price)}</strong><button className="add-button" disabled={!product.available} onClick={() => openProduct(product)} aria-label={`Tambah ${product.name}`}><Plus size={18} /></button></div></div>
              </article>)}
            </div> : <div className="empty-search"><Search size={28} /><h3>Menu belum ketemu</h3><p>Coba kata kunci lain atau pilih kategori berbeda.</p><button className="button button-outline" onClick={() => { setQuery(''); setCategory('Semua Menu') }}>Reset pencarian</button></div>}
          </section>

          <section className="love-banner container" id="tentang"><div className="love-icon"><Heart size={22} /></div><div><span className="eyebrow">DARI DAPUR, DENGAN HATI</span><h2>Perut kenyang, hati <em>senang.</em></h2><p>Kami percaya makanan enak selalu punya cara untuk bikin hari jadi lebih baik.</p></div><div className="love-decoration">✳</div></section>
          <section className="how-section container" id="cara-pesan"><div className="eyebrow">GAMPANG BANGET</div><h2>Enak itu nggak perlu <em>ribet.</em></h2><div className="steps-grid"><div className="step-card"><span>01</span><div className="step-icon"><ShoppingCart size={22} /></div><h3>Pilih favoritmu</h3><p>Jelajahi menu dan tambahkan ke keranjang.</p></div><div className="step-card"><span>02</span><div className="step-icon"><CreditCard size={22} /></div><h3>Cek pesanan</h3><p>Pastikan menu dan detail pesanan sudah benar.</p></div><div className="step-card"><span>03</span><div className="step-icon"><MessageCircle size={22} /></div><h3>Kirim via WhatsApp</h3><p>Pesanan siap dikonfirmasi langsung ke kami.</p></div></div></section>
        </main>
        <footer className="site-footer"><div className="footer-brand"><span className="brand-mark"><ChefHat size={22} /></span><strong>{STORE.name}</strong></div><p>{STORE.tagline}</p><span>© {new Date().getFullYear()} {STORE.name}. Dibuat dengan ❤️</span></footer>
        {itemCount > 0 && <button className="mobile-cart-bar" onClick={() => setView('cart')}><span className="mobile-cart-icon"><ShoppingBag size={19} /><b>{itemCount}</b></span><span><strong>Lihat Keranjang</strong><small>{itemCount} item dipilih</small></span><strong>{rupiah(subtotal)} <ArrowRight size={17} /></strong></button>}
      </>}

      {view === 'cart' && <main className="flow-page container"><button className="back-link" onClick={() => setView('menu')}><ArrowLeft size={17} /> Kembali ke menu</button><div className="flow-heading"><div className="eyebrow">HAMPIR JADI!</div><h1>Keranjang <em>kamu.</em></h1><p>Periksa lagi pilihan enakmu sebelum lanjut.</p></div>
        {cartDetails.length ? <div className="cart-layout"><div className="cart-items">{cartDetails.map(item => <article className="cart-item" key={item.key}><img src={item.product.image} alt={item.product.name} onError={e => { e.currentTarget.src = imageFallback }} /><div className="cart-item-info"><span className="product-category">{item.product.category}</span><h3>{item.product.name}</h3>{item.optionName && <small>Variasi: {item.optionName}</small>}{item.note && <small>Catatan: {item.note}</small>}<strong>{rupiah(item.unitPrice)}</strong><div className="quantity-control"><button aria-label="Kurangi jumlah" onClick={() => updateQty(item.key, -1)}><Minus size={14} /></button><span>{item.quantity}</span><button aria-label="Tambah jumlah" onClick={() => updateQty(item.key, 1)}><Plus size={14} /></button></div></div><div className="cart-item-end"><strong>{rupiah(item.total)}</strong><button className="remove-button" onClick={() => removeItem(item.key)} aria-label="Hapus item"><Trash2 size={17} /></button></div></article>)}</div><aside className="summary-card"><h2>Ringkasan</h2><div className="summary-line"><span>Subtotal ({itemCount} item)</span><strong>{rupiah(subtotal)}</strong></div><div className="summary-line"><span>Ongkir</span><strong>{checkout.orderType === 'Delivery' && STORE.deliveryFee === null ? 'Konfirmasi' : rupiah(checkout.orderType === 'Delivery' ? deliveryFee : 0)}</strong></div><div className="summary-total"><span>Total {checkout.orderType === 'Delivery' && STORE.deliveryFee === null ? 'sementara' : ''}</span><strong>{rupiah(total)}</strong></div>{checkout.orderType === 'Delivery' && STORE.deliveryFee === null && <p className="summary-note">Ongkir akan dikonfirmasi penjual melalui WhatsApp.</p>}<button className="button button-primary full-button" onClick={() => setView('checkout')}>Lanjut ke Checkout <ArrowRight size={17} /></button><div className="secure-note"><Check size={14} /> Pesanan dikirim melalui WhatsApp</div></aside></div> : <div className="empty-cart"><div className="empty-cart-icon"><ShoppingBag size={32} /></div><h2>Keranjangmu masih kosong</h2><p>Yuk pilih makanan yang bikin kamu happy.</p><button className="button button-primary" onClick={() => setView('menu')}>Jelajahi Menu <ArrowRight size={17} /></button></div>}
      </main>}

      {view === 'checkout' && <main className="flow-page container"><button className="back-link" onClick={() => setView('cart')}><ArrowLeft size={17} /> Kembali ke keranjang</button><div className="flow-heading"><div className="eyebrow">TINGGAL SELANGKAH LAGI</div><h1>Detail <em>pesanan.</em></h1><p>Isi detail berikut agar pesananmu bisa kami siapkan.</p></div>
        <div className="checkout-layout"><form className="checkout-form" onSubmit={e => { e.preventDefault(); submitOrder() }}>
          <section className="form-section"><div className="form-section-heading"><span>01</span><div><h2>Informasi pemesan</h2><p>Biar kami tahu pesanan ini punya siapa.</p></div></div><label className="field-label">Nama lengkap <b>*</b><input value={checkout.name} onChange={e => updateForm('name', e.target.value)} placeholder="Contoh: Andi Pratama" required /></label><label className="field-label">Nomor WhatsApp <small>Opsional</small><input value={checkout.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="Contoh: 081234567890" inputMode="tel" /></label></section>
          <section className="form-section"><div className="form-section-heading"><span>02</span><div><h2>Mau pesan seperti apa?</h2><p>Pilih cara menerima pesananmu.</p></div></div><div className="choice-grid"><button type="button" className={`choice-card ${checkout.orderType === 'Pickup' ? 'choice-active' : ''}`} onClick={() => updateForm('orderType', 'Pickup')}><Store size={21} /><strong>Ambil sendiri</strong><small>Pickup di toko</small>{checkout.orderType === 'Pickup' && <Check className="choice-check" size={16} />}</button><button type="button" className={`choice-card ${checkout.orderType === 'Delivery' ? 'choice-active' : ''}`} onClick={() => updateForm('orderType', 'Delivery')}><Bike size={21} /><strong>Diantar</strong><small>Ke alamatmu</small>{checkout.orderType === 'Delivery' && <Check className="choice-check" size={16} />}</button></div>{checkout.orderType === 'Delivery' && <label className="field-label address-field">Alamat lengkap <b>*</b><textarea value={checkout.address} onChange={e => updateForm('address', e.target.value)} placeholder="Nama jalan, nomor rumah, patokan..." rows={3} required /><span className="field-hint"><MapPin size={13} /> Pastikan alamat dan patokan mudah ditemukan.</span></label>}<label className="field-label">Waktu pesanan<select value={checkout.schedule} onChange={e => updateForm('schedule', e.target.value)}><option>Secepatnya</option><option>Jadwalkan — konfirmasi via WhatsApp</option></select></label></section>
          <section className="form-section"><div className="form-section-heading"><span>03</span><div><h2>Pembayaran</h2><p>Pilih metode yang paling nyaman.</p></div></div><div className="payment-options"><label className={`payment-option ${checkout.payment === 'Tunai' ? 'payment-active' : ''}`}><input type="radio" name="payment" checked={checkout.payment === 'Tunai'} onChange={() => updateForm('payment', 'Tunai')} /><span className="payment-icon">💵</span><span><strong>Tunai</strong><small>Bayar saat menerima pesanan</small></span><span className="radio-dot" /></label><label className={`payment-option ${checkout.payment === 'Transfer Bank' ? 'payment-active' : ''}`}><input type="radio" name="payment" checked={checkout.payment === 'Transfer Bank'} onChange={() => updateForm('payment', 'Transfer Bank')} /><span className="payment-icon">🏦</span><span><strong>Transfer Bank</strong><small>Konfirmasi detail rekening via WhatsApp</small></span><span className="radio-dot" /></label></div><label className="field-label">Catatan untuk penjual <small>Opsional</small><textarea value={checkout.note} onChange={e => updateForm('note', e.target.value)} placeholder="Contoh: tolong jangan terlalu pedas..." rows={3} /></label></section>
          <button type="submit" className="button button-primary full-button checkout-submit"><MessageCircle size={18} /> Buat Pesanan via WhatsApp <ArrowRight size={17} /></button><p className="checkout-disclaimer">WhatsApp akan terbuka dengan pesan pesanan yang sudah disiapkan. Kamu perlu menekan tombol kirim di WhatsApp.</p>
        </form><aside className="summary-card checkout-summary"><h2>Pesanan kamu <span>{itemCount} item</span></h2><div className="checkout-mini-items">{cartDetails.map(item => <div className="checkout-mini-item" key={item.key}><img src={item.product.image} alt="" onError={e => { e.currentTarget.src = imageFallback }} /><div><strong>{item.product.name}</strong><small>{item.quantity} × {rupiah(item.unitPrice)}{item.optionName ? ` · ${item.optionName}` : ''}</small></div><b>{rupiah(item.total)}</b></div>)}</div><div className="summary-line"><span>Subtotal</span><strong>{rupiah(subtotal)}</strong></div><div className="summary-line"><span>Ongkir</span><strong>{checkout.orderType === 'Delivery' && STORE.deliveryFee === null ? 'Konfirmasi' : rupiah(deliveryFee)}</strong></div><div className="summary-total"><span>{checkout.orderType === 'Delivery' && STORE.deliveryFee === null ? 'Total sementara' : 'Total pembayaran'}</span><strong>{rupiah(total)}</strong></div>{checkout.orderType === 'Delivery' && STORE.deliveryFee === null && <p className="summary-note">Belum termasuk ongkir. Penjual akan mengonfirmasi tarif melalui WhatsApp.</p>}<div className="checkout-summary-footer"><Check size={15} /> Kamu bisa cek ulang pesan sebelum dikirim.</div></aside></div>
      </main>}

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null) }}><section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Tutup detail produk"><X size={20} /></button><div className="modal-image"><img src={selected.image} alt={selected.name} onError={e => { e.currentTarget.src = imageFallback }} /></div><div className="modal-content"><span className="product-category">{selected.category}</span><h2 id="modal-title">{selected.name}</h2><p>{selected.description}</p><strong className="modal-price">{rupiah(selected.price)}</strong>{selected.options?.map(option => <fieldset className="option-fieldset" key={option.label}><legend>{option.label}</legend><div className="option-choices">{option.choices.map(choice => <button type="button" key={choice.name} className={`option-chip ${optionName === choice.name ? 'option-selected' : ''}`} onClick={() => setOptionName(choice.name)}>{choice.name}{choice.extra > 0 && <small> +{rupiah(choice.extra)}</small>}</button>)}</div></fieldset>)}<label className="field-label modal-note">Catatan khusus <small>Opsional</small><textarea value={itemNote} onChange={e => setItemNote(e.target.value)} placeholder="Contoh: sambal dipisah" rows={2} /></label><div className="modal-add-row"><div className="quantity-control large"><button onClick={() => setQty(v => Math.max(1, v - 1))} aria-label="Kurangi jumlah"><Minus size={15} /></button><span>{qty}</span><button onClick={() => setQty(v => v + 1)} aria-label="Tambah jumlah"><Plus size={15} /></button></div><button className="button button-primary modal-add" onClick={addToCart}>Tambah · {rupiah((selected.price + (selected.options?.flatMap(o => o.choices).find(c => c.name === optionName)?.extra || 0)) * qty)}</button></div></div></section></div>}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
    </div>
  )
}

function ArrowUpRightIcon() {
  return <ArrowRight size={17} />
}

export default App