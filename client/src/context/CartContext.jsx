import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

function lineKey(product, volume) {
  return `${product.id}__${volume || 'default'}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (product, quantity = 1, volume = null) => {
    const selectedVolume =
      volume ||
      product.volume?.split(' / ')[0] ||
      product.sizes?.find((s) => s.enabled)?.volume ||
      null
    const size = product.sizes?.find(
      (s) => s.volume === selectedVolume && s.enabled,
    )
    const price = size ? size.price : product.price
    const key = lineKey(product, selectedVolume)

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key)
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price,
          volume: selectedVolume,
          quantity,
        },
      ]
    })
  }

  const updateQuantity = (key, quantity) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(0, quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (keyOrId) => {
    setItems((prev) =>
      prev.filter((item) => item.key !== keyOrId && item.id !== keyOrId),
    )
  }

  const clearCart = () => setItems([])

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
    return {
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      count,
      subtotal,
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
