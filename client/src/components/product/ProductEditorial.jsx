import { Link } from 'react-router-dom'

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function RichParagraph({ text, highlights = [] }) {
  const terms = highlights.filter(Boolean)
  if (!terms.length) {
    return (
      <p className="text-[15px] leading-[1.7] text-[#2a2a2a] md:text-base">
        {text}
      </p>
    )
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
  const parts = String(text).split(pattern)
  const lowerTerms = terms.map((t) => t.toLowerCase())

  return (
    <p className="text-[15px] leading-[1.7] text-[#2a2a2a] md:text-base">
      {parts.map((part, i) =>
        lowerTerms.includes(part.toLowerCase()) ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  )
}

function NoteBlock({ label, value }) {
  if (!value) return null
  return (
    <div className="space-y-1.5">
      <p className="text-[15px] font-semibold text-ink md:text-[16px]">
        {label} :
      </p>
      <p className="text-[15px] text-[#2a2a2a]">{value}</p>
    </div>
  )
}

export default function ProductEditorial({ product }) {
  const notes = product?.fragranceNotes
  const hasNotes = Boolean(notes?.top || notes?.heart || notes?.base)
  const paragraphs = String(product?.description || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (!paragraphs.length && !hasNotes) return null

  const highlights = [
    product?.name,
    product?.name ? `${product.name} HOMME` : null,
    product?.name ? `${product.name} Homme` : null,
    'il se vit !',
  ].filter(Boolean)

  return (
    <div className="relative mt-8 md:mt-10">
      {(product.collection || product.category) && (
        <p className="text-[14px] text-[#2a2a2a] md:text-[15px]">
          Catégorie{' '}
          <Link
            to={`/collection/${product.collectionSlug || product.categorySlug}`}
            className="font-semibold text-ink transition hover:opacity-70"
          >
            {product.collection || product.category}
          </Link>
        </p>
      )}

      {paragraphs.length > 0 && (
        <div className="mt-6 md:mt-8">
          <h2 className="font-display text-[1.85rem] font-normal text-ink md:text-[2rem]">
            Description
          </h2>
          <div className="mt-5 space-y-4">
            {paragraphs.map((paragraph) => (
              <RichParagraph
                key={paragraph.slice(0, 40)}
                text={paragraph}
                highlights={highlights}
              />
            ))}
          </div>
        </div>
      )}

      {hasNotes && (
        <div className="relative mt-12 overflow-hidden py-8 md:mt-14 md:py-10">
          <img
            src="/product/floral-watermark.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 w-[min(420px,95%)] -translate-x-1/2 -translate-y-[42%] opacity-30"
          />
          <div className="relative text-center">
            <h2 className="font-display text-[2rem] font-normal leading-tight text-ink md:text-[2.4rem]">
              Pyramide Olfactive
            </h2>
            <div className="mt-8 space-y-6">
              <NoteBlock label="Note de tête" value={notes.top} />
              <NoteBlock label="Note de coeur" value={notes.heart} />
              <NoteBlock label="Note de fond" value={notes.base} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
