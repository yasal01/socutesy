import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProductBySlug } from '../utils/products'
import {
  getPhotoUploadLines,
  getOrderTotalAmount,
  splitAdvancePayment,
  isWhatsAppCustomProduct,
} from '../utils/orderFlow'
import {
  defaultSelection,
  getPrice,
  getSelectionSummary,
} from '../utils/pricing'
import { CustomerForm } from '../components/CustomerForm'
import { LinePhotoUpload } from '../components/LinePhotoUpload'
import { useOrderFlow } from '../context/OrderFlowContext'
import { createOrder, uploadOrderLinePhotos } from '../api/ordersApi'

export default function CustomerFormPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isCartCheckout = location.pathname === '/checkout/customer'
  const product = isCartCheckout ? null : getProductBySlug(slug)
  const {
    files,
    lineFiles,
    customer,
    setCustomer,
    setOrderMeta,
    setCheckoutFromCart,
    checkoutSource,
    cartSnapshot,
    productName,
    unitPrice,
    orderQty,
    selectionSummary,
    bouquetBundle,
    setServerOrderId,
    addFiles,
    removeFileAt,
    clearFiles,
    addFilesToLine,
    removeFileFromLine,
    clearLineFiles,
    buyNowPhotoMeta,
  } = useOrderFlow()
  const [saveError, setSaveError] = useState(null)
  const [photoErrors, setPhotoErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isCartCheckout) return
    const fromNav = location.state?.cartItems
    const fromPhotos = location.state?.linePhotos || {}
    if (Array.isArray(fromNav) && fromNav.length && checkoutSource !== 'cart') {
      setCheckoutFromCart(fromNav, fromPhotos)
    }
  }, [isCartCheckout, location.state, checkoutSource, setCheckoutFromCart])

  useEffect(() => {
    if (isCartCheckout) {
      if (checkoutSource === 'cart' && cartSnapshot?.length) return
      if (location.state?.cartItems?.length) return
      navigate('/', { replace: true })
      return
    }
    if (!product) {
      navigate('/', { replace: true })
    }
  }, [
    isCartCheckout,
    checkoutSource,
    cartSnapshot,
    location.state,
    product,
    navigate,
  ])

  useEffect(() => {
    if (isCartCheckout || !product) return
    const st = location.state
    if (st?.price != null && st?.summary != null) {
      setOrderMeta({
        slug: product.slug,
        name: product.name,
        price: st.price,
        summary: st.summary,
        quantity: st.quantity ?? 1,
        designPhotosRequired: st.designPhotosRequired ?? null,
        photosPerUnit: st.photosPerUnit ?? product.photosPerUnit ?? null,
        productId: product.id,
        initialFiles: st.initialFiles || null,
      })
      return
    }
    const sel = defaultSelection(product)
    setOrderMeta({
      slug: product.slug,
      name: product.name,
      price: getPrice(product, sel),
      summary: getSelectionSummary(product, sel),
      quantity: 1,
      photosPerUnit: product.photosPerUnit ?? null,
      productId: product.id,
    })
  }, [isCartCheckout, product, slug, location.state, setOrderMeta])

  if (isCartCheckout) {
    if (checkoutSource !== 'cart' || !cartSnapshot?.length) return null
  } else if (!product) {
    return null
  }

  const photoLines = getPhotoUploadLines({
    checkoutSource: isCartCheckout ? 'cart' : 'product',
    slug: isCartCheckout ? null : slug,
    productName: isCartCheckout ? null : productName,
    orderQty,
    cartSnapshot: isCartCheckout
      ? cartSnapshot
      : [
          {
            lineId: `buy-now:${slug}`,
            slug,
            name: productName,
            qty: orderQty,
            productId: buyNowPhotoMeta.productId || product?.id,
            designPhotosRequired: buyNowPhotoMeta.designPhotosRequired,
            photosPerUnit:
              buyNowPhotoMeta.photosPerUnit ?? product?.photosPerUnit,
          },
        ],
  })

  const whatsappHintLines = isCartCheckout
    ? (cartSnapshot || []).filter((l) => isWhatsAppCustomProduct(l.slug))
    : product && isWhatsAppCustomProduct(product.slug)
      ? [{ name: product.name }]
      : []

  const filesForLine = (lineId) => {
    if (!isCartCheckout && photoLines[0]?.lineId === lineId) {
      return files
    }
    return lineFiles[lineId] || []
  }

  const handleSubmit = async (data) => {
    setSaveError(null)
    setPhotoErrors({})
    setSaving(true)
    try {
      const nextErrors = {}
      for (const line of photoLines) {
        const list = filesForLine(line.lineId)
        if (list.length < line.min) {
          nextErrors[line.lineId] =
            `Please add at least ${line.min} picture${line.min === 1 ? '' : 's'} for ${line.name}.`
        } else if (list.length > line.max) {
          nextErrors[line.lineId] =
            `Please use at most ${line.max} pictures for ${line.name}.`
        }
      }
      if (Object.keys(nextErrors).length) {
        setPhotoErrors(nextErrors)
        setSaving(false)
        return
      }

      const includeDelivery = data.includeDelivery !== false
      const qty = Math.max(1, orderQty || 1)
      const lineSubtotal = unitPrice * qty
      const orderTotal = getOrderTotalAmount(lineSubtotal, includeDelivery)
      const { advance, balanceOnDelivery } = splitAdvancePayment(orderTotal)

      const payload = {
        checkoutSource,
        slug: isCartCheckout ? 'checkout' : slug ?? null,
        productName,
        unitPrice,
        orderQty: qty,
        selectionSummary,
        cartSnapshot: checkoutSource === 'cart' ? cartSnapshot : null,
        bouquetBundle:
          !isCartCheckout && bouquetBundle ? bouquetBundle : null,
        customer: data,
        includeDelivery,
        orderTotal,
        advanceAmount: advance,
        balanceOnDelivery,
      }

      const { id } = await createOrder(payload)

      for (const line of photoLines) {
        const list = filesForLine(line.lineId)
        if (!list.length) continue
        await uploadOrderLinePhotos(id, list, {
          lineItemId: line.lineId,
          productId: line.productId || '',
          productSlug: line.slug,
          productName: line.name,
        })
      }

      setCustomer(data)
      setServerOrderId(id)
      if (isCartCheckout) {
        navigate('/checkout/payment')
        return
      }
      navigate(`/order/${slug}/payment`)
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Could not save your order'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const backHref = isCartCheckout ? '/' : `/product/${slug}`
  const backLabel = isCartCheckout ? '← Back to shop' : '← Back to product'
  const headingContext = isCartCheckout ? 'your cart order' : product.name

  return (
    <main className="min-h-[70vh] bg-[#fffcfd] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          to={backHref}
          className="mb-6 inline-flex text-sm font-semibold text-[#e66f98] transition hover:text-[#e66f98]"
        >
          {backLabel}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[2rem] border border-[#f6b6cc]/70 bg-[#fffcfd] shadow-xl shadow-[rgba(73,60,67,0.08)]"
        >
          <div className="border-b border-[#f6b6cc]/40 bg-[#fdf0f5] px-6 py-6 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e66f98]">
              Step 1 of 2
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-[#493c43] sm:text-4xl">
              Your details
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#755f69]">
              We need this to confirm{' '}
              <span className="font-semibold text-[#493c43]">
                {headingContext}
              </span>
              .
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            {saveError && (
              <p
                className="rounded-2xl border border-[#f6b6cc] bg-[#fdf0f5] px-4 py-3 text-sm text-[#493c43]"
                role="alert"
              >
                {saveError}
              </p>
            )}

            {whatsappHintLines.length > 0 && (
              <div className="rounded-2xl border border-[#f6b6cc]/70 bg-[#fdf0f5]/50 px-4 py-3 text-sm text-[#755f69]">
                Customization details for{' '}
                <span className="font-semibold text-[#493c43]">
                  {whatsappHintLines.map((l) => l.name).join(', ')}
                </span>{' '}
                will be collected on WhatsApp after you submit your order.
              </div>
            )}

            {photoLines.map((line) => (
              <LinePhotoUpload
                key={line.lineId}
                title={`Pictures for ${line.name}`}
                hint="Upload your pictures here before placing your order."
                files={filesForLine(line.lineId)}
                min={line.min}
                max={line.max}
                error={photoErrors[line.lineId] || null}
                onAddFiles={(list) => {
                  if (!isCartCheckout && photoLines[0]?.lineId === line.lineId) {
                    addFiles(list)
                  } else {
                    addFilesToLine(line.lineId, list)
                  }
                }}
                onRemoveAt={(i) => {
                  if (!isCartCheckout && photoLines[0]?.lineId === line.lineId) {
                    removeFileAt(i)
                  } else {
                    removeFileFromLine(line.lineId, i)
                  }
                }}
                onClear={() => {
                  if (!isCartCheckout && photoLines[0]?.lineId === line.lineId) {
                    clearFiles()
                  } else {
                    clearLineFiles(line.lineId)
                  }
                }}
              />
            ))}

            <CustomerForm
              defaultValues={customer ?? undefined}
              onSubmit={handleSubmit}
              submitLabel="Proceed to payment"
              isSubmitting={saving}
            />
          </div>
        </motion.div>
      </div>
    </main>
  )
}
