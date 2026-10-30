function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function latestDate(left, right) {
  if (!left) return right || null
  if (!right) return left
  return Date.parse(left) >= Date.parse(right) ? left : right
}

export async function listNewsletterAudience(supabase) {
  const [accountResult, orderResult] = await Promise.all([
    supabase
      .from('customers')
      .select('email, first_name, last_name, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('customer, created_at')
      .order('created_at', { ascending: false }),
  ])

  if (accountResult.error) throw accountResult.error
  if (orderResult.error) throw orderResult.error

  const contacts = new Map()
  for (const row of accountResult.data || []) {
    const email = normalizeEmail(row.email)
    if (!email) continue
    contacts.set(email, {
      email,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      createdAt: row.created_at || null,
      source: 'Compte client',
      newsletterConsent: true,
      fromOrder: false,
    })
  }

  for (const row of orderResult.data || []) {
    const customer = row.customer || {}
    const email = normalizeEmail(customer.email)
    if (!email) continue

    const existing = contacts.get(email)
    if (existing) {
      contacts.set(email, {
        ...existing,
        createdAt: latestDate(existing.createdAt, row.created_at),
        source: 'Compte et commande',
        newsletterConsent:
          existing.newsletterConsent || customer.newsletterOptIn === true,
        fromOrder: true,
      })
      continue
    }

    const name = String(customer.name || '').trim().split(/\s+/)
    contacts.set(email, {
      email,
      firstName: name.shift() || '',
      lastName: name.join(' '),
      createdAt: row.created_at || null,
      source: 'Commande',
      newsletterConsent: customer.newsletterOptIn === true,
      fromOrder: true,
    })
  }

  return [...contacts.values()].sort(
    (left, right) => Date.parse(right.createdAt || 0) - Date.parse(left.createdAt || 0),
  )
}