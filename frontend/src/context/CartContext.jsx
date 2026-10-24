import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isPhotoUploadProduct } from '../utils/customizationMode'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'socutesyyy:cart-v1'

function lineKey(productId, summary) {
  return `${productId}::${summary}`
}

function newPhotoLineId(productId, summary) {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return `${productId}::${summary}::${id}`
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x) =>
        x &&
        typeof x.lineId === 'string' &&
        typeof x.productId === 'string' &&
        typeof x.name === 'string' &&
        typeof x.slug === 'string' &&
        typeof x.unitPrice === 'number',
    )
  } catch {
    return []
  }
}

/** Persistable fields only (no File objects). */
function serializeItems(items) {
  return items.map((x) => ({
    lineId: x.lineId,
    productId: x.productId,
    name: x.name,
    slug: x.slug,
    unitPrice: x.unitPrice,
    summary: x.summary,
    qty: x.qty,
    image: x.image || null,
    designPhotosRequired:
      typeof x.designPhotosRequired === 'number'
        ? x.designPhotosRequired
        : null,
    photosPerUnit:
      typeof x.photosPerUnit === 'number' ? x.photosPerUnit : null,
    customizationMode: x.customizationMode || null,
    photoCountHint: x.photoCountHint ?? 0,
    bouquetBundle: x.bouquetBundle || null,
  }))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart())
  const [lastAdded, setLastAdded] = useState(null)
  /** @type {[{ [lineId: string]: { file: File; previewUrl: string }[] }, function]} */
  const [linePhotos, setLinePhotos] = useState({})

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializeItems(items)))
    } catch {
      /* private mode */
    }
  }, [items])

  const clampQty = (n) =>
    Math.max(1, Math.min(99, Math.floor(Number(n)) || 1))

  const revokeLine = useCallback((photos) => {
    ;(photos || []).forEach((p) => {
      try {
        URL.revokeObjectURL(p.previewUrl)
      } catch {
        /* ignore */
      }
    })
  }, [])

  const addToCart = useCallback(
    ({
      productId,
      name,
      slug,
      unitPrice,
      summary,
      qty: addQty = 1,
      image,
      designPhotosRequired = null,
      photosPerUnit = null,
      photos = null,
      customizationMode = null,
      bouquetBundle = null,
    }) => {
      const q = clampQty(addQty)
      const photoMode = isPhotoUploadProduct(slug)
      const key = photoMode
        ? newPhotoLineId(productId, summary)
        : lineKey(productId, summary)

      setItems((prev) => {
        if (!photoMode) {
          const i = prev.findIndex((x) => x.lineId === key)
          if (i >= 0) {
            const next = [...prev]
            next[i] = {
              ...next[i],
              qty: clampQty(next[i].qty + q),
              image: next[i].image || image || null,
              bouquetBundle: bouquetBundle || next[i].bouquetBundle || null,
            }
            return next
          }
        }
        return [
          ...prev,
          {
            lineId: key,
            productId,
            name,
            slug,
            unitPrice,
            summary,
            qty: q,
            image: image || null,
            designPhotosRequired,
            photosPerUnit,
            customizationMode,
            photoCountHint: Array.isArray(photos) ? photos.length : 0,
            bouquetBundle: bouquetBundle || null,
          },
        ]
      })

      if (photoMode && Array.isArray(photos) && photos.length) {
        const entries = photos.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        }))
        setLinePhotos((prev) => ({ ...prev, [key]: entries }))
      }

      setLastAdded({ name, at: Date.now() })
    },
    [],
  )

  const setPhotosForLine = useCallback(
    (lineId, nextFiles) => {
      setLinePhotos((prev) => {
        if (prev[lineId]) revokeLine(prev[lineId])
        const entries = (nextFiles || []).map((file) =>
          file?.previewUrl
            ? file
            : {
                file,
                previewUrl: URL.createObjectURL(file),
              },
        )
        return { ...prev, [lineId]: entries }
      })
      setItems((prev) =>
        prev.map((x) =>
          x.lineId === lineId
            ? { ...x, photoCountHint: (nextFiles || []).length }
            : x,
        ),
      )
    },
    [revokeLine],
  )

  const addPhotosToLine = useCallback((lineId, fileList) => {
    const incoming = Array.from(fileList ?? [])
    if (!incoming.length) return
    setLinePhotos((prev) => {
      const added = incoming.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      const merged = [...(prev[lineId] || []), ...added]
      setItems((itemsPrev) =>
        itemsPrev.map((x) =>
          x.lineId === lineId ? { ...x, photoCountHint: merged.length } : x,
        ),
      )
      return { ...prev, [lineId]: merged }
    })
  }, [])

  const removePhotoFromLine = useCallback((lineId, index) => {
    setLinePhotos((prev) => {
      const list = [...(prev[lineId] || [])]
      const [removed] = list.splice(index, 1)
      if (removed) revokeLine([removed])
      setItems((itemsPrev) =>
        itemsPrev.map((x) =>
          x.lineId === lineId ? { ...x, photoCountHint: list.length } : x,
        ),
      )
      return { ...prev, [lineId]: list }
    })
  }, [revokeLine])

  const clearPhotosForLine = useCallback(
    (lineId) => {
      setLinePhotos((prev) => {
        if (prev[lineId]) revokeLine(prev[lineId])
        const next = { ...prev }
        delete next[lineId]
        return next
      })
      setItems((prev) =>
        prev.map((x) =>
          x.lineId === lineId ? { ...x, photoCountHint: 0 } : x,
        ),
      )
    },
    [revokeLine],
  )

  const clearLastAdded = useCallback(() => setLastAdded(null), [])

  const updateLineQty = useCallback((lineId, delta) => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.lineId !== lineId) return x
        return { ...x, qty: clampQty(x.qty + delta) }
      }),
    )
  }, [])

  const removeLine = useCallback(
    (lineId) => {
      setLinePhotos((prev) => {
        if (prev[lineId]) revokeLine(prev[lineId])
        const next = { ...prev }
        delete next[lineId]
        return next
      })
      setItems((prev) => prev.filter((x) => x.lineId !== lineId))
    },
    [revokeLine],
  )

  const clearCart = useCallback(() => {
    setLinePhotos((prev) => {
      Object.values(prev).forEach(revokeLine)
      return {}
    })
    setItems([])
  }, [revokeLine])

  const getLinePhotos = useCallback(
    (lineId) => linePhotos[lineId] || [],
    [linePhotos],
  )

  const count = useMemo(
    () => items.reduce((s, x) => s + x.qty, 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((s, x) => s + x.unitPrice * x.qty, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      linePhotos,
      addToCart,
      updateLineQty,
      removeLine,
      clearCart,
      count,
      subtotal,
      lastAdded,
      clearLastAdded,
      setPhotosForLine,
      addPhotosToLine,
      removePhotoFromLine,
      clearPhotosForLine,
      getLinePhotos,
    }),
    [
      items,
      linePhotos,
      addToCart,
      updateLineQty,
      removeLine,
      clearCart,
      count,
      subtotal,
      lastAdded,
      clearLastAdded,
      setPhotosForLine,
      addPhotosToLine,
      removePhotoFromLine,
      clearPhotosForLine,
      getLinePhotos,
    ],
  )

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
