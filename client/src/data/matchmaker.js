export const questions = [
  {
    id: 'univers',
    title: 'Votre univers',
    hint: 'Choisissez-en un ou deux.',
    max: 2,
    exclusive: null,
    options: [
      { id: 'gourmand', label: 'Le dessert', caption: 'Gourmand', icon: 'cake' },
      { id: 'boise', label: 'Le bois', caption: 'Boisé', icon: 'trees' },
      { id: 'ambre', label: 'La chaleur', caption: 'Ambré', icon: 'sun' },
      { id: 'floral', label: 'Le bouquet', caption: 'Floral', icon: 'flower' },
      { id: 'musque', label: 'La peau propre', caption: 'Musqué', icon: 'spark' },
      { id: 'frais', label: 'Le grand air', caption: 'Frais', icon: 'wind' },
      { id: 'fruite', label: 'Le fruit', caption: 'Fruité', icon: 'apple' },
      { id: 'cuir', label: 'Le feu', caption: 'Cuir et fumé', icon: 'flame' },
    ],
  },
  {
    id: 'moments',
    title: 'Où on vous imagine',
    hint: 'Un ou deux moments.',
    max: 2,
    exclusive: null,
    options: [
      { id: 'terrasse', label: 'Terrasse d’été', icon: 'sun' },
      { id: 'bureau', label: 'Au bureau', icon: 'monitor' },
      { id: 'diner', label: 'Dîner du soir', icon: 'utensils' },
      { id: 'air', label: 'Le grand air', icon: 'mountain' },
      { id: 'nuit', label: 'Sortie de nuit', icon: 'moon' },
      { id: 'occasion', label: 'Grande occasion', icon: 'star' },
    ],
  },
  {
    id: 'avoid',
    title: 'Ce dont vous ne voulez pas',
    hint: 'Plusieurs réponses possibles. Ou aucune.',
    max: 5,
    exclusive: 'aucun',
    options: [
      { id: 'sucre', label: 'Trop sucré', caption: 'Les gourmands passeront après' },
      { id: 'puissant', label: 'Trop puissant', caption: 'On écarte les sillages lourds' },
      { id: 'oud', label: 'L’oud', caption: 'Boisé dense et médicinal' },
      { id: 'fleuri', label: 'Trop fleuri', caption: 'Les bouquets passeront après' },
      { id: 'aucun', label: 'Rien à éviter', caption: 'Je suis ouvert à tout' },
    ],
  },
  {
    id: 'presence',
    title: 'Votre présence',
    hint: 'Une seule réponse.',
    max: 1,
    exclusive: null,
    options: [
      { id: 'discrete', label: 'Discrète', caption: 'On vous sent de près' },
      { id: 'equilibree', label: 'Équilibrée', caption: 'On vous remarque' },
      { id: 'affirmee', label: 'Affirmée', caption: 'On se retourne' },
    ],
  },
  {
    id: 'budget',
    title: 'Votre budget',
    hint: 'Une seule réponse.',
    max: 1,
    exclusive: null,
    options: [
      { id: 'under-20', label: 'Jusqu’à 20 €' },
      { id: 'mid', label: '20 à 40 €' },
      { id: 'over', label: 'Au-delà de 40 €' },
      { id: 'any', label: 'Peu importe', caption: 'Le jus avant le prix' },
    ],
  },
]

const NAME_TAGS = [
  [/vanille|vanilla|marshmallow|sh.?mallow|fluff|po[eè]me|d[eé]licieuse/i, ['gourmand']],
  [/oud|bois/i, ['boise']],
  [/ambre|amber|gold/i, ['ambre']],
  [/rose|jasmin|jasm|yara|fleur|bella|grenade/i, ['floral']],
  [/musc|musk|powder|poudre|paudrey/i, ['musque']],
  [/citrus|frais|diamond|bahar/i, ['frais']],
  [/fruit|grenade|berry|blueberry|passion/i, ['fruite']],
  [/noir|black|nuit|feu|cuir|fum|rouge/i, ['cuir']],
]

const MOMENT_TAGS = {
  terrasse: ['frais', 'fruite', 'floral'],
  bureau: ['musque', 'frais'],
  diner: ['ambre', 'gourmand', 'floral'],
  air: ['frais', 'boise'],
  nuit: ['cuir', 'ambre', 'boise'],
  occasion: ['ambre', 'floral', 'cuir'],
}

export function productTags(product) {
  const tags = new Set()
  const text = `${product.name} ${product.collection || ''} ${product.description || ''}`
  for (const [pattern, list] of NAME_TAGS) {
    if (pattern.test(text)) list.forEach((tag) => tags.add(tag))
  }
  if (product.collectionSlug === 'body-splash') tags.add('musque')
  if (product.collectionSlug === 'room-diffuseur') tags.add('frais')
  return tags
}

function inBudget(price, budget) {
  if (!budget || budget === 'any') return true
  if (budget === 'under-20') return price <= 20
  if (budget === 'mid') return price > 20 && price <= 40
  if (budget === 'over') return price > 40
  return true
}

function scoreProduct(product, answers) {
  const tags = productTags(product)
  let score = 36

  for (const id of answers.univers || []) {
    if (tags.has(id)) score += 24
  }
  for (const id of answers.moments || []) {
    const wanted = MOMENT_TAGS[id] || []
    if (wanted.some((tag) => tags.has(tag))) score += 14
  }

  const avoid = answers.avoid || []
  if (avoid.includes('sucre') && tags.has('gourmand')) score -= 34
  if (avoid.includes('oud') && /oud/i.test(product.name)) score -= 40
  if (avoid.includes('fleuri') && tags.has('floral')) score -= 30
  if (avoid.includes('puissant')) {
    if (tags.has('cuir') || tags.has('boise') || product.price >= 50) score -= 22
  }

  const presence = answers.presence
  if (presence === 'discrete') {
    if (product.collectionSlug === 'body-splash' || tags.has('musque') || tags.has('frais')) {
      score += 16
    }
    if (product.price >= 50) score -= 10
  }
  if (presence === 'equilibree') {
    if (product.price >= 20 && product.price <= 45) score += 14
  }
  if (presence === 'affirmee') {
    if (product.price > 40 || tags.has('cuir') || tags.has('boise') || tags.has('ambre')) {
      score += 16
    }
  }

  if (product.collectionSlug === 'room-diffuseur') score -= 18
  if (!product.inStock) score -= 50
  return score
}

export function recommendPerfumes(products, answers) {
  const priced = products.filter((product) => typeof product.price === 'number')
  let pool = priced.filter((product) => inBudget(product.price, answers.budget))
  if (pool.length < 3) pool = priced

  const ranked = pool
    .map((product) => ({ product, score: scoreProduct(product, answers) }))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)

  const top = ranked.slice(0, 3)
  const best = top[0]?.score || 1

  return top.map((item) => ({
    product: item.product,
    affinity: Math.max(70, Math.min(96, Math.round((item.score / best) * 94))),
  }))
}

export function profileLine(answers) {
  const univers = questions[0].options.filter((option) =>
    answers.univers?.includes(option.id),
  )
  const moments = questions[1].options.filter((option) =>
    answers.moments?.includes(option.id),
  )
  const presence = questions[3].options.find(
    (option) => option.id === answers.presence,
  )
  const bits = [
    ...univers.map((option) => option.caption || option.label),
    ...moments.map((option) => option.label),
  ]
  if (presence) bits.push(`présence ${presence.label.toLowerCase()}`)
  return bits.join(' · ')
}
