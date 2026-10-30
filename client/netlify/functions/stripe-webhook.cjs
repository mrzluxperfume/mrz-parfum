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

async function claimDelivery(supabase, eventId, column) {
  const { data, error } = await supabase
    .from(EVENT_TABLE)
    .update({ [column]: 'processing', last_error: null, updated_at: new Date().toISOString() })
    .eq('stripe_event_id', eventId)
    .in(column, ['pending', 'failed'])
    .select('stripe_event_id')
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

async function setDeliveryStatus(supabase, eventId, column, status) {
  const { error } = await supabase
    .from(EVENT_TABLE)
    .update({
      [column]: status,
      status: status === 'failed' ? 'failed' : 'processing',
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId)
  if (error) throw error
}

async function logDeliveryFailure(supabase, eventId, column, error) {
  const { error: updateError } = await supabase
    .from(EVENT_TABLE)
    .update({
      [column]: 'failed',
      status: 'failed',
      last_error: String(error?.message || error).slice(0, 500),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId)
  if (updateError) {
    console.error('[stripe-webhook] Could not record failure:', updateError.message)
  }
}

async function sendOnce(supabase, eventId, column, send) {
  if (!(await claimDelivery(supabase, eventId, column))) return
  try {
    await send()
    await setDeliveryStatus(supabase, eventId, column, 'sent')
  } catch (error) {
    await logDeliveryFailure(supabase, eventId, column, error)
    throw error
  }
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
    const [supabaseModule, orderModule, mailModule] = await Promise.all([
      import('@supabase/supabase-js'),
      import('./order-number.mjs'),
      import('./mail.mjs'),
    ])
    const supabase = getSupabase(supabaseModule.createClient)
    await ensureEvent(supabase, stripeEvent, eventSession)

    const session = await stripe.checkout.sessions.retrieve(eventSession.id, {
      expand: ['line_items'],
    })
    const lineItems = session.line_items?.data || []
    const orderNumber = await orderModule.reserveOrderNumber(supabase, session.id)
    const emailSession = {
      ...session,
      metadata: { ...session.metadata, order_number: orderNumber },
    }

    const emailErrors = []
    for (const [column, send] of [
      ['merchant_email_status', () => mailModule.sendOrderNotification({ session: emailSession, lineItems })],
      ['customer_email_status', () => mailModule.sendCustomerOrderConfirmation({ session: emailSession, lineItems })],
    ]) {
      try {
        await sendOnce(supabase, stripeEvent.id, column, send)
      } catch (error) {
        emailErrors.push(`${column}: ${error.message || error}`)
      }
    }
    if (emailErrors.length) throw new Error(emailErrors.join('; '))

    await markEventSent(supabase, stripeEvent.id)
    return json(200, { received: true })
  } catch (error) {
    console.error('[stripe-webhook]', stripeEvent.id, stripeEvent.type, error.message)
    return json(500, { error: 'Notification de commande impossible.' })
  }
}