/**
 * Mini Bouquet — two modes:
 * - standard: fixed RS. 4,000 (product.price)
 * - custom: SUM(qty × approvedUnitPrice) — no 4,000 base / minimum
 *
 * Unit prices apply ONLY to the customized bundle builder.
 */

export const MINI_BOUQUET_SLUG = 'mini-bouquet'
export const BOUQUET_STANDARD_PRICE_RS = 4000

/** Soft cap against abusive payloads; not a shopping UX limit of 2/5/10. */
export const BOUQUET_QTY_SOFT_MAX = 999

/**
 * @type {ReadonlyArray<{ id: string, label: string, defaultQty: number, unitPrice: number }>}
 */
export const BOUQUET_BUNDLE_ITEMS = Object.freeze([
  { id: 'polaroids', label: 'Polaroids', defaultQty: 5, unitPrice: 100 },
  { id: 'hair-clip', label: 'Hair clip', defaultQty: 1, unitPrice: 250 },
  { id: 'pendant', label: 'Pendant', defaultQty: 1, unitPrice: 650 },
  { id: 'bracelet', label: 'Bracelet', defaultQty: 1, unitPrice: 450 },
  { id: 'earrings', label: 'Earrings', defaultQty: 1, unitPrice: 450 },
  { id: 'lip-gloss', label: 'Lip gloss', defaultQty: 1, unitPrice: 500 },
  { id: 'jelly-tint', label: 'Jelly tint', defaultQty: 1, unitPrice: 550 },
])

export function isMiniBouquetSlug(slug) {
  return slug === MINI_BOUQUET_SLUG
}

/** @returns {Record<string, number>} */
export function getDefaultBouquetQtys() {
  /** @type {Record<string, number>} */
  const q = {}
  for (const item of BOUQUET_BUNDLE_ITEMS) {
    q[item.id] = item.defaultQty
  }
  return q
}

/**
 * Sanitize one quantity: non-negative finite integer, soft-capped.
 * @param {unknown} value
 */
export function sanitizeBouquetItemQty(value) {
  const n = Math.floor(Number(value))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(BOUQUET_QTY_SOFT_MAX, n)
}

/**
 * @param {Record<string, number> | null | undefined} qtys
 * @returns {Record<string, number>}
 */
export function clampBouquetQtys(qtys) {
  /** @type {Record<string, number>} */
  const next = {}
  for (const item of BOUQUET_BUNDLE_ITEMS) {
    next[item.id] = sanitizeBouquetItemQty(qtys?.[item.id])
  }
  return next
}

export function bouquetItemsHavePrices() {
  return BOUQUET_BUNDLE_ITEMS.every(
    (item) => typeof item.unitPrice === 'number' && item.unitPrice >= 0,
  )
}

/**
 * Customized unit price = Σ(qty × unitPrice). No 4000 base.
 * @param {Record<string, number>} qtys
 * @returns {number}
 */
export function calculateBouquetTotal(qtys) {
  const clamped = clampBouquetQtys(qtys)
  let sum = 0
  for (const item of BOUQUET_BUNDLE_ITEMS) {
    sum += clamped[item.id] * item.unitPrice
  }
  return Math.round(sum)
}

/**
 * @param {Record<string, number>} qtys
 */
export function getBouquetLineDetails(qtys) {
  const clamped = clampBouquetQtys(qtys)
  return BOUQUET_BUNDLE_ITEMS.map((item) => {
    const qty = clamped[item.id]
    const subtotal = Math.round(qty * item.unitPrice)
    return {
      id: item.id,
      label: item.label,
      qty,
      unitPrice: item.unitPrice,
      subtotalRs: subtotal,
      standardQty: item.defaultQty,
    }
  })
}

/**
 * @param {Record<string, number>} qtys
 */
export function getBouquetPriceBreakdown(qtys) {
  const lines = getBouquetLineDetails(qtys)
  const total = calculateBouquetTotal(qtys)
  return {
    lines,
    totalRs: total,
    pricesConfigured: true,
  }
}

/**
 * @param {Record<string, number>} qtys
 */
export function bouquetHasAnyItems(qtys) {
  const clamped = clampBouquetQtys(qtys)
  return BOUQUET_BUNDLE_ITEMS.some((item) => clamped[item.id] > 0)
}

/**
 * @param {Record<string, number>} qtys
 * @param {number | null | undefined} total
 */
export function bouquetCartAllowed(qtys, total) {
  if (!bouquetHasAnyItems(qtys)) return false
  const t = total == null ? calculateBouquetTotal(qtys) : Number(total)
  return Number.isFinite(t) && t > 0
}

/**
 * @param {Record<string, number>} qtys
 */
export function formatBouquetSummary(qtys) {
  const lines = getBouquetLineDetails(qtys).filter((l) => l.qty > 0)
  if (!lines.length) return 'Customized bundle (empty)'
  const parts = lines.map((l) =>
    l.qty === 1 ? l.label : `${l.label} × ${l.qty}`,
  )
  return `Customized bundle: ${parts.join(', ')}`
}

/**
 * @param {Record<string, number>} qtys
 */
export function buildBouquetSnapshot(qtys) {
  const clamped = clampBouquetQtys(qtys)
  const total = calculateBouquetTotal(clamped)
  return {
    mode: 'custom',
    items: BOUQUET_BUNDLE_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      qty: clamped[item.id],
      unitPrice: item.unitPrice,
      subtotalRs: Math.round(clamped[item.id] * item.unitPrice),
    })),
    totalRs: total,
  }
}

/**
 * Server-style validation + authoritative recalculation.
 * @param {unknown} snapshot
 * @param {number} unitPrice
 * @returns {string | null}
 */
export function validateBouquetSnapshot(snapshot, unitPrice) {
  if (!snapshot || typeof snapshot !== 'object') {
    return 'Bouquet selection required'
  }
  const s = /** @type {{ mode?: string, items?: unknown, totalRs?: unknown }} */ (
    snapshot
  )
  if (s.mode !== 'custom') return 'Invalid bouquet mode'
  if (!Array.isArray(s.items)) return 'Invalid bouquet items'

  /** @type {Record<string, number>} */
  const qtys = {}
  for (const item of BOUQUET_BUNDLE_ITEMS) qtys[item.id] = 0

  for (const raw of s.items) {
    if (!raw || typeof raw !== 'object') return 'Invalid bouquet item'
    const row = /** @type {{ id?: string, qty?: unknown }} */ (raw)
    const def = BOUQUET_BUNDLE_ITEMS.find((i) => i.id === row.id)
    if (!def) return `Unknown bouquet item: ${row.id}`
    const qty = sanitizeBouquetItemQty(row.qty)
    qtys[def.id] = qty
  }

  if (!bouquetHasAnyItems(qtys)) {
    return 'Select at least one bouquet item'
  }

  const expected = calculateBouquetTotal(qtys)
  const reported = Math.round(Number(s.totalRs) || 0)
  if (reported !== expected) {
    return `Bouquet total mismatch (expected RS. ${expected})`
  }
  const price = Math.round(Number(unitPrice) || 0)
  if (price !== expected) {
    return `Bouquet unit price must be RS. ${expected}`
  }
  return null
}

/** @deprecated aliases */
export const BOUQUET_PACKAGE_PRICE_RS = BOUQUET_STANDARD_PRICE_RS
export const getSelectedBouquetLines = (qtys) =>
  getBouquetLineDetails(qtys).filter((l) => l.qty > 0)
export const getMissingBouquetPriceItems = () => []
