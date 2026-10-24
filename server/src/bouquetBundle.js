/**
 * Mini Bouquet — keep in sync with frontend/src/utils/bouquetBundle.js
 *
 * Customized unit price = Σ(qty × unitPrice). No RS. 4,000 base.
 * Server recalculates authoritatively and overwrites client money fields.
 */

export const MINI_BOUQUET_SLUG = 'mini-bouquet'
export const BOUQUET_STANDARD_PRICE_RS = 4000
export const BOUQUET_QTY_SOFT_MAX = 999

export const BOUQUET_BUNDLE_ITEMS = Object.freeze([
  { id: 'polaroids', label: 'Polaroids', defaultQty: 5, unitPrice: 100 },
  { id: 'hair-clip', label: 'Hair clip', defaultQty: 1, unitPrice: 250 },
  { id: 'pendant', label: 'Pendant', defaultQty: 1, unitPrice: 650 },
  { id: 'bracelet', label: 'Bracelet', defaultQty: 1, unitPrice: 450 },
  { id: 'earrings', label: 'Earrings', defaultQty: 1, unitPrice: 450 },
  { id: 'lip-gloss', label: 'Lip gloss', defaultQty: 1, unitPrice: 500 },
  { id: 'jelly-tint', label: 'Jelly tint', defaultQty: 1, unitPrice: 550 },
])

function sanitizeQty(value) {
  const n = Math.floor(Number(value))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(BOUQUET_QTY_SOFT_MAX, n)
}

/**
 * @param {Record<string, number>} qtys
 */
export function calculateBouquetTotal(qtys) {
  let sum = 0
  for (const item of BOUQUET_BUNDLE_ITEMS) {
    sum += sanitizeQty(qtys?.[item.id]) * item.unitPrice
  }
  return Math.round(sum)
}

/**
 * Parse + validate item list; return qtys or throw error string via return.
 * @param {unknown} snapshot
 * @returns {{ ok: true, qtys: Record<string, number>, total: number } | { ok: false, error: string }}
 */
function parseCustomSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return { ok: false, error: 'Bouquet selection required' }
  }
  if (snapshot.mode !== 'custom') {
    return { ok: false, error: 'Invalid bouquet mode' }
  }
  if (!Array.isArray(snapshot.items)) {
    return { ok: false, error: 'Invalid bouquet items' }
  }

  /** @type {Record<string, number>} */
  const qtys = {}
  for (const item of BOUQUET_BUNDLE_ITEMS) qtys[item.id] = 0

  for (const raw of snapshot.items) {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Invalid bouquet item' }
    }
    const def = BOUQUET_BUNDLE_ITEMS.find((i) => i.id === raw.id)
    if (!def) {
      return { ok: false, error: `Unknown bouquet item: ${raw.id}` }
    }
    qtys[def.id] = sanitizeQty(raw.qty)
  }

  if (!BOUQUET_BUNDLE_ITEMS.some((i) => qtys[i.id] > 0)) {
    return { ok: false, error: 'Select at least one bouquet item' }
  }

  const total = calculateBouquetTotal(qtys)
  if (total <= 0) {
    return { ok: false, error: 'Customized bouquet total must be greater than zero' }
  }

  return { ok: true, qtys, total }
}

/**
 * Kept for tests — validates client total matches authoritative.
 * @param {unknown} snapshot
 * @param {number} unitPrice
 */
export function validateBouquetSnapshot(snapshot, unitPrice) {
  const parsed = parseCustomSnapshot(snapshot)
  if (!parsed.ok) return parsed.error
  if (Math.round(Number(snapshot.totalRs) || 0) !== parsed.total) {
    return `Bouquet total mismatch (expected RS. ${parsed.total})`
  }
  if (Math.round(Number(unitPrice) || 0) !== parsed.total) {
    return `Bouquet unit price must be RS. ${parsed.total}`
  }
  return null
}

/**
 * Mutates body: overwrites customized unit prices with authoritative totals.
 * @param {object} body
 * @returns {string | null}
 */
export function validateOrderBouquetRules(body) {
  if (!body || typeof body !== 'object') return null

  if (body.checkoutSource === 'product') {
    if (body.slug === MINI_BOUQUET_SLUG && body.bouquetBundle) {
      const parsed = parseCustomSnapshot(body.bouquetBundle)
      if (!parsed.ok) return parsed.error
      body.unitPrice = parsed.total
      body.bouquetBundle = {
        ...body.bouquetBundle,
        mode: 'custom',
        totalRs: parsed.total,
        items: BOUQUET_BUNDLE_ITEMS.map((item) => ({
          id: item.id,
          label: item.label,
          qty: parsed.qtys[item.id],
          unitPrice: item.unitPrice,
          subtotalRs: Math.round(parsed.qtys[item.id] * item.unitPrice),
        })),
      }
      return null
    }
    return null
  }

  if (body.checkoutSource === 'cart' && Array.isArray(body.cartSnapshot)) {
    for (const line of body.cartSnapshot) {
      if (!line || line.slug !== MINI_BOUQUET_SLUG || !line.bouquetBundle) {
        continue
      }
      const parsed = parseCustomSnapshot(line.bouquetBundle)
      if (!parsed.ok) return parsed.error
      line.unitPrice = parsed.total
      line.bouquetBundle = {
        ...line.bouquetBundle,
        mode: 'custom',
        totalRs: parsed.total,
        items: BOUQUET_BUNDLE_ITEMS.map((item) => ({
          id: item.id,
          label: item.label,
          qty: parsed.qtys[item.id],
          unitPrice: item.unitPrice,
          subtotalRs: Math.round(parsed.qtys[item.id] * item.unitPrice),
        })),
      }
    }
  }

  return null
}
