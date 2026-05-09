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
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, Sparkles, Leaf, Award, Truck, Search, ChevronLeft, ChevronRight, Tag, X, Star } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const CART_KEY = 'sev_cart_v1'
const BRAND_LOGO = 'https://res.cloudinary.com/dprlv7yng/image/upload/c_crop,w_520,h_420,x_508,y_94/c_fill,w_240,h_240,f_auto,q_auto/v1778307396/sevmunchies/file_mwxxik.png'
const WA_DEFAULT_MSG = encodeURIComponent("Hi! I would like to know more about your products.")

// Cloudinary on-the-fly transform
const cldUrl = (url, w = 600) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  if (/\/upload\/(w_|c_|f_|q_|h_)/.test(url)) return url
  return url.replace('/upload/', `/upload/w_${w},c_fill,f_auto,q_auto/`)
}

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState({})
  const [whatsapp, setWhatsapp] = useState('916303520089')
  const [brand, setBrand] = useState('Famous Namkeen')
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

  const featured = useMemo(() => {
    const f = products.filter(p => p.featured)
    return f.length > 0 ? f : products.slice(0, 3)
  }, [products])

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

  const prevImg = () => { const len = selectedProduct?.images?.length || 1; setGalleryIdx(i => (i - 1 + len) % len) }
  const nextImg = () => { const len = selectedProduct?.images?.length || 1; setGalleryIdx(i => (i + 1) % len) }

  return (
    <div className="min-h-screen pb-20 md:pb-0 cream-bg">
      {/* Gold strip top */}
      <div className="gold-strip"></div>

      {/* NAV - cream like reference */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#FFF8EE]/95 border-b border-border/60">
        <div className="container flex items-center justify-between h-16 sm:h-20">
          <a href="#" className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-md ring-2 ring-accent/40 bg-black flex-shrink-0">
              <img src={BRAND_LOGO} alt={brand} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-display font-bold text-xl sm:text-2xl leading-none tracking-wide gold-text uppercase">
                {brand.split(' ')[0] || brand}
              </div>
              {brand.split(' ').slice(1).join(' ') && (
                <div className="font-display font-semibold text-[11px] sm:text-xs leading-tight tracking-[0.25em] uppercase mt-0.5 gold-text">
                  {brand.split(' ').slice(1).join(' ')}
                </div>
              )}
            </div>
          </a>
          <div className="flex items-center gap-3 sm:gap-5">
            <a href="#shop" className="hidden md:inline text-sm font-medium hover:text-primary transition" style={{ color: '#1c3380' }}>Shop</a>
            <Link href="/about" className="hidden md:inline text-sm font-medium hover:text-primary transition" style={{ color: '#1c3380' }}>About</Link>
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative wa-gradient text-white border-0 shadow-md hover:opacity-90 rounded-full">
                  <ShoppingCart className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">{cartCount}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader><SheetTitle className="font-display text-2xl" style={{ color: '#1c3380' }}>Your Cart</SheetTitle></SheetHeader>
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
                        <span className="font-display text-2xl font-bold" style={{ color: '#1c3380' }}>₹{cartTotal}</span>
                      </div>
                    </div>
                    <Button onClick={() => setCheckoutOpen(true)} className="w-full wa-gradient text-white border-0 h-12 text-base rounded-full">
                      <MessageCircle className="w-5 h-5 mr-2" /> Checkout via WhatsApp
                    </Button>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* HERO — NAVY background like reference */}
      <section className="relative navy-gradient navy-pattern overflow-hidden">
        <div className="container py-12 md:py-20 lg:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center relative">
          <div className="text-white">
            <Badge className="mb-5 bg-white/10 border border-accent/40 text-accent hover:bg-white/10 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3 mr-1.5" /> Premium Indian Namkeen
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-5 text-white">
              Authentic<br />
              <span className="gold-text">Crunchy Taste</span><br />
              Delivered Fresh
            </h1>
            <p className="text-base sm:text-lg text-white/80 max-w-xl mb-8">
              Traditional flavors crafted with premium quality ingredients and an unforgettable crunch in every bite.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="orange-gradient text-white border-0 h-12 px-7 text-base shadow-xl hover:opacity-90 rounded-full" onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Products →
              </Button>
              <Button size="lg" className="wa-gradient text-white border-0 h-12 px-7 text-base shadow-xl hover:opacity-90 rounded-full" onClick={() => window.open(`https://wa.me/${whatsapp}?text=${WA_DEFAULT_MSG}`, '_blank')}>
                <MessageCircle className="w-4 h-4 mr-2" /> Order on WhatsApp
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-md">
              {[{ n: '10K+', t: 'Happy Customers' }, { n: '50+', t: 'Years of Recipe' }, { n: '100%', t: 'Natural' }].map(({ n, t }, i) => (
                <div key={i}>
                  <div className="font-display text-3xl md:text-4xl font-bold gold-text">{n}</div>
                  <div className="text-xs text-white/70 mt-1">{t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero carousel — featured products */}
          <div className="relative">
            <div className="relative aspect-square max-w-md mx-auto">
              {featured.length > 0 && (
                <>
                  <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl ring-4 ring-accent/20">
                    {featured.map((p, i) => (
                      <div
                        key={p.id}
                        className="absolute inset-0 transition-opacity duration-700"
                        style={{ opacity: i === heroIdx ? 1 : 0, pointerEvents: i === heroIdx ? 'auto' : 'none' }}
                      >
                        <img src={cldUrl((p.images && p.images[0]) || p.image, 1000)} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                          {p.badge && <Badge className="mb-2 orange-gradient text-white border-0">{p.badge}</Badge>}
                          <div className="font-display text-2xl sm:text-3xl font-bold">{p.name}</div>
                          <div className="text-sm opacity-90 mb-2">{p.title}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold gold-text">₹{p.price}</div>
                            <Button size="sm" className="orange-gradient text-white border-0 rounded-full px-4" onClick={() => { setSelectedProduct(p); setGalleryIdx(0) }}>
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {featured.length > 1 && (
                    <>
                      <Button size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-10 w-10 bg-white text-secondary hover:bg-white/90" onClick={() => setHeroIdx(i => (i - 1 + featured.length) % featured.length)}>
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-10 w-10 bg-white text-secondary hover:bg-white/90" onClick={() => setHeroIdx(i => (i + 1) % featured.length)}>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                        {featured.map((_, i) => (
                          <button key={i} onClick={() => setHeroIdx(i)} className={`h-2 rounded-full transition-all ${i === heroIdx ? 'w-8 bg-accent' : 'w-2 bg-white/30'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
              {/* Reviews badge floating */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 border-2 border-accent/30 hidden sm:flex">
                <div className="w-10 h-10 rounded-full orange-gradient flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold" style={{ color: '#1c3380' }}>4.9 / 5</div>
                  <div className="text-[11px] text-muted-foreground">From 2,400+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold strip separator */}
      <div className="gold-strip"></div>

      {/* SHOP — cream background */}
      <section id="shop" className="cream-bg">
        <div className="container py-14 md:py-20">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/10">Bestsellers</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold" style={{ color: '#1c3380' }}>Our Signature <span className="orange-text">Snacks</span></h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Hand-crafted in small batches for unmatched freshness and crunch.</p>
            <div className="relative max-w-sm mx-auto mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search snacks…" className="pl-9 bg-card border-secondary/20 rounded-full" />
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
                  <Card key={p.id} className="snack-card overflow-hidden border-border/60 bg-card cursor-pointer group rounded-2xl" onClick={() => { setSelectedProduct(p); setGalleryIdx(0) }}>
                    <div className="relative aspect-square overflow-hidden bg-secondary/5">
                      <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {p.badge && <Badge className="absolute top-3 left-3 orange-gradient text-white border-0 shadow">{p.badge}</Badge>}
                      {hasMultiple && (
                        <div className="absolute top-3 right-3 bg-secondary/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                          +{p.images.length - 1}
                        </div>
                      )}
                      <Button size="icon" className="absolute bottom-3 right-3 orange-gradient text-white border-0 shadow-lg opacity-0 group-hover:opacity-100 transition rounded-full" onClick={(e) => { e.stopPropagation(); addToCart(p) }}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="font-display font-bold text-lg leading-tight" style={{ color: '#1c3380' }}>{p.name}</div>
                      <div className="text-xs text-muted-foreground mb-2">{p.title}</div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="font-bold text-xl" style={{ color: '#1c3380' }}>₹{p.price}</span>
                          {p.weight && <span className="text-xs text-muted-foreground ml-2">{p.weight}</span>}
                        </div>
                        <Button size="sm" className="orange-gradient text-white border-0 rounded-full" onClick={(e) => { e.stopPropagation(); addToCart(p) }}>
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US — navy section */}
      <section className="navy-gradient navy-pattern relative">
        <div className="container py-14 md:py-20 relative">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-white/10 text-accent border-accent/40 hover:bg-white/10">The Famous Promise</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white">Why Choose <span className="gold-text">Us</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Award, title: 'Authentic Taste', text: 'Heritage recipes from generations of mastery.' },
              { icon: Sparkles, title: 'Freshly Prepared', text: 'Every batch made fresh and packed at peak crunch.' },
              { icon: Leaf, title: 'Premium Ingredients', text: 'Hand-picked spices and finest gram flour.' },
              { icon: Truck, title: 'No Preservatives', text: 'Pure flavor — nothing artificial, ever.' },
            ].map(({ icon: I, title, text }, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mb-4">
                  <I className="w-6 h-6" style={{ color: '#1c3380' }} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/70">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold strip */}
      <div className="gold-strip"></div>

      {/* STORY — cream */}
      <section className="warm-bg py-14 md:py-20">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="mb-3 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/10">Our Story</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" style={{ color: '#1c3380' }}>From the heart of <span className="orange-text">Ratlam</span></h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              What began as a small family kitchen in the spice-laden lanes of Ratlam is now a beloved name in households across India. Every packet of {brand} carries the warmth of a tradition kept alive — one crunchy bite at a time.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div><div className="font-display text-3xl font-bold" style={{ color: '#1c3380' }}>15+</div><div className="text-xs text-muted-foreground">Heritage recipes</div></div>
              <div><div className="font-display text-3xl font-bold" style={{ color: '#1c3380' }}>100%</div><div className="text-xs text-muted-foreground">Natural</div></div>
              <div><div className="font-display text-3xl font-bold" style={{ color: '#1c3380' }}>10k+</div><div className="text-xs text-muted-foreground">Customers</div></div>
            </div>
            <Link href="/about"><Button className="mt-6 orange-gradient text-white border-0 rounded-full px-6">Read our story →</Button></Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 4).map(p => (
              <img key={p.id} src={cldUrl((p.images && p.images[0]) || p.image, 400)} alt={p.name} className="w-full aspect-square object-cover rounded-2xl shadow-md" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA — navy */}
      <section className="navy-gradient navy-pattern relative">
        <div className="container py-14 md:py-20 text-center relative">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Ready to taste <span className="gold-text">tradition?</span></h2>
          <p className="text-white/80 mb-7 max-w-xl mx-auto">Order in seconds — chat with us on WhatsApp and we'll handle the rest.</p>
          <Button size="lg" className="wa-gradient text-white border-0 h-12 px-8 text-base shadow-2xl rounded-full" onClick={() => window.open(`https://wa.me/${whatsapp}?text=${WA_DEFAULT_MSG}`, '_blank')}>
            <MessageCircle className="w-5 h-5 mr-2" /> Order on WhatsApp
          </Button>
        </div>
      </section>

      {/* Gold strip */}
      <div className="gold-strip"></div>

      {/* FOOTER */}
      <footer className="cream-bg border-t border-border/60 py-10">
        <div className="container flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-accent/30"><img src={BRAND_LOGO} alt="" className="w-full h-full object-cover" /></div>
            <div>© {new Date().getFullYear()} <span className="font-semibold" style={{ color: '#1c3380' }}>{brand}</span>. Crafted with love.</div>
          </div>
          <div className="flex gap-5">
            <a href={`https://wa.me/${whatsapp}?text=${WA_DEFAULT_MSG}`} target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp</a>
            <Link href="/about" className="hover:text-primary">About</Link>
            <a href="#shop" className="hover:text-primary">Shop</a>
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE CART BAR */}
      {cartCount > 0 && !cartOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFF8EE]/95 backdrop-blur-md border-t shadow-2xl p-3">
          <Button onClick={() => setCartOpen(true)} className="w-full h-12 orange-gradient text-white border-0 flex items-center justify-between px-5 rounded-full">
            <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /><span>{cartCount} item{cartCount > 1 ? 's' : ''}</span></div>
            <div className="flex items-center gap-2"><span className="font-bold">₹{cartTotal}</span><span className="text-sm opacity-90">View cart →</span></div>
          </Button>
        </div>
      )}

      {/* PRODUCT DETAIL */}
      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
          {selectedProduct && (
            <div className="grid sm:grid-cols-2">
              <div className="bg-secondary/5">
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
                {selectedProduct.badge && <Badge className="w-fit orange-gradient text-white border-0 mb-2">{selectedProduct.badge}</Badge>}
                <h3 className="font-display text-2xl md:text-3xl font-bold" style={{ color: '#1c3380' }}>{selectedProduct.name}</h3>
                <p className="text-sm text-muted-foreground italic mb-3">{selectedProduct.title}</p>
                <p className="text-sm leading-relaxed mb-4">{selectedProduct.description}</p>
                <div className="text-3xl font-bold mb-1" style={{ color: '#1c3380' }}>₹{selectedProduct.price}</div>
                <div className="text-xs text-muted-foreground mb-6">{selectedProduct.weight}</div>
                <Button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }} className="orange-gradient text-white border-0 mt-auto h-11 rounded-full">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CHECKOUT */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-2xl" style={{ color: '#1c3380' }}>Place Your Order</DialogTitle></DialogHeader>
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
            <Button onClick={placeOrder} className="w-full wa-gradient text-white border-0 h-12 rounded-full">
              <MessageCircle className="w-5 h-5 mr-2" /> Send Order on WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground text-center">You'll be redirected to WhatsApp to confirm.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
