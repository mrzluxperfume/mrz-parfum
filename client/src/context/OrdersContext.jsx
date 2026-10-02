import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  isSupabaseConfigured,
  orderFromRow,
  orderToRow,
  supabase,
} from '../lib/supabase'

const OrdersContext = createContext(null)
const STORAGE_KEY = 'mrz_orders_v1'

function loadLocalOrders() {
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

function persistLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() =>
    isSupabaseConfigured ? [] : loadLocalOrders(),
  )

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (error) {
        setOrders(loadLocalOrders())
        return
      }
      setOrders((data || []).map(orderFromRow))
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback((updater) => {
    setOrders((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (!isSupabaseConfigured) persistLocal(next)
      return next
    })
  }, [])

  const placeOrder = useCallback(
    async ({ customer, items, note = '' }) => {
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

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('orders').insert(orderToRow(order))
        if (error) throw error
      }

      commit((prev) => [order, ...prev])
      return order
    },
    [commit],
  )

  const updateOrderStatus = useCallback(
    async (id, status) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
        if (error) throw error
      }
      commit((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      )
    },
    [commit],
  )

  const deleteOrder = useCallback(
    async (id) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('orders').delete().eq('id', id)
        if (error) throw error
      }
      commit((prev) => prev.filter((o) => o.id !== id))
    },
    [commit],
  )

  const value = useMemo(
    () => ({
      orders,
      source: isSupabaseConfigured ? 'supabase' : 'local',
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
