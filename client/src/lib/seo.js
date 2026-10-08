export const SITE = 'https://www.mrz-perfume.fr'
export const SITE_NAME = 'MRZ Perfume'
export const DEFAULT_TITLE =
  'MRZ Perfume Parfums de luxe aux fragrances uniques'
export const DEFAULT_DESCRIPTION =
  'Découvrez MRZ Perfume et nos parfums aux fragrances élégantes et captivantes. Trouvez votre signature olfactive et laissez votre parfum parler pour vous.'
export const DEFAULT_IMAGE = `${SITE}/hero/slide1-photo1.webp`

const PRIVATE_PREFIXES = ['/cart', '/account', '/admin']

/** Meta taken from copy already shown on each page. */
const STATIC_PAGES = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/shop': {
    title: 'Boutique',
    description: 'Tous les parfums et collections de la maison.',
  },
  '/collections': {
    title: 'Collections',
    description:
      "Explorez les univers de la maison : Lamas, Maison MRZ, Collection Dubai, Body Splash et Parfum d'intérieur.",
  },
  '/trouver-mon-parfum': {
    title: 'Trouver mon parfum',
    description:
      'Cinq questions, quelques instants, trois fragrances choisies dans la collection MRZ pour ce que vous cherchez vraiment.',
  },
  '/about': {
    title: 'Qui sommes-nous',
    description: 'Bienvenue dans l’univers MRZ.',
  },
  '/about/histoire': {
    title: 'Notre histoire',
    description: 'D’une passion pour la fragrance à la naissance de MRZ.',
  },
  '/about/temoignages': {
    title: 'Témoignages',
    description: 'Les mots de celles et ceux qui portent MRZ.',
  },
  '/blog': {
    title: 'Quel parfum est fait pour vous ?',
    description: 'Le petit guide pour trouver une fragrance qui vous ressemble.',
  },
  '/blog/concentrations': {
    title: 'Eau de parfum, eau de toilette, extrait de parfum',
    description: 'Quelle est vraiment la différence ?',
  },
  '/contact': {
    title: 'Contactez-nous',
    description:
      'Écrivez-nous par email. Nous vous répondrons dans les meilleurs délais.',
  },
  '/faq': {
    title: 'FAQ',
    description: 'Questions fréquentes sur MRZ Perfume.',
  },
  '/terms': {
    title: 'Conditions générales',
    description: 'Conditions générales de vente MRZ Perfume.',
  },
  '/privacy': {
    title: 'Politique de confidentialité',
    description: 'Politique de confidentialité de MRZ Perfume.',
  },
}

export function plainText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function clip(text, max = 160) {
  const clean = plainText(text)
  if (clean.length <= max) return clean
  const sliced = clean.slice(0, max - 1)
  const cut = sliced.replace(/\s+\S*$/, '')
  return `${cut || sliced}…`
}

export function absoluteUrl(path) {
  if (!path) return DEFAULT_IMAGE
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE}${path.startsWith('/') ? path : `/${path}`}`
}

export function withBrand(title) {
  if (!title || title === DEFAULT_TITLE) return DEFAULT_TITLE
  if (title.includes(SITE_NAME)) return title
  return `${title} | ${SITE_NAME}`
}

export function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function resolveSeo({ pathname, product, collection }) {
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/'
  const canonical = `${SITE}${path === '/' ? '/' : path}`
  const noindex = isPrivatePath(path)

  if (path.startsWith('/product/')) {
    if (!product) {
      return {
        title: withBrand('Parfum introuvable'),
        description: "Ce produit n'est pas dans le catalogue.",
        canonical,
        image: DEFAULT_IMAGE,
        noindex: true,
        type: 'website',
        jsonLd: null,
      }
    }
    const description = clip(
      product.description || `${product.name}, parfum de la maison MRZ Perfume.`,
    )
    return {
      title: withBrand(product.name),
      description,
      canonical,
      image: absoluteUrl(product.image),
      noindex: false,
      type: 'product',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Product',
            name: product.name,
            image: product.image ? [absoluteUrl(product.image)] : undefined,
            description,
            brand: { '@type': 'Brand', name: SITE_NAME },
            offers: {
              '@type': 'Offer',
              url: canonical,
              priceCurrency: 'EUR',
              price: Number(product.price) || undefined,
              availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: `${SITE}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Boutique',
                item: `${SITE}/shop`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: canonical,
              },
            ],
          },
        ],
      },
    }
  }

  if (path.startsWith('/collection/') || path.startsWith('/category/')) {
    if (!collection) {
      return {
        title: withBrand('Collection introuvable'),
        description: "Cette catégorie n'existe pas dans le catalogue MRZ.",
        canonical,
        image: DEFAULT_IMAGE,
        noindex: true,
        type: 'website',
        jsonLd: null,
      }
    }
    const description = clip(
      collection.description || `Collection ${collection.name} de MRZ Perfume.`,
    )
    return {
      title: withBrand(collection.name),
      description,
      canonical,
      image: absoluteUrl(collection.image),
      noindex: false,
      type: 'website',
      jsonLd: null,
    }
  }

  const page = STATIC_PAGES[path] || {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  }

  return {
    title: withBrand(page.title),
    description: page.description,
    canonical,
    image: DEFAULT_IMAGE,
    noindex,
    type: 'website',
    jsonLd: path === '/' ? homeJsonLd() : null,
  }
}

function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE,
        logo: `${SITE}/logonav2.png`,
        email: 'mrz.lux.perfume@gmail.com',
        sameAs: [
          'https://www.instagram.com/mrz_perfume_/',
          'https://www.tiktok.com/@mrz.perfume_',
          'https://snapchat.com/t/KHCSREPm',
        ],
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE,
      },
    ],
  }
}
