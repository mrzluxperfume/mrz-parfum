import { useMemo, useRef, useState } from 'react'
import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useCatalog } from '../../context/CatalogContext'
import { useCollections } from '../../context/CollectionsContext'

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

const emptyForm = () => ({
  name: '',
  description: '',
  image: '',
})

export default function AdminCollectionsPage() {
  const { collections, addCollection, deleteCollection } = useCollections()
  const { products } = useCatalog()
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const photoInputRef = useRef(null)

  const counts = useMemo(() => {
    const map = new Map()
    products.forEach((product) => {
      const key = product.collectionSlug
      map.set(key, (map.get(key) || 0) + 1)
    })
    return map
  }, [products])

  const openCreate = () => {
    setForm(emptyForm())
    setError('')
    setFormOpen(true)
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
      setError('Le nom de la collection est requis.')
      return
    }
    addCollection({
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image,
    })
    setFormOpen(false)
  }

  const handleDelete = (collection) => {
    const count = counts.get(collection.slug) || 0
    const warning =
      count > 0
        ? `\n${count} produit${count > 1 ? 's restent' : ' reste'} dans le catalogue.`
        : ''
    if (
      window.confirm(
        `Supprimer la collection « ${collection.name} » ?${warning}`,
      )
    ) {
      deleteCollection(collection.slug)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl md:text-4xl">Collections</h2>
          <p className="mt-2 text-sm text-ink/65">
            Ajoutez ou supprimez une collection du catalogue.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-3.5 w-3.5" />
          Ajouter une collection
        </Button>
      </div>

      <div className="overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-fog text-[10px] uppercase tracking-[0.14em] text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Collection</th>
              <th className="px-4 py-3 font-medium">Produits</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr
                key={collection.id}
                className="border-b border-ink/5 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden bg-fog">
                      {collection.image ? (
                        <img
                          src={collection.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium">{collection.name}</p>
                      <p className="text-xs text-ink/50">
                        {collection.description || collection.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {counts.get(collection.slug) || 0}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(collection)}
                      className="inline-flex border border-ink/15 p-2 text-red-700 transition hover:border-red-700"
                      aria-label={`Supprimer ${collection.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-sm text-ink/50"
                >
                  Aucune collection.
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
              <h3 className="font-display text-2xl">Nouvelle collection</h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-1 text-ink/50 hover:text-ink"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
                  Nom
                </span>
                <input
                  className="field-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/70">
                  Description
                </span>
                <textarea
                  className="field-input min-h-[80px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </label>
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
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="inline-flex items-center gap-2 border border-ink/20 px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition hover:border-ink"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Importer une photo
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button type="submit" className="flex-1">
                Ajouter
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
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
