const EVENT_TABLE = 'stripe_order_email_notifications'
const PAID_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
])

function getSupabase(createClient) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Configuration Supabase manquante')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function ensureEvent(supabase, event, session) {
  const { error } = await supabase.from(EVENT_TABLE).insert({
    stripe_event_id: event.id,
    checkout_session_id: session.id,
    status: 'processing',
  })
  if (!error || error.code === '23505') return
  throw error
}

async function markEventSent(supabase, eventId) {
  const { error } = await supabase
    .from(EVENT_TABLE)
    .update({ status: 'sent', last_error: null, updated_at: new Date().toISOString() })
    .eq('stripe_event_id', eventId)
  if (error) throw error
}

exports.handler = async function handler(event) {
  const { json } = await import('./http.mjs')
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Méthode non autorisée.' })
  }

  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!signingSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is missing')
    return json(500, { error: 'Webhook Stripe non configuré.' })
  }

  const headers = event.headers || {}
  const signature = headers['stripe-signature'] || headers['Stripe-Signature']
  if (!signature || !event.body) {
    return json(400, { error: 'Signature Stripe manquante.' })
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : event.body

  let stripe
  let stripeEvent
  try {
    const { stripeClient } = await import('./stripe-session.mjs')
    stripe = stripeClient()
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, signingSecret)
  } catch (error) {
    if (/signature|No signatures found|timestamp/i.test(error.message || '')) {
      console.error('[stripe-webhook] Invalid signature:', error.message)
      return json(400, { error: 'Signature Stripe invalide.' })
    }
    console.error('[stripe-webhook] Stripe initialization failed:', error.message)
    return json(500, { error: 'Initialisation Stripe impossible.' })
  }

  if (!PAID_EVENTS.has(stripeEvent.type)) {
    return json(200, { received: true })
  }

  const eventSession = stripeEvent.data.object
  if (eventSession.mode !== 'payment' || eventSession.payment_status !== 'paid') {
    return json(200, { received: true })
  }

  try {
    const [supabaseModule, orderModule, paidOrderModule, emailDeliveryModule] = await Promise.all([
      import('@supabase/supabase-js'),
      import('./order-number.mjs'),
      import('./paid-order.mjs'),
      import('./order-email-delivery.mjs'),
    ])
    const supabase = getSupabase(supabaseModule.createClient)

    const session = await stripe.checkout.sessions.retrieve(eventSession.id, {
      expand: ['line_items'],
    })
    const lineItems = session.line_items?.data || []
    const orderNumber = await orderModule.reserveOrderNumber(supabase, session.id)
    const emailSession = {
      ...session,
      metadata: { ...session.metadata, order_number: orderNumber },
    }

    await paidOrderModule.persistPaidOrder(supabase, emailSession, orderNumber)
    await ensureEvent(supabase, stripeEvent, eventSession)
    await emailDeliveryModule.deliverOrderEmails(supabase, emailSession, lineItems)

    await markEventSent(supabase, stripeEvent.id)
    console.log(`[stripe-webhook] Order ${orderNumber} saved and notifications processed.`)
    return json(200, { received: true })
  } catch (error) {
    console.error('[stripe-webhook]', stripeEvent.id, stripeEvent.type, error.message)
    return json(500, { error: 'Notification de commande impossible.' })
  }
}