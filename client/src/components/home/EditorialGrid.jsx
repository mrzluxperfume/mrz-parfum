import { useMemo } from 'react'
import Container from '../ui/Container'
import { useCatalog } from '../../context/CatalogContext'

export default function EditorialGrid() {
  const { getFeaturedProducts } = useCatalog()
  const images = useMemo(() => {
    return getFeaturedProducts(8)
      .map((product) => product.image)
      .filter(Boolean)
      .slice(0, 3)
  }, [getFeaturedProducts])

  if (images.length === 0) return null

  return (
    <section className="py-4 md:py-6">
      <Container className="!px-0 md:!px-0">
        <div className="grid sm:grid-cols-3">
          {images.map((image) => (
            <div key={image} className="aspect-[4/5] overflow-hidden bg-fog">
              <img
                src={image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
