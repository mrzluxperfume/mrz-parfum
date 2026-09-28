export const formatPrice = (value, currency = 'EUR', locale = 'fr-FR') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')
