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

/** Options réutilisées dans l’admin produit. */
export const MATCH_UNIVERS = questions[0].options
export const MATCH_MOMENTS = questions[1].options
export const MATCH_PRESENCE = questions[3].options
export const MATCH_TRAITS = [
  { id: 'sucre', label: 'Profil sucré / gourmand' },
  { id: 'puissant', label: 'Sillage puissant' },
  { id: 'oud', label: 'Contient de l’oud' },
  { id: 'fleuri', label: 'Profil très fleuri' },
]

const UNIVERS_IDS = new Set(MATCH_UNIVERS.map((o) => o.id))
const MOMENT_IDS = new Set(MATCH_MOMENTS.map((o) => o.id))
const PRESENCE_IDS = new Set(MATCH_PRESENCE.map((o) => o.id))
const TRAIT_IDS = new Set(MATCH_TRAITS.map((o) => o.id))

export function emptyMatchProfile() {
  return {
    univers: [],
    moments: [],
    presence: '',
    traits: [],
  }
}

export function normalizeMatchProfile(raw) {
  let value = raw
  if (!value) return emptyMatchProfile()
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return emptyMatchProfile()
    }
  }
  if (typeof value !== 'object') return emptyMatchProfile()

  const univers = Array.isArray(value.univers)
    ? [...new Set(value.univers.map(String).filter((id) => UNIVERS_IDS.has(id)))]
    : []
  const moments = Array.isArray(value.moments)
    ? [...new Set(value.moments.map(String).filter((id) => MOMENT_IDS.has(id)))]
    : []
  const traits = Array.isArray(value.traits)
    ? [...new Set(value.traits.map(String).filter((id) => TRAIT_IDS.has(id)))]
    : []
  const presence = PRESENCE_IDS.has(String(value.presence || ''))
    ? String(value.presence)
    : ''

  return { univers, moments, presence, traits }
}

/** Un produit n’entre dans le quiz que s’il a une vraie config admin. */
export function hasMatchConfiguration(product) {
  const profile = normalizeMatchProfile(product?.matchProfile)
  return (
    profile.univers.length > 0 &&
    profile.moments.length > 0 &&
    Boolean(profile.presence)
  )
}

export function productTags(product) {
  return new Set(normalizeMatchProfile(product?.matchProfile).univers)
}

function intersects(a = [], b = []) {
  const setB = new Set(b)
  return a.some((id) => setB.has(id))
}

function inBudget(price, budget) {
  if (!budget || budget === 'any') return true
  if (budget === 'under-20') return price <= 20
  if (budget === 'mid') return price > 20 && price <= 40
  if (budget === 'over') return price > 40
  return true
}

/**
 * Filtre strict : uniquement les produits configurés qui matchent
 * exactement les réponses du quiz (univers, moments, présence, traits, budget).
 */
function matchesAnswersExactly(product, answers) {
  if (!hasMatchConfiguration(product)) return false
  if (!product.inStock) return false
  if (typeof product.price !== 'number') return false
  if (!inBudget(product.price, answers.budget)) return false

  const profile = normalizeMatchProfile(product.matchProfile)
  const wantedUnivers = answers.univers || []
  const wantedMoments = answers.moments || []
  const avoid = (answers.avoid || []).filter((id) => id !== 'aucun')
  const presence = answers.presence

  // Univers : au moins un univers sélectionné doit être dans la config produit.
  if (wantedUnivers.length > 0 && !intersects(profile.univers, wantedUnivers)) {
    return false
  }

  // Moments : au moins un moment sélectionné doit être dans la config produit.
  if (wantedMoments.length > 0 && !intersects(profile.moments, wantedMoments)) {
    return false
  }

  // Présence : doit être identique à celle configurée sur le produit.
  if (presence && profile.presence !== presence) {
    return false
  }

  // Évitements : si le produit porte un trait évité, on l’exclut.
  for (const trait of avoid) {
    if (profile.traits.includes(trait)) return false
  }

  return true
}

function scoreConfiguredMatch(product, answers) {
  const profile = normalizeMatchProfile(product.matchProfile)
  let score = 0

  for (const id of answers.univers || []) {
    if (profile.univers.includes(id)) score += 40
  }
  for (const id of answers.moments || []) {
    if (profile.moments.includes(id)) score += 30
  }
  if (answers.presence && profile.presence === answers.presence) score += 35

  // Bonus if product univers is subset of answers (more precise).
  if (
    (answers.univers || []).length > 0 &&
    profile.univers.every((id) => (answers.univers || []).includes(id))
  ) {
    score += 12
  }

  return score
}

export function recommendPerfumes(products, answers) {
  const configured = (products || []).filter(hasMatchConfiguration)
  if (configured.length === 0) return []

  const matches = configured
    .filter((product) => matchesAnswersExactly(product, answers))
    .map((product) => ({
      product,
      score: scoreConfiguredMatch(product, answers),
    }))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)

  if (matches.length === 0) return []

  const top = matches.slice(0, 3)
  const best = top[0]?.score || 1

  return top.map((item) => ({
    product: item.product,
    affinity: Math.max(
      72,
      Math.min(98, Math.round((item.score / Math.max(best, 1)) * 96)),
    ),
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
