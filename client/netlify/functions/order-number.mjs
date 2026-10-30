export async function reserveOrderNumber(supabase, checkoutSessionId) {
  if (!supabase) throw new Error('Supabase indisponible pour numéroter la commande')
  if (!/^cs_[A-Za-z0-9_]+$/.test(String(checkoutSessionId || ''))) {
    throw new Error('Session Stripe invalide pour numéroter la commande')
  }

  const { data, error } = await supabase.rpc('get_or_create_order_number', {
    p_checkout_session_id: checkoutSessionId,
  })
  if (error) throw error

  const orderNumber = String(data || '')
  if (!/^MR\d{5}$/.test(orderNumber)) {
    throw new Error('Numéro de commande invalide retourné par Supabase')
  }
  return orderNumber
}