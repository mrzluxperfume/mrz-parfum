import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  collectionDisplayName,
  collections as seedCollections,
  sortCollections,
} from '../data/collections'
import { slugify } from '../utils/productModel'
import {
  collectionFromRow,
  collectionToRow,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase'
import { resolveProductImage } from '../lib/productImageUrl'

const CollectionsContext = createContext(null)
const STORAGE_KEY = 'mrz_collections_v1'

function normalizeCollection(raw) {
  const name = String(raw?.name || '').trim()
  const slug = slugify(raw?.slug || name)
  return {
    id: String(raw?.id || slug),
    slug,
    name: collectionDisplayName(slug, name),
    description: String(raw?.description || '').trim(),
    image: resolveProductImage(raw?.image || ''),
    tone: raw?.tone || 'dark',
  }
}

function loadLocalCollections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return sortCollections(
        parsed
          .map(normalizeCollection)
          .filter((c) => c.name && c.slug && c.slug !== 'parfum-rp-paris'),
      )
      }
    }
  } catch {
    /* ignore */
  }
  return sortCollections(seedCollections.map(normalizeCollection))
}

function persistLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function CollectionsProvider({ children }) {
  const [collections, setCollections] = useState(() =>
    isSupabaseConfigured ? [] : loadLocalCollections(),
  )

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('name', { ascending: true })

      if (cancelled) return
      if (error) {
        setCollections(loadLocalCollections())
        return
      }
      setCollections(
        sortCollections(
          (data || [])
            .map((row) => normalizeCollection(collectionFromRow(row)))
            .filter((c) => c.slug !== 'parfum-rp-paris'),
        ),
      )
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback((updater) => {
    setCollections((prev) => {
      const next = sortCollections(
        typeof updater === 'function' ? updater(prev) : updater,
      )
      if (!isSupabaseConfigured) persistLocal(next)
      return next
    })
  }, [])

  const addCollection = useCallback(
    async (data) => {
      const base = slugify(data.name) || `collection-${Date.now()}`
      let collection = null
      const taken = new Set(collections.map((c) => c.slug))
      let slug = base
      let n = 2
      while (taken.has(slug)) {
        slug = `${base}-${n}`
        n += 1
      }
      collection = normalizeCollection({
        ...data,
        id: slug,
        slug,
      })

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('collections')
          .upsert(collectionToRow(collection), { onConflict: 'id' })
        if (error) throw error
      }

      commit((prev) => [...prev, collection])
      return collection
    },
    [collections, commit],
  )

  const updateCollection = useCallback(
    async (slug, data) => {
      const current = collections.find((c) => c.slug === slug || c.id === slug)
      if (!current) throw new Error('Collection introuvable')

      // Keep slug/id stable so products linked by collectionSlug stay valid.
      const updated = normalizeCollection({
        ...current,
        ...data,
        id: current.id,
        slug: current.slug,
        name: data.name ?? current.name,
        description: data.description ?? current.description,
        image: data.image ?? current.image,
        tone: data.tone ?? current.tone,
      })

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('collections')
          .upsert(collectionToRow(updated), { onConflict: 'id' })
        if (error) throw error
      }

      commit((prev) =>
        prev.map((c) =>
          c.slug === current.slug || c.id === current.id ? updated : c,
        ),
      )
      return updated
    },
    [collections, commit],
  )

  const deleteCollection = useCallback(
    async (slug) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('collections')
          .delete()
          .or(`slug.eq.${slug},id.eq.${slug}`)
        if (error) throw error
      }
      commit((prev) => prev.filter((c) => c.slug !== slug && c.id !== slug))
    },
    [commit],
  )

  const value = useMemo(
    () => ({
      collections,
      source: isSupabaseConfigured ? 'supabase' : 'local',
      addCollection,
      updateCollection,
      deleteCollection,
    }),
    [collections, addCollection, updateCollection, deleteCollection],
  )

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  )
}

export function useCollections() {
  const ctx = useContext(CollectionsContext)
  if (!ctx) {
    throw new Error('useCollections must be used within CollectionsProvider')
  }
  return ctx
}
