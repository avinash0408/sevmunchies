export const CART_KEY = 'sev_cart_v1'
export const CART_UPDATED_EVENT = 'sev-cart-updated'

export const readCart = () => {
  if (typeof window === 'undefined') return {}
  const saved = localStorage.getItem(CART_KEY)
  if (!saved) return {}
  try {
    const parsed = JSON.parse(saved)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    localStorage.removeItem(CART_KEY)
    return {}
  }
}

export const writeCart = (cart) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export const broadcastCartUpdate = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

export const addItemToCart = (product) => {
  if (!product?.id) return {}
  const current = readCart()
  const next = {
    ...current,
    [product.id]: { ...product, qty: (current[product.id]?.qty || 0) + 1 },
  }
  writeCart(next)
  broadcastCartUpdate()
  return next
}
