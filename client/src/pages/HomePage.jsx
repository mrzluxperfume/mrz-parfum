import Hero from '../components/home/Hero'
import CollectionsGrid from '../components/home/CollectionsGrid'
import CategoryNav from '../components/home/CategoryNav'
import EditorialGrid from '../components/home/EditorialGrid'
import HomeTestimonials from '../components/home/HomeTestimonials'
import ProductCarousel from '../components/product/ProductCarousel'
import { useCatalog } from '../context/CatalogContext'

export default function HomePage() {
  const { getFeaturedProducts } = useCatalog()
  const featured = getFeaturedProducts(8)

  return (
    <>
      <Hero />
      <ProductCarousel
        title="Nos parfums"
        products={featured}
        href="/shop"
        linkLabel="Voir tout"
      />
      <CollectionsGrid />
      <EditorialGrid />
      <HomeTestimonials />
      <CategoryNav />
    </>
  )
}
