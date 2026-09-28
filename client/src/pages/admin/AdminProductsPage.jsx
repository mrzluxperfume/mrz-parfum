import { useMemo, useRef, useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useCatalog } from '../../context/CatalogContext'
import { useCollections } from '../../context/CollectionsContext'
import { formatPrice } from '../../utils/format'
import { SIZE_OPTIONS, slugify } from '../../utils/productModel'

const emptyForm = (collections = []) => ({
  name: '',
  image: '',
  collectionSlug: collections[0]?.slug || '',
  description: '',
  featured: false,
  newProduct: true,
  inStock: true,
  sizes: SIZE_OPTIONS.map((volume) => ({
    volume,
    price: '',
    enabled: volume === '100 ml',
  })),
})

function readImportedPhoto(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const maxEdge = 900
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('photo'))
    }
    img.src = objectUrl
  })
}

function productToForm(product, collections = []) {
  return {
    name: product.name || '',
    image: product.image || '',
    collectionSlug: product.collectionSlug || collections[0]?.slug || '',
    description: product.description || '',
    featured: Boolean(product.featured),
    newProduct: Boolean(product.newProduct),
    inStock: product.inStock !== false,
    sizes: SIZE_OPTIONS.map((volume) => {
      const found = product.sizes?.find((s) => s.volume === volume)
      return {
        volume,
        price: found ? String(found.price) : '',
        enabled: Boolean(found?.enabled),
      }
    }),
  }
}

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useCatalog()
  const { collections } = useCollections()
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const photoInputRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.collection?.toLowerCase().includes(q),
    )
  }, [products, query])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm(collections))
    setError('')
    setFormOpen(true)
  }

  const openEdit = (product) => {
    setEditingId(product.id)
    setForm(productToForm(product, collections))
    setError('')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setError('')
  }

  const updateSize = (volume, patch) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) =>
        s.volume === volume ? { ...s, ...patch } : s,
      ),
    }))
  }

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choisissez une image (JPG, PNG ou WebP).')
      return
    }
    try {
      const image = await readImportedPhoto(file)
      setForm((prev) => ({ ...prev, image }))
      setError('')
    } catch {
      setError('Cette photo n’a pas pu être importée.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Le nom du produit est requis.')
      return
    }
    const enabledSizes = form.sizes.filter((s) => s.enabled)
    if (enabledSizes.length === 0) {
      setError('Choisissez au moins un format : 50 ml ou 100 ml.')
      return
    }
    for (const size of enabledSizes) {
      const price = Number(size.price)
      if (!price || price <= 0) {
        setError(`Indiquez un prix valide pour ${size.volume}.`)
        return
      }
    }

    const col =
      collections.find((c) => c.slug === form.collectionSlug) || collections[0]
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.name),
      image: form.image.trim(),
      brand: col?.name || '',
      category: col?.name || '',
      categorySlug: col?.slug || '',
      collection: col?.name || '',
      collectionSlug: col?.slug || '',
      description: form.description.trim() || null,
      featured: form.featured,
      newProduct: form.newProduct,
      inStock: form.inStock,
      sizes: form.sizes.map((s) => ({
        volume: s.volume,
        price: Number(s.price) || 0,
        enabled: Boolean(s.enabled),
      })),
    }

    if (editingId != null) {
      updateProduct(editingId, payload)
    } else {
      addProduct(payload)
    }
    closeForm()
  }

  const handleDelete = (product) => {
    if (
      window.confirm(`Supprimer « ${product.name} » du catalogue ?`)
    ) {
      deleteProduct(product.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl md:text-4xl">Produits</h2>
          <p className="mt-2 text-sm text-ink/65">
            Gérez le catalogue et les formats 50 ml / 100 ml.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-3.5 w-3.5" />
          Ajouter un produit
        </Button>
      </div>

      <input
        type="search"
        placeholder="Rechercher un produit…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="field-input max-w-md"
      />

      <div className="overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-fog text-[10px] uppercase tracking-[0.14em] text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Produit</th>
              <th className="px-4 py-3 font-medium">Collection</th>
              <th className="px-4 py-3 font-medium">Formats</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const enabled = (product.sizes || []).filter((s) => s.enabled)
              return (
                <tr
                  key={product.id}
                  className="border-b border-ink/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden bg-fog">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-ink/50">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{product.collection}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {enabled.length === 0 && (
                        <span className="text-xs text-ink/40">—</span>
                      )}
                      {enabled.map((s) => (
                        <span
                          key={s.volume}
                          className="border border-ink/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                        >
                          {s.volume}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {enabled.length === 0
                      ? formatPrice(product.price)
                      : enabled.length === 1
                        ? formatPrice(enabled[0].price)
                        : `dès ${formatPrice(product.price)}`}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.inStock ? 'text-forest' : 'text-ink/40'
                      }
                    >
                      {product.inStock ? 'En stock' : 'Rupture'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="inline-flex border border-ink/15 p-2 transition hover:border-ink"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="inline-flex border border-ink/15 p-2 text-red-700 transition hover:border-red-700"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-ink/50"
                >
                  Aucun produit trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-ink/10 bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl">
                  {editingId != null ? 'Modifier le produit' : 'Nouveau produit'}
                </h3>
                <p className="mt-1 text-xs text-ink/60">
                  Activez 50 ml et/ou 100 ml selon le choix.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="p-1 text-ink/50 hover:text-ink"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Nom">
                <input
                  className="field-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </Field>
              <div>
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
                  Photo
                </span>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="sr-only"
                  onChange={handlePhoto}
                />
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden border border-ink/10 bg-fog">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 border border-ink/20 px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition hover:border-ink"
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      Importer une photo
                    </button>
                    {form.image ? (
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, image: '' }))}
                        className="text-xs text-ink/55 underline-offset-2 hover:text-ink hover:underline"
                      >
                        Retirer la photo
                      </button>
                    ) : (
                      <p className="text-xs text-ink/50">
                        JPG, PNG ou WebP depuis votre ordinateur.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Field label="Collection">
                <select
                  className="field-input"
                  value={form.collectionSlug}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      collectionSlug: e.target.value,
                    }))
                  }
                >
                  {collections.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <textarea
                  className="field-input min-h-[80px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </Field>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-ink/70">
                  Formats
                </p>
                <div className="space-y-3 border border-ink/10 p-3">
                  {form.sizes.map((size) => (
                    <div
                      key={size.volume}
                      className="flex flex-wrap items-center gap-3"
                    >
                      <label className="inline-flex min-w-[90px] items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={size.enabled}
                          onChange={(e) =>
                            updateSize(size.volume, {
                              enabled: e.target.checked,
                            })
                          }
                        />
                        {size.volume}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={!size.enabled}
                        placeholder="Prix €"
                        value={size.price}
                        onChange={(e) =>
                          updateSize(size.volume, { price: e.target.value })
                        }
                        className="field-input max-w-[140px] disabled:opacity-40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, inStock: e.target.checked }))
                    }
                  />
                  En stock
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, featured: e.target.checked }))
                    }
                  />
                  Mis en avant
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.newProduct}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, newProduct: e.target.checked }))
                    }
                  />
                  Nouveauté
                </label>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button type="submit" className="flex-1">
                {editingId != null ? 'Enregistrer' : 'Ajouter'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
        {label}
      </span>
      {children}
    </label>
  )
}
