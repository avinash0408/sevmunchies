'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import SiteNavbar from '@/components/site-navbar'
import { useCart } from '@/hooks/use-cart'
import { cldUrl } from '@/lib/cloudinary'
import CartButton from '@/components/cart-button'
import CartSheet from '@/components/cart-sheet'
import { useSettings } from '@/hooks/use-settings'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const { settings } = useSettings()
  const brand = settings.brand || 'Famous Namkeen'
  const { cartItems, cartCount, cartSubtotal, addItem, decrementItem, removeItem } = useCart()

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const loadProduct = async () => {
      try {
        const productsRes = await fetch('/api/products', { signal: controller.signal, cache: 'no-store' })

        if (!productsRes.ok) throw new Error('Failed to load product')

        const products = await productsRes.json()
        if (!mounted) return

        const found = products.find((p) => p.id === id) || null
        setProduct(found)
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error(err)
          toast.error('Could not load product details')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (id) loadProduct()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [id])

  const images = useMemo(() => {
    if (!product) return []
    const list = Array.isArray(product.images) ? product.images : []
    if (list.length > 0) return list
    return product.image ? [product.image] : []
  }, [product])

  const ingredients = useMemo(() => {
    if (!product?.ingredients) return []
    if (Array.isArray(product.ingredients)) return product.ingredients
    if (typeof product.ingredients === 'string') {
      return product.ingredients.split(',').map((item) => item.trim()).filter(Boolean)
    }
    return []
  }, [product])

  const addToCart = () => {
    if (!product) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }
  const cartTotal = cartSubtotal

  const prevImg = () => {
    const len = images.length || 1
    setGalleryIdx((i) => (i - 1 + len) % len)
  }

  const nextImg = () => {
    const len = images.length || 1
    setGalleryIdx((i) => (i + 1) % len)
  }

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading product...</div>
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-3" style={{ color: '#1E2D5A' }}>Product not found</h1>
        <p className="text-muted-foreground mb-6">This product may have been removed or the link is incorrect.</p>
        <Link href="/">
          <Button className="orange-gradient text-white border-0 rounded-full px-6">Back to shop</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen cream-bg">
      <div className="gold-strip"></div>
      <SiteNavbar
        brand={brand}
        showShopLink={false}
        cartButton={<CartButton count={cartCount} onClick={() => setCartOpen(true)} />}
      />
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        cartItems={cartItems}
        onAdd={addItem}
        onDec={decrementItem}
        onRemove={removeItem}
        footer={cartItems.length > 0 ? (
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="font-semibold">Total: ₹{cartTotal}</div>
            <Link href="/#shop">
              <Button className="orange-gradient text-white border-0 rounded-full">Checkout</Button>
            </Link>
          </div>
        ) : null}
      />
      <div className="container py-8 md:py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-5">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to {brand}
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-card rounded-2xl overflow-hidden border border-border/60">
            <div className="relative aspect-square bg-secondary/5">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={cldUrl(src)}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: i === galleryIdx ? 1 : 0 }}
                />
              ))}
              {images.length > 1 && (
                <>
                  <Button size="icon" variant="secondary" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full h-9 w-9" onClick={prevImg}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-9 w-9" onClick={nextImg}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition ${i === galleryIdx ? 'border-primary' : 'border-transparent opacity-70'}`}
                  >
                    <img src={cldUrl(src, 220)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8">
            {product.badge && <Badge className="orange-gradient text-white border-0 mb-3">{product.badge}</Badge>}
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1E2D5A' }}>{product.name}</h1>
            <p className="text-muted-foreground italic mb-4">{product.title}</p>
            <p className="leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-end gap-3 mb-6">
              <div className="font-display text-4xl font-bold" style={{ color: '#1E2D5A' }}>₹{product.price}</div>
              {product.weight && <div className="text-sm text-muted-foreground pb-1">{product.weight}</div>}
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-2" style={{ color: '#1E2D5A' }}>Ingredients</h2>
              {ingredients.length > 0 ? (
                <ul className="text-sm text-muted-foreground space-y-1">
                  {ingredients.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Ingredient details will be updated soon.</p>
              )}
            </div>

            <Button onClick={addToCart} className="orange-gradient text-white border-0 h-11 rounded-full w-full md:w-auto px-7">
              <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
