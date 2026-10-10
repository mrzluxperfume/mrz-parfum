import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import NoIndex from '../components/NoIndex'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrdersContext'
import api from '../services/api'
import { formatPrice } from '../utils/format'

const emptyCustomer = {
  name: '',
  email: '',
  phone: '',
  address: '',
}

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const { placeOrder } = useOrders()
  const [searchParams] = useSearchParams()
  const [customer, setCustomer] = useState(emptyCustomer)
  const [note, setNote] = useState('')
  const [couponDraft, setCouponDraft] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponBusy, setCouponBusy] = useState(false)
  const [offer, setOffer] = useState(null)
  const [status, setStatus] = useState('idle')
  const [orderId, setOrderId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const update = (field) => (e) => {
    setCustomer((prev) => ({ ...prev, [field]: e.target.value }))
  }

  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')

    if (payment === 'cancel') {
      setStatus('error')
      setErrorMessage('Paiement annulé. Le panier est conservé.')
      return
    }
    if (payment !== 'success' || !sessionId) return

    const flag = `mrz_paid_${sessionId}`
    if (sessionStorage.getItem(flag)) {
      setOrderId(sessionStorage.getItem(flag))
      setStatus('success')
      return
    }

    let cancelled = false
    setStatus('paying')
    api
      .post('/checkout/confirm', { sessionId })
      .then(({ data }) => {
        if (cancelled) return
        const order = placeOrder({
          customer: data.customer,
          items: data.items,
          note: data.note,
        })
        sessionStorage.setItem(flag, order.id)
        clearCart()
        setOrderId(order.id)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setErrorMessage(
          err.response?.data?.error || 'Le paiement n’a pas pu être confirmé.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [searchParams, placeOrder, clearCart])

  const offerDiscount = offer?.discount || 0
  const afterOffer = Math.max(
    0,
    Math.round((subtotal - offerDiscount) * 100) / 100,
  )
  const payable = coupon ? coupon.total : afterOffer

  useEffect(() => {
    if (!items.length) {
      setOffer(null)
      return undefined
    }
    let cancelled = false
    api
      .post('/offers/preview', { items })
      .then(({ data }) => {
        if (!cancelled) setOffer(data?.discount > 0 ? data : null)
      })
      .catch(() => {
        if (!cancelled) setOffer(null)
      })
    return () => {
      cancelled = true
    }
  }, [items])

  useEffect(() => {
    if (!coupon?.code) return undefined
    let cancelled = false
    api
      .post('/coupons/preview', { code: coupon.code, subtotal: afterOffer })
      .then(({ data }) => {
        if (!cancelled) setCoupon(data)
      })
      .catch((err) => {
        if (cancelled) return
        setCoupon(null)
        setCouponMessage(
          err.response?.data?.error || 'Ce coupon ne s’applique plus.',
        )
      })
    return () => {
      cancelled = true
    }
  }, [afterOffer, coupon?.code])

  const applyCoupon = async () => {
    const code = couponDraft.trim()
    if (!code) return
    setCouponBusy(true)
    setCouponMessage('')
    try {
      const { data } = await api.post('/coupons/preview', {
        code,
        subtotal: afterOffer,
      })
      setCoupon(data)
      setCouponDraft(data.code)
    } catch (err) {
      setCoupon(null)
      setCouponMessage(err.response?.data?.error || 'Ce coupon n’est pas valide.')
    } finally {
      setCouponBusy(false)
    }
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!items.length) return
    if (!customer.name.trim() || !customer.email.trim()) {
      setStatus('error')
      setErrorMessage('Nom et email sont requis.')
      return
    }

    setStatus('paying')
    setErrorMessage('')
    try {
      const { data } = await api.post('/checkout', {
        customer,
        items,
        note,
        couponCode: coupon?.code || '',
      })
      window.location.assign(data.url)
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err.response?.data?.error || 'Le paiement n’a pas pu démarrer.',
      )
    }
  }

  if (status === 'paying' && searchParams.get('payment') === 'success') {
    return (
      <section className="py-16 md:py-24">
        <NoIndex />
        <Container className="max-w-lg text-center">
          <h1 className="font-display text-4xl">Confirmation du paiement</h1>
          <p className="mt-4 text-sm text-ink/70">
            Stripe confirme votre règlement.
          </p>
        </Container>
      </section>
    )
  }

  if (status === 'success') {
    return (
      <section className="py-16 md:py-24">
        <NoIndex />
        <Container className="max-w-lg text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
            Commande envoyée
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Merci</h1>
          <p className="mt-4 text-sm text-ink/70">
            Votre paiement a bien été reçu
            {orderId ? (
              <>
                {' '}
                (commande <strong>{orderId}</strong>)
              </>
            ) : null}
            . Nous préparons votre commande.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/shop">
              Continuer vos achats
            </Button>
            <Button as={Link} to="/" variant="outline">
              Accueil
            </Button>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <div>
      <NoIndex />
      <section className="border-b border-ink/5 bg-fog py-12 md:py-16">
        <Container>
          <h1 className="font-display text-4xl md:text-5xl">Panier</h1>
          <p className="mt-2 text-sm text-ink/65">
            {items.length
              ? `${items.length} article${items.length > 1 ? 's' : ''}`
              : 'Votre panier est vide'}
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          {!items.length ? (
            <div className="max-w-md py-10 text-center sm:text-left">
              <p className="text-sm text-ink/70">
                Ajoutez des parfums depuis la boutique pour passer commande.
              </p>
              <Button as={Link} to="/shop" className="mt-6">
                Voir la boutique
              </Button>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
              <ul className="space-y-6 lg:col-span-7">
                {items.map((item) => (
                  <li
                    key={item.key}
                    className="flex gap-4 border-b border-ink/10 pb-6"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      className="h-24 w-24 shrink-0 overflow-hidden bg-fog"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/product/${item.slug}`}
                            className="font-title text-sm font-semibold uppercase tracking-wide"
                          >
                            {item.name}
                          </Link>
                          {item.volume && (
                            <p className="mt-1 text-xs text-ink/55">
                              {item.volume}
                            </p>
                          )}
                        </div>
                        <p className="tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs">
                          Qté
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.key,
                                Number(e.target.value) || 1,
                              )
                            }
                            className="w-16 border border-ink/20 px-2 py-1"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="inline-flex p-1.5 text-ink/50 hover:text-ink"
                          aria-label="Retirer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <form
                onSubmit={handleCheckout}
                className="space-y-5 lg:col-span-5"
              >
                <div className="border border-ink/10 bg-fog/60 p-5 md:p-6">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                    {coupon || offer ? 'Total après réduction' : 'Total'}
                  </p>
                  <p className="mt-1 font-display text-3xl tabular-nums">
                    {formatPrice(payable)}
                  </p>
                  {offer ? (
                    <p className="mt-2 text-sm text-ink/65">
                      Offre 2e produit − {formatPrice(offer.discount)} sur le
                      moins cher
                    </p>
                  ) : null}
                  {coupon ? (
                    <p className="mt-2 text-sm text-ink/65">
                      {formatPrice(afterOffer)} − {formatPrice(coupon.discount)}{' '}
                      ({coupon.code})
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] uppercase tracking-[0.14em] text-ink/70">
                    Code promo
                  </p>
                  <div className="flex gap-2">
                    <input
                      className="field-input uppercase"
                      value={couponDraft}
                      onChange={(e) => setCouponDraft(e.target.value.toUpperCase())}
                      placeholder="MRZ10"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponBusy}
                      className="shrink-0 border border-ink px-4 text-[11px] uppercase tracking-[0.14em] hover:bg-ink hover:text-white disabled:opacity-50"
                    >
                      {couponBusy ? '…' : 'Appliquer'}
                    </button>
                  </div>
                  {couponMessage ? (
                    <p className="mt-2 text-sm text-red-700">{couponMessage}</p>
                  ) : null}
                </div>

                <Field label="Nom complet *">
                  <input
                    className="field-input"
                    value={customer.name}
                    onChange={update('name')}
                    required
                  />
                </Field>
                <Field label="Email *">
                  <input
                    type="email"
                    className="field-input"
                    value={customer.email}
                    onChange={update('email')}
                    required
                  />
                </Field>
                <Field label="Téléphone">
                  <input
                    type="tel"
                    className="field-input"
                    value={customer.phone}
                    onChange={update('phone')}
                  />
                </Field>
                <Field label="Adresse">
                  <textarea
                    className="field-input min-h-[72px]"
                    value={customer.address}
                    onChange={update('address')}
                  />
                </Field>
                <Field label="Note">
                  <textarea
                    className="field-input min-h-[64px]"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>

                {status === 'error' && (
                  <p className="text-sm text-red-700">{errorMessage}</p>
                )}

                <Button type="submit" size="full" disabled={status === 'paying'}>
                  {status === 'paying' ? 'Redirection…' : 'Payer par carte'}
                </Button>
              </form>
            </div>
          )}
        </Container>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
        {label}
      </span>
      {children}
    </label>
  )
}
