import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { collections as seedCollections } from '../data/collections'
import { slugify } from '../utils/productModel'
import {
  collectionFromRow,
  collectionToRow,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase'

const CollectionsContext = createContext(null)
const STORAGE_KEY = 'mrz_collections_v1'

function normalizeCollection(raw) {
  const name = String(raw?.name || '').trim()
  const slug = slugify(raw?.slug || name)
  return {
    id: String(raw?.id || slug),
    slug,
    name,
    description: String(raw?.description || '').trim(),
    image: raw?.image || '',
    tone: raw?.tone || 'dark',
  }
}

function loadLocalCollections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .map(normalizeCollection)
          .filter((c) => c.name && c.slug && c.slug !== 'parfum-rp-paris')
      }
    }
  } catch {
    /* ignore */
  }
  return seedCollections.map(normalizeCollection)
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
        (data || [])
          .map((row) => normalizeCollection(collectionFromRow(row)))
          .filter((c) => c.slug !== 'parfum-rp-paris'),
      )
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback((updater) => {
    setCollections((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
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
      deleteCollection,
    }),
    [collections, addCollection, deleteCollection],
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
