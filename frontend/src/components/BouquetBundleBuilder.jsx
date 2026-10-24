import {
  BOUQUET_BUNDLE_ITEMS,
  BOUQUET_QTY_SOFT_MAX,
  bouquetCartAllowed,
  calculateBouquetTotal,
  getBouquetLineDetails,
  getDefaultBouquetQtys,
  sanitizeBouquetItemQty,
} from '../utils/bouquetBundle'

/**
 * @param {{
 *   qtys: Record<string, number>
 *   onChange: (next: Record<string, number>) => void
 * }} props
 */
export function BouquetBundleBuilder({ qtys, onChange }) {
  const lines = getBouquetLineDetails(qtys)
  const total = calculateBouquetTotal(qtys)
  const canCheckout = bouquetCartAllowed(qtys, total)

  const setQty = (id, qty) => {
    onChange({ ...qtys, [id]: sanitizeBouquetItemQty(qty) })
  }

  const restoreItem = (id) => {
    const item = BOUQUET_BUNDLE_ITEMS.find((i) => i.id === id)
    if (!item) return
    setQty(id, Math.max(1, item.defaultQty))
  }

  const resetAll = () => onChange(getDefaultBouquetQtys())

  return (
    <div className="bouquet-builder">
      <div className="bouquet-builder__head">
        <p className="bouquet-builder__eyebrow">Customize Your Bundle</p>
        <p className="bouquet-builder__lede">
          Make it yours! Add or remove items and watch your bouquet price
          update instantly.
        </p>
      </div>

      <ul className="bouquet-builder__list" role="list">
        {lines.map((line) => {
          const removed = line.qty <= 0
          return (
            <li
              key={line.id}
              className={`bouquet-builder__row${removed ? ' bouquet-builder__row--removed' : ''}`}
            >
              <div className="bouquet-builder__meta">
                <span className="bouquet-builder__label">{line.label}</span>
                <span className="bouquet-builder__unit">
                  RS. {line.unitPrice.toLocaleString()} each
                </span>
                {!removed && (
                  <span className="bouquet-builder__line-sub">
                    Subtotal RS. {line.subtotalRs.toLocaleString()}
                  </span>
                )}
              </div>

              {removed ? (
                <button
                  type="button"
                  className="bouquet-builder__restore"
                  onClick={() => restoreItem(line.id)}
                >
                  Add back
                </button>
              ) : (
                <div className="bouquet-builder__qty">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.label}`}
                    className="bouquet-builder__qty-btn"
                    disabled={line.qty <= 0}
                    onClick={() => setQty(line.id, line.qty - 1)}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={BOUQUET_QTY_SOFT_MAX}
                    step={1}
                    className="bouquet-builder__qty-input"
                    aria-label={`${line.label} quantity`}
                    value={line.qty}
                    onChange={(e) => setQty(line.id, e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={`Increase ${line.label}`}
                    className="bouquet-builder__qty-btn"
                    disabled={line.qty >= BOUQUET_QTY_SOFT_MAX}
                    onClick={() => setQty(line.id, line.qty + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="bouquet-builder__remove"
                    onClick={() => setQty(line.id, 0)}
                    aria-label={`Remove ${line.label}`}
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="bouquet-builder__totals" aria-live="polite">
        <div className="bouquet-builder__total-row bouquet-builder__total-row--final">
          <span>Your customized total</span>
          <strong>RS. {total.toLocaleString()}</strong>
        </div>
        {!canCheckout && (
          <p className="bouquet-builder__remaining">
            Select at least one item to continue.
          </p>
        )}
        {canCheckout && (
          <p className="bouquet-builder__ready">
            Bundle ready — RS. {total.toLocaleString()}
          </p>
        )}
      </div>

      <button
        type="button"
        className="bouquet-builder__reset"
        onClick={resetAll}
      >
        Reset to original bouquet contents
      </button>
    </div>
  )
}
