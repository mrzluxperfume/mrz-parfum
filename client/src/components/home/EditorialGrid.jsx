import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Container from '../ui/Container'
import { brand } from '../../data/brand'
import { useCatalog } from '../../context/CatalogContext'

export default function EditorialGrid() {
  const { getFeaturedProducts } = useCatalog()
  const tiles = useMemo(() => {
    const images = getFeaturedProducts(8)
      .map((product) => product.image)
      .filter(Boolean)

    return [
      {
        type: 'copy',
        title: ['L’univers', 'MRZ'],
        text: brand.aboutIntro,
        cta: 'Découvrir',
        href: '/about',
      },
      {
        type: 'image',
        image: images[0],
      },
      {
        type: 'copy',
        title: ['Révéler votre', 'singularité'],
        text: "Trouvez la fragrance qui évoque l'élégance et l'émotion.",
        cta: 'Voir les nouveautés',
        href: '/shop?filter=new',
      },
      {
        type: 'image',
        image: images[1],
      },
      {
        type: 'copy',
        title: ['Une sélection', 'exquise'],
        text: brand.aboutExperience,
        cta: 'Nos parfums',
        href: '/shop',
      },
      {
        type: 'image',
        image: images[2],
      },
    ]
  }, [getFeaturedProducts])

  return (
    <section className="py-4 md:py-6">
      <Container className="!px-0 md:!px-0">
        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, index) =>
            tile.type === 'image' ? (
              <div
                key={`img-${index}`}
                className="aspect-[4/5] overflow-hidden bg-fog sm:aspect-square"
              >
                {tile.image && (
                  <img
                    src={tile.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div
                key={`copy-${index}`}
                className="flex min-h-[320px] flex-col items-center justify-center bg-ink-soft px-5 py-10 text-center text-white sm:aspect-square sm:min-h-0 sm:px-8"
              >
                <h3 className="font-title text-[24px] font-medium uppercase leading-tight sm:text-[28px] md:text-[36px] lg:text-[42px]">
                  {tile.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80 line-clamp-4 sm:line-clamp-none">
                  {tile.text}
                </p>
                <div className="mt-6">
                  <Button as={Link} to={tile.href} variant="secondary" size="sm">
                    {tile.cta}
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      </Container>
    </section>
  )
}
