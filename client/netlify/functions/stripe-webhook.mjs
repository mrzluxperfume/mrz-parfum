import { createClient } from "@supabase/supabase-js";
import { deliverOrderEmails } from "./order-email-delivery.mjs";
import { json } from "./http.mjs";
import { reserveOrderNumber } from "./order-number.mjs";
import { persistPaidOrder } from "./paid-order.mjs";
import { stripeClient } from "./stripe-session.mjs";

const EVENT_TABLE = 'stripe_order_email_notifications'
const PAID_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
])

function getSupabase() {
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

async function setEventStatus(supabase, eventId, status, errorMessage = null) {
  const { error } = await supabase
    .from(EVENT_TABLE)
    .update({
      status,
      last_error: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId)
  if (error) throw error
}

export async function handler(event) {
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

  let supabase
  let eventRecorded = false
  try {
    supabase = getSupabase()
    const session = await stripe.checkout.sessions.retrieve(eventSession.id, {
      expand: ['line_items'],
    })
    if (session.mode !== 'payment' || session.payment_status !== 'paid') {
      return json(200, { received: true })
    }

    const lineItems = session.line_items?.data || []
    const orderNumber = await reserveOrderNumber(supabase, session.id)
    const emailSession = {
      ...session,
      metadata: { ...session.metadata, order_number: orderNumber },
    }

    await persistPaidOrder(supabase, emailSession, orderNumber)
    await ensureEvent(supabase, stripeEvent, eventSession)
    eventRecorded = true
    await deliverOrderEmails(supabase, emailSession, lineItems)

    await setEventStatus(supabase, stripeEvent.id, 'sent')
    console.log(`[stripe-webhook] Order ${orderNumber} saved and notifications processed.`)
    return json(200, { received: true })
  } catch (error) {
    console.error('[stripe-webhook]', stripeEvent.id, stripeEvent.type, error.message)
    if (supabase && eventRecorded) {
      try {
        await setEventStatus(
          supabase,
          stripeEvent.id,
          'failed',
          String(error?.message || error).slice(0, 500),
        )
      } catch (statusError) {
        console.error('[stripe-webhook] Could not record event failure:', statusError.message)
      }
    }
    return json(500, { error: 'Notification de commande impossible.' })
  }
}