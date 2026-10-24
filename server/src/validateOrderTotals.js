import { validateOrderBouquetRules } from './bouquetBundle.js'

/** Must match [frontend/src/utils/orderFlow.js](frontend/src/utils/orderFlow.js) */
export const DELIVERY_CHARGE_RS = 300

function roundMoney(n) {
  return Math.max(0, Math.round(Number(n) || 0))
}

function splitAdvancePayment(fullTotal) {
  const n = roundMoney(fullTotal)
  const advance = Math.floor(n / 2)
  return { advance, balanceOnDelivery: n - advance }
}

function expectedOrderTotal(lineSubtotal, includeDelivery) {
  return roundMoney(lineSubtotal) + (includeDelivery ? DELIVERY_CHARGE_RS : 0)
}

/**
 * Ensures client-reported totals match shop rules (delivery + 50/50 split).
 * Bouquet customized lines are recalculated authoritatively first.
 * @param {object} body - same shape as POST /api/orders body
 * @returns {string | null} error message or null if ok
 */
export function validateOrderTotals(body) {
  // 1) Authoritative bouquet pricing BEFORE total checks
  const bouquetErr = validateOrderBouquetRules(body)
  if (bouquetErr) return bouquetErr

  const includeDelivery = body.includeDelivery === true
  const qty = Math.max(1, Math.min(99, Math.floor(Number(body.orderQty) || 1)))
  const unitPrice = Number(body.unitPrice)
  if (Number.isNaN(unitPrice) || unitPrice < 0) {
    return 'Invalid unitPrice'
  }

  let lineSubtotal
  if (body.checkoutSource === 'cart') {
    if (!Array.isArray(body.cartSnapshot) || body.cartSnapshot.length === 0) {
      return 'cartSnapshot required for cart checkout'
    }
    let sum = 0
    for (const line of body.cartSnapshot) {
      const q = Math.max(1, Math.min(99, Math.floor(Number(line.qty) || 1)))
      const p = Number(line.unitPrice)
      if (Number.isNaN(p) || p < 0) return 'Invalid cart line price'
      sum += p * q
    }
    lineSubtotal = sum
    // Keep payload fields consistent after bouquet rewrite
    body.unitPrice = roundMoney(lineSubtotal)
    body.orderQty = 1
  } else {
    lineSubtotal = unitPrice * qty
  }

  const expectedTotal = expectedOrderTotal(lineSubtotal, includeDelivery)
  const { advance, balanceOnDelivery } = splitAdvancePayment(expectedTotal)

  // Authoritative totals — do not trust client money fields after bouquet rewrite
  body.orderTotal = expectedTotal
  body.advanceAmount = advance
  body.balanceOnDelivery = balanceOnDelivery

  return null
}
