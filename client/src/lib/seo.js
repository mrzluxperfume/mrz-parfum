export const SITE = 'https://mrz-perfume.fr'
/** Google site name / snippet brand — matches former mrz-perfume.com SERP. */
export const SITE_NAME = 'MRZ LUXURY PERFUME'
export const DEFAULT_TITLE = 'MRZ LUXURY PERFUME'
export const DEFAULT_DESCRIPTION =
  'MRZ Luxury Perfume offers premium fragrances crafted for elegance and confidence. Discover long-lasting scents designed for modern taste.'
export const DEFAULT_IMAGE = `${SITE}/hero/slide1-photo1.webp`
export const LOGO_URL = `${SITE}/logonav2.png`
export const FAVICON_URL = `${SITE}/favicon-mrz.png`

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
  '/trouver-mon-parfum': {
    title: 'Trouver mon parfum',
    description:
      'Cinq questions, quelques instants, trois fragrances choisies dans la collection MRZ pour ce que vous cherchez vraiment.',
  },
  '/about': {
    title: 'À propos de nous',
    description:
      'Parfum Française MRZ propose des fragrances élégantes et captivantes. Découvrez l’univers MRZ Luxury Perfume.',
  },
  '/collections': {
    title: 'Marques',
    description:
      'Découvrez la marque MRZ PERFUME : Lamas, Maison MRZ, Collection Dubai, Body Splash et Parfum d’intérieur.',
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
    title: 'Parfum de Luxe',
    description:
      'Explorez le parfum de luxe avec MRZ Perfume. Découvrez des fragrances élégantes et captivantes.',
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
            brand: {
              '@type': 'Brand',
              name: SITE_NAME,
              alternateName: 'MRZ Perfume',
            },
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

/** Primary links Google may promote as sitelinks (same roles as old .com SERP). */
const HOME_NAV_LINKS = [
  {
    name: 'Musc Blanc',
    url: `${SITE}/product/musc-blanc`,
    description:
      'Un musc blanc pur et lumineux, comme une caresse sur la peau.',
  },
  {
    name: 'Parfum de Luxe',
    url: `${SITE}/blog`,
    description:
      'Explorez le parfum de luxe avec MRZ Perfume. Découvrez des fragrances élégantes.',
  },
  {
    name: 'À propos de nous',
    url: `${SITE}/about`,
    description:
      'Parfum Française MRZ propose des fragrances élégantes et captivantes.',
  },
  {
    name: 'Marques',
    url: `${SITE}/collections`,
    description:
      'Découvrez la marque MRZ PERFUME : Lamas, Maison MRZ, Collection Dubai.',
  },
  {
    name: 'MUSC Ambre',
    url: `${SITE}/product/musc-ambre`,
    description:
      'Un musc ambré chaud et charnel, comme une seconde peau.',
  },
  {
    name: 'Boutique',
    url: `${SITE}/shop`,
    description: 'Tous les parfums et collections de la maison.',
  },
]

function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: SITE_NAME,
        alternateName: ['MRZ Perfume', 'MRZ Luxury Perfume', 'Maison MRZ'],
        legalName: 'MRZ Luxury Perfume',
        url: SITE,
        logo: {
          '@type': 'ImageObject',
          url: LOGO_URL,
        },
        image: LOGO_URL,
        email: 'mrz.lux.perfume@gmail.com',
        sameAs: [
          'https://www.instagram.com/mrz_perfume_/',
          'https://www.tiktok.com/@mrz.perfume_',
          'https://snapchat.com/t/KHCSREPm',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: SITE_NAME,
        alternateName: 'MRZ Perfume',
        url: SITE,
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${SITE}/#organization` },
        inLanguage: 'fr-FR',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE}/shop?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE}/#sitelinks`,
        name: 'Navigation principale',
        itemListElement: HOME_NAV_LINKS.map((link, index) => ({
          '@type': 'SiteNavigationElement',
          position: index + 1,
          name: link.name,
          description: link.description,
          url: link.url,
        })),
      },
    ],
  }
}
