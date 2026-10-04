import BrandTimeline from '../components/about/BrandTimeline'
import { brand } from '../data/brand'

export default function HistoryPage() {
  return (
    <article>
      <BrandTimeline
        eyebrow={brand.historyEyebrow}
        title={brand.historyTitle}
      />
    </article>
  )
}
