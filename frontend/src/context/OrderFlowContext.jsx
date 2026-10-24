import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

/**
 * @typedef {{ file: File; previewUrl: string }} OrderFile
 * @typedef {{
 *   lineId: string
 *   productId: string
 *   name: string
 *   slug: string
 *   unitPrice: number
 *   summary: string
 *   qty: number
 *   designPhotosRequired?: number | null
 *   photosPerUnit?: number | null
 * }} CartLineSnapshot
 * @typedef {{
 *   fullName: string
 *   phone: string
 *   city: string
 *   address: string
 *   notes: string
 *   includeDelivery: boolean
 * }} CustomerData
 */

const OrderFlowContext = createContext(null)

function revokeAll(mapOrList) {
  if (Array.isArray(mapOrList)) {
    mapOrList.forEach((f) => {
      try {
        URL.revokeObjectURL(f.previewUrl)
      } catch {
        /* ignore */
      }
    })
    return
  }
  Object.values(mapOrList || {}).forEach((list) => revokeAll(list))
}

export function OrderFlowProvider({ children }) {
  const [checkoutSource, setCheckoutSource] = useState('product')
  const [cartSnapshot, setCartSnapshot] = useState(null)
  const [slug, setSlug] = useState(null)
  const [productName, setProductName] = useState('')
  const [unitPrice, setUnitPrice] = useState(0)
  const [orderQty, setOrderQty] = useState(1)
  const [selectionSummary, setSelectionSummary] = useState('')
  /** Mini Bouquet customized package snapshot (product checkout only) */
  const [bouquetBundle, setBouquetBundle] = useState(null)
  /** Buy-now flat file list (also mirrored into lineFiles under buy-now line id) */
  const [files, setFiles] = useState([])
  /** @type {[{ [lineId: string]: OrderFile[] }, function]} */
  const [lineFiles, setLineFiles] = useState({})
  const [customer, setCustomer] = useState(null)
  const [serverOrderId, setServerOrderId] = useState(null)
  /** Extra meta for photo requirements on buy-now */
  const [buyNowPhotoMeta, setBuyNowPhotoMeta] = useState({
    designPhotosRequired: null,
    photosPerUnit: null,
    productId: null,
  })

  const clearOrder = useCallback(() => {
    setFiles((prev) => {
      revokeAll(prev)
      return []
    })
    setLineFiles((prev) => {
      revokeAll(prev)
      return {}
    })
    setCheckoutSource('product')
    setCartSnapshot(null)
    setSlug(null)
    setProductName('')
    setUnitPrice(0)
    setOrderQty(1)
    setSelectionSummary('')
    setBouquetBundle(null)
    setCustomer(null)
    setServerOrderId(null)
    setBuyNowPhotoMeta({
      designPhotosRequired: null,
      photosPerUnit: null,
      productId: null,
    })
  }, [])

  /**
   * @param {CartLineSnapshot[]} items
   * @param {{ [lineId: string]: OrderFile[] }} [photosByLine]
   */
  const setCheckoutFromCart = useCallback((items, photosByLine = {}) => {
    if (!items?.length) return
    const snapshot = items.map((i) => ({ ...i }))
    const subtotal = snapshot.reduce((s, i) => s + i.unitPrice * i.qty, 0)
    const nameLine = snapshot.map((i) => i.name).join(', ')
    setFiles((prev) => {
      revokeAll(prev)
      return []
    })
    setLineFiles((prev) => {
      revokeAll(prev)
      /** Copy preview URLs — Files stay the same object references from cart */
      const next = {}
      for (const line of snapshot) {
        const src = photosByLine[line.lineId]
        if (src?.length) {
          next[line.lineId] = src.map((f) => ({
            file: f.file,
            previewUrl: f.previewUrl,
          }))
        }
      }
      return next
    })
    setCheckoutSource('cart')
    setCartSnapshot(snapshot)
    setSlug('checkout')
    setProductName(nameLine)
    setUnitPrice(subtotal)
    setOrderQty(1)
    setSelectionSummary(
      snapshot.map((i) => `${i.name} ×${i.qty}`).join('; '),
    )
    setBouquetBundle(null)
    setServerOrderId(null)
  }, [])

  const setOrderMeta = useCallback(
    ({
      slug: s,
      name,
      price,
      summary,
      quantity,
      designPhotosRequired = null,
      photosPerUnit = null,
      productId = null,
      initialFiles = null,
      bouquetBundle: bouquet = null,
    }) => {
      setCheckoutSource('product')
      setCartSnapshot(null)
      setServerOrderId(null)
      setSlug(s)
      setProductName(name ?? '')
      setUnitPrice(typeof price === 'number' ? price : 0)
      setSelectionSummary(summary ?? '')
      setBouquetBundle(bouquet || null)
      const q = Math.max(1, Math.min(99, Math.floor(Number(quantity)) || 1))
      setOrderQty(q)
      setBuyNowPhotoMeta({
        designPhotosRequired,
        photosPerUnit,
        productId,
      })
      setLineFiles((prev) => {
        revokeAll(prev)
        return {}
      })
      setFiles((prev) => {
        revokeAll(prev)
        if (Array.isArray(initialFiles) && initialFiles.length) {
          return initialFiles.map((entry) => {
            const f = entry?.file instanceof File ? entry.file : entry
            if (!(f instanceof File)) return null
            return { file: f, previewUrl: URL.createObjectURL(f) }
          }).filter(Boolean)
        }
        return []
      })
    },
    [],
  )

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      revokeAll(prev)
      return []
    })
  }, [])

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList ?? [])
    setFiles((prev) => {
      const added = incoming.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      return [...prev, ...added]
    })
  }, [])

  const removeFileAt = useCallback((index) => {
    setFiles((prev) => {
      const copy = [...prev]
      const [removed] = copy.splice(index, 1)
      if (removed) revokeAll([removed])
      return copy
    })
  }, [])

  const setLineFilesFor = useCallback((lineId, nextList) => {
    setLineFiles((prev) => {
      if (prev[lineId]) revokeAll(prev[lineId])
      const entries = (nextList || []).map((file) =>
        file?.previewUrl
          ? file
          : { file, previewUrl: URL.createObjectURL(file) },
      )
      return { ...prev, [lineId]: entries }
    })
  }, [])

  const addFilesToLine = useCallback((lineId, fileList) => {
    const incoming = Array.from(fileList ?? [])
    if (!incoming.length) return
    setLineFiles((prev) => {
      const added = incoming.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      return { ...prev, [lineId]: [...(prev[lineId] || []), ...added] }
    })
  }, [])

  const removeFileFromLine = useCallback((lineId, index) => {
    setLineFiles((prev) => {
      const list = [...(prev[lineId] || [])]
      const [removed] = list.splice(index, 1)
      if (removed) revokeAll([removed])
      return { ...prev, [lineId]: list }
    })
  }, [])

  const clearLineFiles = useCallback((lineId) => {
    setLineFiles((prev) => {
      if (prev[lineId]) revokeAll(prev[lineId])
      const next = { ...prev }
      delete next[lineId]
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      checkoutSource,
      cartSnapshot,
      slug,
      productName,
      unitPrice,
      orderQty,
      selectionSummary,
      bouquetBundle,
      files,
      lineFiles,
      customer,
      serverOrderId,
      buyNowPhotoMeta,
      setCheckoutFromCart,
      setOrderMeta,
      clearFiles,
      addFiles,
      removeFileAt,
      setLineFilesFor,
      addFilesToLine,
      removeFileFromLine,
      clearLineFiles,
      setCustomer,
      setServerOrderId,
      clearOrder,
    }),
    [
      checkoutSource,
      cartSnapshot,
      slug,
      productName,
      unitPrice,
      orderQty,
      selectionSummary,
      bouquetBundle,
      files,
      lineFiles,
      customer,
      serverOrderId,
      buyNowPhotoMeta,
      setCheckoutFromCart,
      setOrderMeta,
      clearFiles,
      addFiles,
      removeFileAt,
      setLineFilesFor,
      addFilesToLine,
      removeFileFromLine,
      clearLineFiles,
      setCustomer,
      clearOrder,
    ],
  )

  return (
    <OrderFlowContext.Provider value={value}>
      {children}
    </OrderFlowContext.Provider>
  )
}

export function useOrderFlow() {
  const ctx = useContext(OrderFlowContext)
  if (!ctx) {
    throw new Error('useOrderFlow must be used within OrderFlowProvider')
  }
  return ctx
}
