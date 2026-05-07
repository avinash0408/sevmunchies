'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, Sparkles, Leaf, Award, Truck, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const CART_KEY = 'sev_cart_v1'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState({})
  const [whatsapp, setWhatsapp] = useState('916303520089')
  const [brand, setBrand] = useState('SevMunchies')
  const [search, setSearch] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(CART_KEY) : null
    if (saved) { try { setCart(JSON.parse(saved)) } catch {} }
    fetch('/api/products').then(r => r.json()).then(d => { setProducts(d || []); setLoading(false) }).catch(() => setLoading(false))
    fetch('/api/settings').then(r => r.json()).then(d => { if (d.whatsapp) setWhatsapp(d.whatsapp); if (d.brand) setBrand(d.brand) })
  }, [])

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(CART_KEY, JSON.stringify(cart)) }, [cart])

  const addToCart = (p) => {
    setCart(c => ({ ...c, [p.id]: { ...p, qty: (c[p.id]?.qty || 0) + 1 } }))
    toast.success(`${p.name} added to cart`)
  }
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
  const cartTotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => (p.name + ' ' + p.title + ' ' + p.description).toLowerCase().includes(q))
  }, [products, search])

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
    lines.push(`*Total: ₹${cartTotal}*`)
    lines.push('')
    lines.push('Please confirm my order. Thank you!')
    const msg = encodeURIComponent(lines.join('\n'))
    const url = `https://wa.me/${whatsapp}?text=${msg}`
    window.open(url, '_blank')
    toast.success('Opening WhatsApp…')
    setCheckoutOpen(false)
    setCart({}); setName(''); setPhone(''); setAddress(''); setNotes('')
  }

  return (
    <div className="min-h-screen">
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
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/admin" className="hidden sm:inline-flex text-xs text-muted-foreground hover:text-primary transition">Admin</Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" className="relative spice-gradient text-white border-0 shadow-md hover:opacity-90">
                  <ShoppingCart className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl">Your Cart</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-3">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Your cart is empty</p>
                      <p className="text-xs mt-1">Add some crunchy goodness!</p>
                    </div>
                  ) : cartItems.map(i => (
                    <div key={i.id} className="flex gap-3 p-3 bg-muted/40 rounded-lg">
                      <img src={i.image} alt={i.name} className="w-16 h-16 rounded-md object-cover" />
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
                    <div className="flex justify-between items-center w-full pt-3 border-t">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-display text-2xl font-bold">₹{cartTotal}</span>
                    </div>
                    <Button onClick={() => setCheckoutOpen(true)} className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Checkout via WhatsApp
                    </Button>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(214,96,47,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,168,56,0.18), transparent 50%)' }} />
        <div className="container py-12 md:py-20 lg:py-28 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
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
          <div className="relative">
            <div className="absolute -inset-6 spice-gradient rounded-full blur-3xl opacity-25" />
            <div className="relative aspect-square max-w-md mx-auto float-anim">
              <img src="https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/vg2h435r_WhatsApp%20Image%202026-05-06%20at%2023.04.57%20%282%29.jpeg" alt="Hero snack" className="w-full h-full object-cover rounded-3xl shadow-2xl" />
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-xl p-3 sm:p-4 flex items-center gap-3 border">
                <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Trusted by</div>
                  <div className="font-bold text-sm">10,000+ snack lovers</div>
                </div>
              </div>
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
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No snacks match your search.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filtered.map(p => (
              <Card key={p.id} className="snack-card overflow-hidden border-border/60 bg-card cursor-pointer group" onClick={() => setSelectedProduct(p)}>
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.badge && (
                    <Badge className="absolute top-3 left-3 spice-gradient text-white border-0 shadow">{p.badge}</Badge>
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
            ))}
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 4).map(p => (
              <img key={p.id} src={p.image} alt={p.name} className="w-full aspect-square object-cover rounded-2xl shadow-md" />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 py-10">
        <div className="container flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} {brand}. Crafted with love.</div>
          <div className="flex gap-4">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp</a>
            <Link href="/admin" className="hover:text-primary">Admin</Link>
          </div>
        </div>
      </footer>

      {/* PRODUCT DETAIL DIALOG */}
      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {selectedProduct && (
            <div className="grid sm:grid-cols-2">
              <div className="aspect-square bg-secondary">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Place Your Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="n">Full Name *</Label>
              <Input id="n" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="p">Phone *</Label>
              <Input id="p" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" />
            </div>
            <div>
              <Label htmlFor="a">Delivery Address *</Label>
              <Textarea id="a" value={address} onChange={e => setAddress(e.target.value)} placeholder="Flat / Street / City / Pincode" rows={3} />
            </div>
            <div>
              <Label htmlFor="nt">Notes (optional)</Label>
              <Input id="nt" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions" />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between mb-1"><span>Items</span><span>{cartCount}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{cartTotal}</span></div>
            </div>
            <Button onClick={placeOrder} className="w-full bg-green-600 hover:bg-green-700 text-white h-12">
              <MessageCircle className="w-5 h-5 mr-2" /> Send Order on WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground text-center">You’ll be redirected to WhatsApp to confirm.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
