/** Display order for the Parfums menu, filters and collection grids. */
export const collectionOrder = [
  'lamas',
  'maison-mrz',
  'collection-dubai',
  'body-splash',
  'room-diffuseur',
]

const displayNames = {
  'room-diffuseur': "Parfum d'intérieur",
}

export function sortCollections(list) {
  const rank = new Map(collectionOrder.map((slug, index) => [slug, index]))
  return [...list].sort((a, b) => {
    const left = rank.has(a.slug) ? rank.get(a.slug) : collectionOrder.length
    const right = rank.has(b.slug) ? rank.get(b.slug) : collectionOrder.length
    if (left !== right) return left - right
    return a.name.localeCompare(b.name, 'fr')
  })
}

export function collectionDisplayName(slug, name) {
  return displayNames[slug] || name
}

/** Official MRZ collections = product categories from mrz-perfume.com */
export const collections = [
  {
    id: 'lamas',
    slug: 'lamas',
    name: 'Lamas',
    description: 'Collection exclusive Lamas',
    image:
      'https://mrz-perfume.com/wp-content/uploads/2025/11/LAMAS-NAVY.jpg',
    tone: 'warm',
  },
  {
    id: 'maison-mrz',
    slug: 'maison-mrz',
    name: 'Maison MRZ',
    description: 'Collection exclusive de la Maison',
    image:
      'https://mrz-perfume.com/wp-content/uploads/2025/12/image0-1.png',
    tone: 'dark',
  },
  {
    id: 'collection-dubai',
    slug: 'collection-dubai',
    name: 'Collection Dubai',
    description: 'Parfums de Dubaï — collection luxe',
    image:
      'https://mrz-perfume.com/wp-content/uploads/2025/11/AMEERAT-NOIR.webp',
    tone: 'gold',
  },
  {
    id: 'body-splash',
    slug: 'body-splash',
    name: 'Body Splash',
    description: 'Brumes et body splash',
    image:
      'https://mrz-perfume.com/wp-content/uploads/2025/11/BRUME-CORPORELLE-MUSC.jpg',
    tone: 'light',
  },
  {
    id: 'room-diffuseur',
    slug: 'room-diffuseur',
    name: "Parfum d'intérieur",
    description: "Parfums d'ambiance",
    image:
      'https://mrz-perfume.com/wp-content/uploads/2025/11/DIFFUSEUR-OUD.jpg',
    tone: 'warm',
  },
  {
    id: 'parfum-osma',
    slug: 'parfum-osma',
    name: 'Parfum Osma',
    description: 'Collection exclusive Osma',
    image:
      'https://mrz-perfume.com/wp-content/uploads/2025/11/CITRUS-F.webp',
    tone: 'light',
  },
]

/** Same taxonomy — categories mirror collections on MRZ. */
export const categories = collections.map((c) => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  description: c.description,
  image: c.image,
}))
