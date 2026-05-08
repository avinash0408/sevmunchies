'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, Sparkles, Leaf, Award, Truck, Search, ChevronLeft, ChevronRight, Tag, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const CART_KEY = 'sev_cart_v1'

// Transform Cloudinary URLs on-the-fly: w = max width, optimizes format & quality
const cldUrl = (url, w = 600) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  // avoid double-transforming
  if (/\/upload\/(w_|c_|f_|q_|h_)/.test(url)) return url
  return url.replace('/upload/', `/upload/w_${w},c_fill,f_auto,q_auto/`)
}

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState({})
  const [whatsapp, setWhatsapp] = useState('916303520089')
  const [brand, setBrand] = useState('SevMunchies')
  const [search, setSearch] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [heroIdx, setHeroIdx] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(CART_KEY) : null
    if (saved) { try { setCart(JSON.parse(saved)) } catch {} }
    fetch('/api/products').then(r => r.json()).then(d => { setProducts(d || []); setLoading(false) }).catch(() => setLoading(false))
    fetch('/api/settings').then(r => r.json()).then(d => { if (d.whatsapp) setWhatsapp(d.whatsapp); if (d.brand) setBrand(d.brand) })
  }, [])

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(CART_KEY, JSON.stringify(cart)) }, [cart])

  // featured products for hero carousel
  const featured = useMemo(() => {
    const f = products.filter(p => p.featured)
    return f.length > 0 ? f : products.slice(0, 3)
  }, [products])

  // auto-rotate hero
  useEffect(() => {
    if (featured.length < 2) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % featured.length), 4500)
    return () => clearInterval(t)
  }, [featured.length])

  const addToCart = useCallback((p) => {
    setCart(c => ({ ...c, [p.id]: { ...p, qty: (c[p.id]?.qty || 0) + 1 } }))
    toast.success(`${p.name} added to cart`)
  }, [])
  const decCart = (id) => {
    setCart(c => {
      const item = c[id]; if (!item) return c
      const qty = item.qty - 1
      const next = { ...c }
      if (qty <= 0) delete next[id]; else next[id] = { ...item, qty }
      return next
    })
  }
  const removeFromCart = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n })
  const cartItems = Object.values(cart)
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartSubtotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0)
  const discount = appliedCoupon?.discount || 0
  const cartTotal = Math.max(0, cartSubtotal - discount)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => (p.name + ' ' + p.title + ' ' + p.description).toLowerCase().includes(q))
  }, [products, search])

  // re-validate coupon if subtotal changes
  useEffect(() => {
    if (!appliedCoupon) return
    if (cartSubtotal === 0) { setAppliedCoupon(null); return }
    fetch('/api/coupons/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: appliedCoupon.code, total: cartSubtotal })
    }).then(r => r.json()).then(d => {
      if (!d.valid) { setAppliedCoupon(null); toast.error(d.message || 'Coupon no longer valid') }
      else setAppliedCoupon(d)
    })
    // eslint-disable-next-line
  }, [cartSubtotal])

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const r = await fetch('/api/coupons/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), total: cartSubtotal })
      })
      const d = await r.json()
      if (d.valid) { setAppliedCoupon(d); toast.success(d.message); setCouponCode('') }
      else toast.error(d.message || 'Invalid coupon')
    } finally { setCouponLoading(false) }
  }

  const placeOrder = () => {
    if (!name.trim() || !address.trim() || !phone.trim()) { toast.error('Please fill name, phone, and address'); return }
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return }
    const lines = []
    lines.push(`*New Order — ${brand}*`)
    lines.push('')
    lines.push(`*Customer:* ${name}`)
    lines.push(`*Phone:* ${phone}`)
    lines.push(`*Address:* ${address}`)
    if (notes.trim()) lines.push(`*Notes:* ${notes}`)
    lines.push('')
    lines.push('*Order Details:*')
    cartItems.forEach((i, idx) => {
      lines.push(`${idx + 1}. ${i.name} (${i.weight || ''}) × ${i.qty} = ₹${i.qty * i.price}`)
    })
    lines.push('')
    lines.push(`Subtotal: ₹${cartSubtotal}`)
    if (appliedCoupon) lines.push(`Coupon (${appliedCoupon.code}): -₹${discount}`)
    lines.push(`*Total: ₹${cartTotal}*`)
    lines.push('')
    lines.push('Please confirm my order. Thank you!')
    const msg = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank')
    toast.success('Opening WhatsApp…')
    setCheckoutOpen(false); setCartOpen(false)
    setCart({}); setName(''); setPhone(''); setAddress(''); setNotes(''); setAppliedCoupon(null)
  }

  // gallery navigation
  const prevImg = () => { const len = selectedProduct?.images?.length || 1; setGalleryIdx(i => (i - 1 + len) % len) }
  const nextImg = () => { const len = selectedProduct?.images?.length || 1; setGalleryIdx(i => (i + 1) % len) }

  const heroProduct = featured[heroIdx]

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-16 sm:h-20">
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full spice-gradient flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-lg sm:text-xl leading-none">{brand}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase">Crispy • Tangy • Authentic</div>
            </div>
          </a>
          <div className="flex items-center gap-3 sm:gap-5">
            <a href="#shop" className="hidden md:inline text-sm text-muted-foreground hover:text-primary transition">Shop</a>
            <Link href="/about" className="hidden md:inline text-sm text-muted-foreground hover:text-primary transition">About</Link>
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button variant="default" className="relative spice-gradient text-white border-0 shadow-md hover:opacity-90">
                  <ShoppingCart className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">{cartCount}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader><SheetTitle className="font-display text-2xl">Your Cart</SheetTitle></SheetHeader>
                <div className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-3">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Your cart is empty</p>
                      <p className="text-xs mt-1">Add some crunchy goodness!</p>
                    </div>
                  ) : cartItems.map(i => (
                    <div key={i.id} className="flex gap-3 p-3 bg-muted/40 rounded-lg">
                      <img src={cldUrl((i.images && i.images[0]) || i.image, 200)} alt={i.name} className="w-16 h-16 rounded-md object-cover" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{i.name}</div>
                        <div className="text-xs text-muted-foreground">₹{i.price} • {i.weight}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => decCart(i.id)}><Minus className="w-3 h-3" /></Button>
                          <span className="text-sm font-medium w-6 text-center">{i.qty}</span>
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => addToCart(i)}><Plus className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive" onClick={() => removeFromCart(i.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <div className="font-bold text-sm">₹{i.price * i.qty}</div>
                    </div>
                  ))}
                </div>
                {cartItems.length > 0 && (
                  <SheetFooter className="flex-col gap-3 sm:flex-col">
                    {/* Coupon */}
                    <div className="w-full">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="w-4 h-4 text-green-700" />
                            <span className="font-semibold text-green-800">{appliedCoupon.code}</span>
                            <span className="text-green-700">−₹{discount}</span>
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setAppliedCoupon(null)}><X className="w-4 h-4" /></Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="h-10" />
                          <Button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()} variant="outline" className="h-10">Apply</Button>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">Try <button className="font-mono underline" onClick={() => setCouponCode('WELCOME10')}>WELCOME10</button> or <button className="font-mono underline" onClick={() => setCouponCode('FLAT50')}>FLAT50</button></p>
                    </div>
                    <div className="w-full pt-3 border-t space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
                      {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−₹{discount}</span></div>}
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-semibold">Total</span>
                        <span className="font-display text-2xl font-bold">₹{cartTotal}</span>
                      </div>
                    </div>
                    <Button onClick={() => setCheckoutOpen(true)} className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base">
                      <MessageCircle className="w-5 h-5 mr-2" /> Checkout via WhatsApp
                    </Button>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* HERO with CAROUSEL */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(214,96,47,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,168,56,0.18), transparent 50%)' }} />
        <div className="container py-12 md:py-20 lg:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent-foreground border-accent/30">
              <Leaf className="w-3 h-3 mr-1" /> Made fresh • No preservatives
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-5">
              Crispy bites,<br />
              <span className="gold-text">timeless taste.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-7">
              Authentic homemade namkeen and snacks, crafted in small batches with traditional spices. From our kitchen to your tea-table.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="spice-gradient text-white border-0 h-12 px-7 text-base shadow-lg hover:opacity-90" onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}>
                Shop Snacks
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 text-base" onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank')}>
                <MessageCircle className="w-4 h-4 mr-2" /> Chat on WhatsApp
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-md">
              {[{ icon: Award, t: 'Hand-crafted' }, { icon: Leaf, t: 'No chemicals' }, { icon: Truck, t: 'Fresh delivery' }].map(({ icon: I, t }, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><I className="w-5 h-5 text-primary" /></div>
                  <span className="text-xs font-medium text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HERO CAROUSEL */}
          <div className="relative">
            <div className="absolute -inset-6 spice-gradient rounded-full blur-3xl opacity-25" />
            <div className="relative aspect-square max-w-md mx-auto">
              {featured.length > 0 && (
                <>
                  <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl">
                    {featured.map((p, i) => (
                      <div
                        key={p.id}
                        className="absolute inset-0 transition-opacity duration-700"
                        style={{ opacity: i === heroIdx ? 1 : 0, pointerEvents: i === heroIdx ? 'auto' : 'none' }}
                      >
                        <img src={cldUrl((p.images && p.images[0]) || p.image, 1000)} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                          {p.badge && <Badge className="mb-2 bg-accent text-accent-foreground border-0">{p.badge}</Badge>}
                          <div className="font-display text-2xl sm:text-3xl font-bold">{p.name}</div>
                          <div className="text-sm opacity-90 mb-2">{p.title}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold">₹{p.price}</div>
                            <Button size="sm" className="bg-white text-primary hover:bg-white/90" onClick={() => { setSelectedProduct(p); setGalleryIdx(0) }}>
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {featured.length > 1 && (
                    <>
                      <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-10 w-10" onClick={() => setHeroIdx(i => (i - 1 + featured.length) % featured.length)}>
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-10 w-10" onClick={() => setHeroIdx(i => (i + 1) % featured.length)}>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                        {featured.map((_, i) => (
                          <button key={i} onClick={() => setHeroIdx(i)} className={`h-2 rounded-full transition-all ${i === heroIdx ? 'w-8 bg-primary' : 'w-2 bg-primary/30'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="container py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Our Collection</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">Pick your <span className="gold-text">favourite</span></h2>
            <p className="text-muted-foreground mt-2">Tap any snack to view details, then add to cart.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search snacks…" className="pl-9 bg-card" />
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-muted/50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No snacks match your search.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filtered.map(p => {
              const img = cldUrl((p.images && p.images[0]) || p.image, 600)
              const hasMultiple = (p.images?.length || 0) > 1
              return (
                <Card key={p.id} className="snack-card overflow-hidden border-border/60 bg-card cursor-pointer group" onClick={() => { setSelectedProduct(p); setGalleryIdx(0) }}>
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.badge && <Badge className="absolute top-3 left-3 spice-gradient text-white border-0 shadow">{p.badge}</Badge>}
                    {hasMultiple && (
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                        +{p.images.length - 1}
                      </div>
                    )}
                    <Button size="icon" className="absolute bottom-3 right-3 spice-gradient text-white border-0 shadow-lg opacity-0 group-hover:opacity-100 transition" onClick={(e) => { e.stopPropagation(); addToCart(p) }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="font-display font-bold text-lg leading-tight">{p.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">{p.title}</div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="font-bold text-xl">₹{p.price}</span>
                        {p.weight && <span className="text-xs text-muted-foreground ml-2">{p.weight}</span>}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs" onClick={(e) => { e.stopPropagation(); addToCart(p) }}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* STORY */}
      <section className="warm-gradient py-16 md:py-24 mt-8">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-3">Our Story</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">A pinch of tradition, a handful of love.</h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Every batch of {brand} is rolled, fried, and seasoned by hand using recipes passed down through generations. We use only pure ingredients — no chemicals, no shortcuts — just honest, soul-warming snacks.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div><div className="font-display text-3xl font-bold gold-text">15+</div><div className="text-xs text-muted-foreground">Heritage recipes</div></div>
              <div><div className="font-display text-3xl font-bold gold-text">100%</div><div className="text-xs text-muted-foreground">Natural</div></div>
              <div><div className="font-display text-3xl font-bold gold-text">10k+</div><div className="text-xs text-muted-foreground">Happy customers</div></div>
            </div>
            <Link href="/about"><Button variant="outline" className="mt-6">Read our story →</Button></Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 4).map(p => (
              <img key={p.id} src={cldUrl((p.images && p.images[0]) || p.image, 400)} alt={p.name} className="w-full aspect-square object-cover rounded-2xl shadow-md" />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 py-10">
        <div className="container flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} {brand}. Crafted with love.</div>
          <div className="flex gap-5">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp</a>
            <Link href="/about" className="hover:text-primary">About</Link>
            <a href="#shop" className="hover:text-primary">Shop</a>
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE CART BAR */}
      {cartCount > 0 && !cartOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t shadow-2xl p-3">
          <Button onClick={() => setCartOpen(true)} className="w-full h-12 spice-gradient text-white border-0 flex items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">₹{cartTotal}</span>
              <span className="text-sm opacity-90">View cart →</span>
            </div>
          </Button>
        </div>
      )}

      {/* PRODUCT DETAIL DIALOG with GALLERY */}
      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
          {selectedProduct && (
            <div className="grid sm:grid-cols-2">
              <div className="bg-secondary">
                <div className="relative aspect-square">
                  {(selectedProduct.images || []).map((src, i) => (
                    <img key={i} src={cldUrl(src, 1200)} alt={selectedProduct.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" style={{ opacity: i === galleryIdx ? 1 : 0 }} />
                  ))}
                  {(selectedProduct.images?.length || 0) > 1 && (
                    <>
                      <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9" onClick={prevImg}><ChevronLeft className="w-4 h-4" /></Button>
                      <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9" onClick={nextImg}><ChevronRight className="w-4 h-4" /></Button>
                    </>
                  )}
                </div>
                {(selectedProduct.images?.length || 0) > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin">
                    {selectedProduct.images.map((src, i) => (
                      <button key={i} onClick={() => setGalleryIdx(i)} className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition ${i === galleryIdx ? 'border-primary' : 'border-transparent opacity-70'}`}>
                        <img src={cldUrl(src, 200)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col">
                {selectedProduct.badge && <Badge className="w-fit spice-gradient text-white border-0 mb-2">{selectedProduct.badge}</Badge>}
                <h3 className="font-display text-2xl md:text-3xl font-bold">{selectedProduct.name}</h3>
                <p className="text-sm text-muted-foreground italic mb-3">{selectedProduct.title}</p>
                <p className="text-sm leading-relaxed mb-4">{selectedProduct.description}</p>
                <div className="text-3xl font-bold mb-1">₹{selectedProduct.price}</div>
                <div className="text-xs text-muted-foreground mb-6">{selectedProduct.weight}</div>
                <Button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }} className="spice-gradient text-white border-0 mt-auto h-11">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CHECKOUT DIALOG */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-2xl">Place Your Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label htmlFor="n">Full Name *</Label><Input id="n" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" /></div>
            <div><Label htmlFor="p">Phone *</Label><Input id="p" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" /></div>
            <div><Label htmlFor="a">Delivery Address *</Label><Textarea id="a" value={address} onChange={e => setAddress(e.target.value)} placeholder="Flat / Street / City / Pincode" rows={3} /></div>
            <div><Label htmlFor="nt">Notes (optional)</Label><Input id="nt" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions" /></div>
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span>Items</span><span>{cartCount}</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-700"><span>Coupon ({appliedCoupon.code})</span><span>−₹{discount}</span></div>}
              <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span>₹{cartTotal}</span></div>
            </div>
            <Button onClick={placeOrder} className="w-full bg-green-600 hover:bg-green-700 text-white h-12">
              <MessageCircle className="w-5 h-5 mr-2" /> Send Order on WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground text-center">You'll be redirected to WhatsApp to confirm.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
