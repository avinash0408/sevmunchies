'use client'

import { useEffect, useMemo, useState } from 'react'
import { broadcastCartUpdate, CART_UPDATED_EVENT, readCart, writeCart } from '@/lib/cart'

const persistAndBroadcast = (nextCart) => {
  writeCart(nextCart)
  broadcastCartUpdate()
  return nextCart
}

export function useCart() {
  const [cart, setCart] = useState({})

  useEffect(() => {
    setCart(readCart())
  }, [])

  useEffect(() => {
    const syncCart = () => setCart(readCart())
    window.addEventListener('storage', syncCart)
    window.addEventListener(CART_UPDATED_EVENT, syncCart)
    return () => {
      window.removeEventListener('storage', syncCart)
      window.removeEventListener(CART_UPDATED_EVENT, syncCart)
    }
  }, [])

  const addItem = (product) => {
    if (!product?.id) return
    const current = readCart()
    const next = {
      ...current,
      [product.id]: { ...product, qty: (current[product.id]?.qty || 0) + 1 },
    }
    persistAndBroadcast(next)
    setCart(next)
  }

  const decrementItem = (itemId) => {
    const current = readCart()
    const item = current[itemId]
    if (!item) return
    const qty = item.qty - 1
    const next = { ...current }
    if (qty <= 0) delete next[itemId]
    else next[itemId] = { ...item, qty }
    persistAndBroadcast(next)
    setCart(next)
  }

  const removeItem = (itemId) => {
    const current = readCart()
    const next = { ...current }
    delete next[itemId]
    persistAndBroadcast(next)
    setCart(next)
  }

  const clearCart = () => {
    const next = {}
    persistAndBroadcast(next)
    setCart(next)
  }

  const cartItems = useMemo(() => Object.values(cart), [cart])
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.qty, 0), [cartItems])
  const cartSubtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.qty * item.price, 0), [cartItems])

  return {
    cart,
    cartItems,
    cartCount,
    cartSubtotal,
    addItem,
    decrementItem,
    removeItem,
    clearCart,
  }
}
