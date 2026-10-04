/** Brand copy sourced from mrz-perfume.com — do not invent commercial claims. */
export const brand = {
  name: 'MRZ Perfume',
  legalName: 'MRZ Luxury Perfume',
  tagline: "L'essence du luxe",
  shortDescription:
    "Chez MRZ Luxury Perfume, nous transformons des ingrédients rares en chefs-d'œuvre. Chaque fragrance est élaborée avec minutie pour évoquer l'élégance, l'émotion et un raffinement intemporel.",
  aboutIntro:
    "MRZ vous ouvre les portes d'un espace à la découverte d'une expérience riche, immersive et accessible à tous. Notre boutique incarne cet idéal en offrant une atmosphère intime et raffinée, pensée pour permettre à chacun — amateur ou connaisseur — de vivre un moment unique.",
  aboutExperience:
    "Ici, l'expérience olfactive ne s'arrête pas au parfum ; elle s'étend à l'échange humain, à l'art du conseil et à une écoute attentive. Prenez le temps d'explorer et laissez-vous surprendre par chaque aspect de l'art de la parfumerie.",
  aboutHeadline: 'Nous sommes là pour vous guider.',
  aboutEyebrow: 'À Propos de MRZ',
  aboutTitle: 'À propos de nous',
  collectionLabel: 'Notre collection',
  historyTitle: 'Une passion devenue une maison',
  historyEyebrow: "L'histoire de MRZ",
  philosophyTitle: 'Notre Philosophie',
  history:
    "Née d'une passion pour l'élégance et le raffinement, La Maison MRZ perfume incarne un art intemporel. Chaque création raconte une histoire de beauté, de précision et d'émotion, conçue pour laisser une empreinte indélébile.",
  philosophy: {
    lines: [
      "Le luxe est un souffle d'âme, invisible mais inoubliable.",
      'Un parfum, une émotion, une empreinte.',
    ],
    attribution: 'MRZ PERFUME',
  },
  email: 'mrz.lux.perfume@gmail.com',
  houses: ['Maison MRZ', 'Lamas', 'Osma', 'Dubai'],
  contactPath: '/contact',
  social: {
    instagram: 'https://www.instagram.com/mrz_perfume_/',
    snapchat: 'https://snapchat.com/t/KHCSREPm',
    tiktok: 'https://www.tiktok.com/@mrz.perfume_?_r=1&_t=ZG-9AE5Lx04gXx',
  },
}

export const navigation = [
  { label: 'Accueil', href: '/' },
  { label: 'Trouver mon parfum', href: '/trouver-mon-parfum' },
  { label: 'Parfums', type: 'dropdown' },
  {
    label: 'À propos',
    href: '/about',
    children: [
      { label: 'Qui sommes-nous', href: '/about' },
      { label: 'Notre histoire', href: '/about/histoire' },
      { label: 'Témoignages', href: '/about/temoignages' },
    ],
  },
  {
    label: 'Blog',
    href: '/blog',
    children: [
      { label: 'Blog 1', href: '/blog' },
      { label: 'Blog 2', href: '/blog/concentrations' },
    ],
  },
  { label: 'Contact', href: '/contact' },
]

export const perfumeMegaLinks = [
  { label: 'Maison MRZ', href: '/category/maison-mrz' },
  { label: 'Lamas', href: '/category/lamas' },
  { label: 'Parfum Osma', href: '/category/parfum-osma' },
  { label: 'Collection Dubai', href: '/category/collection-dubai' },
  { label: 'Body Splash', href: '/category/body-splash' },
  { label: 'Room Diffuseur', href: '/category/room-diffuseur' },
]

/** Soft service messaging only — no invented shipping/return thresholds. */
export const topBarMessages = [
  "L'essence du luxe",
  'Maison de parfumerie MRZ',
  'Conseil & accompagnement',
]

export const trustItems = [
  {
    title: 'Conseil raffiné',
    description:
      "Une écoute attentive et l'art du conseil pour guider chaque découverte olfactive.",
    icon: 'sparkles',
  },
  {
    title: 'Expérience immersive',
    description:
      'Une atmosphère intime et raffinée, pensée pour amateur comme connaisseur.',
    icon: 'heart',
  },
  {
    title: 'Art du parfum',
    description:
      "Des ingrédients rares transformés en fragrances d'élégance et d'émotion.",
    icon: 'shield',
  },
]
