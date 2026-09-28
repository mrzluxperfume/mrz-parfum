import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

const OrdersContext = createContext(null)
const STORAGE_KEY = 'mrz_orders_v1'

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore */
  }
  return []
}

function persist(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => loadOrders())

  const commit = useCallback((updater) => {
    setOrders((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next)
      return next
    })
  }, [])

  const placeOrder = useCallback(
    ({ customer, items, note = '' }) => {
      const lineItems = items.map((item) => ({
        productId: item.id,
        name: item.name,
        image: item.image,
        volume: item.volume,
        unitPrice: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
      }))
      const total = lineItems.reduce((sum, l) => sum + l.lineTotal, 0)
      const order = {
        id: `MRZ-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'new',
        customer: {
          name: customer.name?.trim() || '',
          email: customer.email?.trim() || '',
          phone: customer.phone?.trim() || '',
          address: customer.address?.trim() || '',
        },
        note: note?.trim() || '',
        items: lineItems,
        total,
      }
      commit((prev) => [order, ...prev])
      return order
    },
    [commit],
  )

  const updateOrderStatus = useCallback(
    (id, status) => {
      commit((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      )
    },
    [commit],
  )

  const deleteOrder = useCallback(
    (id) => {
      commit((prev) => prev.filter((o) => o.id !== id))
    },
    [commit],
  )

  const value = useMemo(
    () => ({
      orders,
      placeOrder,
      updateOrderStatus,
      deleteOrder,
      newCount: orders.filter((o) => o.status === 'new').length,
    }),
    [orders, placeOrder, updateOrderStatus, deleteOrder],
  )

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider')
  return ctx
}
