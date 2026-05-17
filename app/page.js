'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SheetFooter } from '@/components/ui/sheet'
import { MessageCircle, ShoppingCart, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import SiteNavbar from '@/components/site-navbar'
import { useCart } from '@/hooks/use-cart'
import CartSheet from '@/components/cart-sheet'
import CartButton from '@/components/cart-button'
import CheckoutDialog from '@/components/home/checkout-dialog'
import ShopSection from '@/components/home/shop-section'
import HeroSection from '@/components/home/hero-section'
import PromiseSection from '@/components/home/promise-section'
import StorySection from '@/components/home/story-section'
import { useSettings } from '@/hooks/use-settings'
import ReviewsFeedbackSection from '@/components/home/reviews-feedback-section'

const WA_DEFAULT_MSG = encodeURIComponent("Hi! I would like to know more about your products.")

const GOOGLE_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbzXn7gbj8dZNl4qMioQt7OOrl99ubiZuEbtXX42N3d1A7R_aWZaL6cDIwIaHCbqQ44zdQ/exec'

const saveToSheet = async (payload) => {
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors', // required for Apps Script web app
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('Sheet save failed:', err)
  }
}

export default function App() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    addItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart()
  const { settings } = useSettings()
  const whatsapp = settings.whatsapp || '916303520089'
  const brand = settings.brand || 'Famous Namkeen'
  const [search, setSearch] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [heroIdx, setHeroIdx] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [street1, setStreet1] = useState('')
  const [street2, setStreet2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [reviews, setReviews] = useState([])

  // Derived address string — used only for the WhatsApp message
  const address = [
    street1,
    street2,
    city,
    state,
    pincode ? `- ${pincode}` : '',
    'India',
  ]
    .filter(Boolean)
    .join(', ')

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const load = async () => {
      try {
        const [productsRes, reviewsRes] = await Promise.all([
          fetch('/api/products', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/reviews', { signal: controller.signal, cache: 'no-store' }),
        ])

        if (!productsRes.ok) throw new Error('Failed to load products')
        if (!reviewsRes.ok) throw new Error('Failed to load reviews')

        const productsData = await productsRes.json()
        const reviewsData = await reviewsRes.json()

        if (!mounted) return

        setProducts(Array.isArray(productsData) ? productsData : [])
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      } catch (err) {
        if (err?.name !== 'AbortError') console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  const currentYear = useMemo(() => new Date().getFullYear(), [])

  const featured = useMemo(() => {
    const f = products.filter(p => p.featured)
    return f.length > 0 ? f : products.slice(0, 3)
  }, [products])

  useEffect(() => {
    if (featured.length < 2) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % featured.length), 4500)
    return () => clearInterval(t)
  }, [featured.length])

  // FIX 4: silent param — cart sheet qty buttons pass silent=true to suppress toasts
  const addToCart = useCallback((p, silent = false) => {
    addItem(p)
    if (!silent) toast.success(`${p.name} added to cart`)
  }, [addItem])

  const discount = appliedCoupon?.discount || 0
  const cartTotal = Math.max(0, cartSubtotal - discount)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p =>
      `${p.name || ''} ${p.title || ''} ${p.description || ''}`.toLowerCase().includes(q)
    )
  }, [products, search])

  const latestCouponCheck = useRef(0)

  // FIX 3: Stable ref-based race-condition guard; abort controller cleaned up properly
  useEffect(() => {
    if (!appliedCoupon) return
    if (cartSubtotal === 0) {
      setAppliedCoupon(null)
      return
    }

    const controller = new AbortController()
    const checkId = ++latestCouponCheck.current

    const validate = async () => {
      try {
        const r = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedCoupon.code, total: cartSubtotal }),
          signal: controller.signal,
        })

        const d = await r.json()
        if (checkId !== latestCouponCheck.current) return

        if (!d.valid) {
          setAppliedCoupon(null)
          toast.error(d.message || 'Coupon no longer valid')
        } else {
          setAppliedCoupon(d)
        }
      } catch (err) {
        if (err?.name !== 'AbortError') console.error(err)
      }
    }

    validate()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSubtotal])

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const r = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), total: cartSubtotal }),
      })

      if (!r.ok) throw new Error('Coupon validation failed')

      const d = await r.json()
      if (d.valid) {
        setAppliedCoupon(d)
        toast.success(d.message)
        setCouponCode('')
      } else {
        toast.error(d.message || 'Invalid coupon')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    } finally {
      setCouponLoading(false)
    }
  }

  // FIX 2: Enter key submits coupon
  const handleCouponKeyDown = (e) => {
    if (e.key === 'Enter') applyCoupon()
  }

  // FIX 1: Validate each address sub-field individually with specific error messages
  const placeOrder = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return }
    if (!phone.trim()) { toast.error('Please enter your phone number'); return }
    if (!street1.trim()) { toast.error('Please enter your street / house number'); return }
    if (!city.trim()) { toast.error('Please enter your city'); return }
    if (!pincode.trim()) { toast.error('Please enter your pincode'); return }
    if (!state) { toast.error('Please select your state'); return }
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return }

    const orderData = {
      name,
      phone,
      street1,
      street2,
      city,
      pincode,
      state,
      address,
      notes,
      items: cartItems,
      subtotal: cartSubtotal,
      discount,
      total: cartTotal,
      coupon: appliedCoupon?.code || '',
      brand,
      createdAt: new Date().toISOString(),
    }

    // ✅ SAVE TO GOOGLE SHEET FIRST
    await saveToSheet(orderData)

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

    setCheckoutOpen(false)
    setCartOpen(false)
    clearCart()
    setName('')
    setPhone('')
    setStreet1('')
    setStreet2('')
    setCity('')
    setState('')
    setPincode('')
    setNotes('')
    setAppliedCoupon(null)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 cream-bg">
      {/* Gold strip top */}
      <div className="gold-strip"></div>

      {/* NAV */}
      <SiteNavbar
        brand={brand}
        cartButton={<CartButton count={cartCount} onClick={() => setCartOpen(true)} />}
      />
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        cartItems={cartItems}
        onAdd={(item) => addToCart(item, true)}
        onDec={decrementItem}
        onRemove={removeItem}
        footer={cartItems.length > 0 ? (
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
                  <Input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={handleCouponKeyDown}
                    placeholder="Coupon code"
                    className="h-10"
                  />
                  <Button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()} variant="outline" className="h-10">
                    {couponLoading ? '…' : 'Apply'}
                  </Button>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">
                Try{' '}
                <button className="font-mono underline" onClick={() => setCouponCode('WELCOME10')}>WELCOME10</button>
                {' '}or{' '}
                <button className="font-mono underline" onClick={() => setCouponCode('FLAT50')}>FLAT50</button>
              </p>
            </div>
            <div className="w-full pt-3 border-t space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−₹{discount}</span></div>}
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-bold" style={{ color: '#1E2D5A' }}>₹{cartTotal}</span>
              </div>
            </div>
            <Button onClick={() => setCheckoutOpen(true)} className="w-full wa-gradient text-white border-0 h-12 text-base rounded-full">
              <MessageCircle className="w-5 h-5 mr-2" /> Checkout via WhatsApp
            </Button>
          </SheetFooter>
        ) : null}
      />

      <HeroSection
        featured={featured}
        heroIdx={heroIdx}
        setHeroIdx={setHeroIdx}
        onExploreProducts={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
        onWhatsAppOrder={() => window.open(`https://wa.me/${whatsapp}?text=${WA_DEFAULT_MSG}`, '_blank')}
        onOpenProduct={(p) => router.push(`/product/${p.id}`)}
      />

      <div className="gold-strip"></div>

      <ShopSection
        loading={loading}
        filtered={filtered}
        search={search}
        setSearch={setSearch}
        onOpenProduct={(p) => router.push(`/product/${p.id}`)}
        onAddToCart={addToCart}
      />

      <PromiseSection />

      <div className="gold-strip"></div>

      <StorySection brand={brand} products={products} />
      <ReviewsFeedbackSection
        reviews={reviews}
        onReviewAdded={(review) => setReviews((prev) => [review, ...prev])}
      />

      {/* CTA */}
      <section className="navy-gradient navy-pattern relative">
        <div className="container py-14 md:py-20 text-center relative">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Ready to taste <span className="gold-text">tradition?</span></h2>
          <p className="text-white/80 mb-7 max-w-xl mx-auto">Order in seconds — chat with us on WhatsApp and we'll handle the rest.</p>
          <Button size="lg" className="wa-gradient text-white border-0 h-12 px-8 text-base shadow-2xl rounded-full" onClick={() => window.open(`https://wa.me/${whatsapp}?text=${WA_DEFAULT_MSG}`, '_blank')}>
            <MessageCircle className="w-5 h-5 mr-2" /> Order on WhatsApp
          </Button>
        </div>
      </section>

      <div className="gold-strip"></div>

      {/* FOOTER */}
      <footer className="cream-bg border-t border-border/60 py-6 md:py-8">
        <div className="container flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt={brand}
              width={120}
              height={40}
              className="h-9 sm:h-10 w-auto object-contain opacity-90"
            />
            <div className="text-xs sm:text-sm">
              © {currentYear} <span className="font-semibold" style={{ color: '#1E2D5A' }}>{brand}</span>.
              Crafted with love.
            </div>
          </div>
          <div className="flex gap-5 text-xs sm:text-sm">
            <a href={`https://wa.me/${whatsapp}?text=${WA_DEFAULT_MSG}`} target="_blank" rel="noreferrer" className="hover:text-primary transition">WhatsApp</a>
            <Link href="/about" className="hover:text-primary transition">About</Link>
            <a href="#shop" className="hover:text-primary transition">Shop</a>
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE CART BAR */}
      {cartCount > 0 && !cartOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1E2D5A]/97 backdrop-blur-md border-t border-[#C9A84C]/30 shadow-2xl p-3">
          <Button onClick={() => setCartOpen(true)} className="w-full h-12 orange-gradient text-white border-0 flex items-center justify-between px-5 rounded-full">
            <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /><span>{cartCount} item{cartCount > 1 ? 's' : ''}</span></div>
            <div className="flex items-center gap-2"><span className="font-bold">₹{cartTotal}</span><span className="text-sm opacity-90">View cart →</span></div>
          </Button>
        </div>
      )}

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        name={name}
        setName={setName}
        phone={phone}
        setPhone={setPhone}
        street1={street1}
        setStreet1={setStreet1}
        street2={street2}
        setStreet2={setStreet2}
        city={city}
        setCity={setCity}
        pincode={pincode}
        setPincode={setPincode}
        state={state}
        setState={setState}
        notes={notes}
        setNotes={setNotes}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        discount={discount}
        appliedCoupon={appliedCoupon}
        cartTotal={cartTotal}
        placeOrder={placeOrder}
      />
    </div>
  )
}