import { createClient } from '@supabase/supabase-js'
import { json } from './http.mjs'
import { sendOrderNotification } from './mail.mjs'
import { stripeClient } from './stripe-session.mjs'

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

async function claimEvent(supabase, event, session) {
  const { error: insertError } = await supabase.from(EVENT_TABLE).insert({
    stripe_event_id: event.id,
    checkout_session_id: session.id,
    status: 'processing',
  })

  if (!insertError) return true
  if (insertError.code !== '23505') throw insertError

  const { data: existing, error: readError } = await supabase
    .from(EVENT_TABLE)
    .select('status')
    .eq('stripe_event_id', event.id)
    .maybeSingle()
  if (readError) throw readError
  if (existing?.status !== 'failed') return false

  const { data: retry, error: retryError } = await supabase
    .from(EVENT_TABLE)
    .update({ status: 'processing', last_error: null, updated_at: new Date().toISOString() })
    .eq('stripe_event_id', event.id)
    .eq('status', 'failed')
    .select('stripe_event_id')
    .maybeSingle()
  if (retryError) throw retryError
  return Boolean(retry)
}

async function markFailed(supabase, eventId, error) {
  const { error: updateError } = await supabase
    .from(EVENT_TABLE)
    .update({
      status: 'failed',
      last_error: String(error?.message || error).slice(0, 500),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId)
  if (updateError) console.error('[stripe-webhook] Could not record failure:', updateError.message)
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
  const stripe = stripeClient()
  let stripeEvent

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, signingSecret)
  } catch (error) {
    console.error('[stripe-webhook] Invalid signature:', error.message)
    return json(400, { error: 'Signature Stripe invalide.' })
  }

  if (!PAID_EVENTS.has(stripeEvent.type)) {
    return json(200, { received: true })
  }

  const eventSession = stripeEvent.data.object
  if (eventSession.mode !== 'payment' || eventSession.payment_status !== 'paid') {
    return json(200, { received: true })
  }

  let supabase
  try {
    supabase = getSupabase()
    const claimed = await claimEvent(supabase, stripeEvent, eventSession)
    if (!claimed) return json(200, { received: true, duplicate: true })

    try {
      const session = await stripe.checkout.sessions.retrieve(eventSession.id, {
        expand: ['line_items'],
      })
      await sendOrderNotification({
        session,
        lineItems: session.line_items?.data || [],
      })
    } catch (error) {
      await markFailed(supabase, stripeEvent.id, error)
      throw error
    }

    const { error: sentError } = await supabase
      .from(EVENT_TABLE)
      .update({ status: 'sent', last_error: null, updated_at: new Date().toISOString() })
      .eq('stripe_event_id', stripeEvent.id)
    if (sentError) {
      console.error('[stripe-webhook] Email sent but status update failed:', sentError.message)
    }
    return json(200, { received: true })
  } catch (error) {
    console.error('[stripe-webhook]', error.message)
    return json(500, { error: 'Notification de commande impossible.' })
  }
}