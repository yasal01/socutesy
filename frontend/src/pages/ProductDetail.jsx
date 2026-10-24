import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useShopBack } from '../hooks/useShopBack'
import { motion, useReducedMotion } from 'framer-motion'
import { easeOut } from '../utils/motionPresets'
import { getProductBySlug } from '../utils/products'
import {
  getCategoryLabel,
  getProductImageFit,
  getProductImagePosition,
} from '../utils/shopConfig'
import {
  clampSideIndex,
  defaultSelection,
  getPrice,
  getSelectionSummary,
} from '../utils/pricing'
import { PriceDisplay } from '../components/PriceDisplay'
import { ShopSelect } from '../components/ShopSelect'
import {
  KeepsakeCustomize,
  buildKeepsakeNotes,
} from '../components/KeepsakeCustomize'
import { LinePhotoUpload } from '../components/LinePhotoUpload'
import { useCart } from '../context/CartContext'
import { useOrderFlow } from '../context/OrderFlowContext'
import { whatsappLink } from '../utils/whatsapp'
import {
  getCustomizationMode,
  getLinePhotoRequirements,
  isPhotoUploadProduct,
  isWhatsAppCustomProduct,
} from '../utils/customizationMode'
import { BouquetBundleBuilder } from '../components/BouquetBundleBuilder'
import {
  bouquetCartAllowed,
  buildBouquetSnapshot,
  calculateBouquetTotal,
  formatBouquetSummary,
  getDefaultBouquetQtys,
  isMiniBouquetSlug,
} from '../utils/bouquetBundle'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const product = getProductBySlug(slug)
  const backFallback = product?.category
    ? `/#section-${product.category}`
    : '/'
  const goBackToShop = useShopBack(backFallback)
  const { addToCart } = useCart()
  const { clearFiles, setOrderMeta, files, addFiles, removeFileAt } =
    useOrderFlow()
  const reduceMotion = useReducedMotion()

  const [selection, setSelection] = useState(() =>
    product ? defaultSelection(product) : { kind: 'simple' },
  )
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [fieldValues, setFieldValues] = useState({})
  const [keepsakeError, setKeepsakeError] = useState('')
  const [bouquetMode, setBouquetMode] = useState('standard')
  const [bouquetQtys, setBouquetQtys] = useState(() => getDefaultBouquetQtys())

  const isKeepsake = Boolean(product?.designs?.length && product?.sizes?.length)
  const customMode = product ? getCustomizationMode(product.slug) : 'none'
  const isPhotoProduct = product ? isPhotoUploadProduct(product.slug) : false
  const isWhatsAppProduct = product
    ? isWhatsAppCustomProduct(product.slug)
    : false
  const isBouquetProduct = product ? isMiniBouquetSlug(product.slug) : false
  const isBouquetCustom = isBouquetProduct && bouquetMode === 'custom'

  useEffect(() => {
    if (product) setSelection(defaultSelection(product))
  }, [slug, product])

  useEffect(() => {
    setActiveImageIndex(0)
    setLightboxOpen(false)
    setQuantity(1)
    setFieldValues({})
    setKeepsakeError('')
    setBouquetMode('standard')
    setBouquetQtys(getDefaultBouquetQtys())
    clearFiles()
  }, [slug, clearFiles])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [lightboxOpen])

  const bouquetTotal = useMemo(
    () => (isBouquetCustom ? calculateBouquetTotal(bouquetQtys) : null),
    [isBouquetCustom, bouquetQtys],
  )

  const price = useMemo(() => {
    if (!product) return 0
    if (isBouquetCustom) {
      // Never fall back to catalog 4000 for customized mode
      return typeof bouquetTotal === 'number' ? bouquetTotal : 0
    }
    return getPrice(product, selection)
  }, [product, selection, isBouquetCustom, bouquetTotal])

  const summary = useMemo(() => {
    if (!product) return ''
    if (isBouquetCustom) return formatBouquetSummary(bouquetQtys)
    return getSelectionSummary(product, selection)
  }, [product, selection, isBouquetCustom, bouquetQtys])

  const bouquetReady =
    !isBouquetCustom || bouquetCartAllowed(bouquetQtys, bouquetTotal)

  const activeDesign =
    isKeepsake && selection.kind === 'keepsake'
      ? product.designs[selection.designIndex]
      : null
  const activeVariant =
    selection.kind === 'variants'
      ? product?.variants?.[selection.index]
      : null
  const isCustomDesign = Boolean(
    activeDesign?.whatsappCustom || activeVariant?.whatsappCustom,
  )
  const customWhatsAppHref = whatsappLink(
    `Hi SoCutesy! I want a *custom ${product?.name ?? 'product'}*.\n\nI will send my own design / sticker sheet reference here.`,
  )

  const photoReqs =
    product && isPhotoProduct
      ? getLinePhotoRequirements({
          slug: product.slug,
          qty: quantity,
          designPhotosRequired: activeDesign?.photosRequired ?? null,
          photosPerUnit: product.photosPerUnit ?? null,
        })
      : { min: 0, max: 0 }

  const galleryImages = useMemo(() => {
    if (!product) return []
    if (isKeepsake) {
      return product.designs
        .filter((d) => d.image && !d.whatsappCustom)
        .map((d) => d.image)
    }
    if (product.sharedVariantGallery?.length) {
      return product.sharedVariantGallery
    }
    if (product.variants?.length && product.variants[0]?.image) {
      if (
        selection.kind === 'variants' &&
        product.variants[selection.index]?.images?.length
      ) {
        return product.variants[selection.index].images
      }
      return product.variants.map((v) => v.image)
    }
    if (product.images?.length > 0) return product.images
    return [product.image]
  }, [product, selection, isKeepsake])

  useEffect(() => {
    if (!isKeepsake || selection.kind !== 'keepsake') return
    const design = product.designs[selection.designIndex]
    if (design?.whatsappCustom) return
    const img = design?.image
    const idx = galleryImages.indexOf(img)
    if (idx >= 0) setActiveImageIndex(idx)
  }, [isKeepsake, selection, product, galleryImages])

  const syncThumbnailToVariant =
    Boolean(product?.variants?.[0]?.image) &&
    (!product?.variants?.[0]?.images?.length ||
      Boolean(product.sharedVariantGallery?.length))

  if (!product) {
    return (
      <main className="min-h-[60vh] bg-[#fffcfd] px-4 py-20 text-center">
        <p className="font-display text-2xl text-[#493c43]">Product not found.</p>
        <Link
          to={{ pathname: '/', hash: '#products-top' }}
          className="mt-4 inline-block text-sm font-semibold text-[#e66f98] transition hover:text-[#e66f98]"
        >
          ← Back to shop
        </Link>
      </main>
    )
  }

  const hasPaperOptions = Boolean(product.options?.length)
  const hasFlatVariants = Boolean(product.variants?.length)

  const onPaperSelect = (paperIndex) => {
    setSelection((prev) => {
      if (prev.kind !== 'options') return prev
      const sideIndex = clampSideIndex(product, paperIndex, prev.sideIndex)
      return { kind: 'options', paperIndex, sideIndex }
    })
  }

  const onSidesSelect = (sideIndex) => {
    setSelection((prev) => {
      if (prev.kind !== 'options') return prev
      return { ...prev, sideIndex }
    })
  }

  const onVariantSelect = (index) => {
    setSelection({ kind: 'variants', index })
    const v = product.variants[index]
    if (product.sharedVariantGallery?.length) {
      setActiveImageIndex(index)
    } else if (v?.images?.length) {
      setActiveImageIndex(0)
    } else if (product.variants?.[0]?.image) {
      setActiveImageIndex(index)
    }
  }

  const onKeepsakeSelectionChange = (next) => {
    if (next.designIndex !== selection.designIndex) {
      clearFiles()
      setFieldValues({})
      setKeepsakeError('')
    }
    setSelection(next)
  }

  const buildSummary = () => {
    if (isBouquetCustom) return formatBouquetSummary(bouquetQtys)
    if (isKeepsake && activeDesign && !activeDesign.whatsappCustom) {
      const sizeLabel = product.sizes[selection.sizeIndex]?.size ?? ''
      if (isWhatsAppProduct || isPhotoProduct) {
        return `${summary} · Template: ${activeDesign.label} · ${sizeLabel}${
          activeDesign.photosRequired
            ? ` · ${activeDesign.photosRequired} photos`
            : ''
        }`
      }
      const notes = buildKeepsakeNotes(activeDesign, fieldValues, sizeLabel)
      return `${summary}\n${notes}`
    }
    return summary
  }

  const handleAddToCart = () => {
    if (isCustomDesign) return
    if (isBouquetCustom && !bouquetCartAllowed(bouquetQtys, bouquetTotal)) {
      setKeepsakeError('Select at least one bouquet item before adding to cart.')
      return
    }
    if (isPhotoProduct) {
      if (files.length < photoReqs.min) {
        setKeepsakeError(
          `Please upload at least ${photoReqs.min} picture${photoReqs.min === 1 ? '' : 's'} before adding to cart.`,
        )
        return
      }
      if (files.length > photoReqs.max) {
        setKeepsakeError(`Please use at most ${photoReqs.max} pictures.`)
        return
      }
    }
    setKeepsakeError('')
    const fullSummary = buildSummary()
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unitPrice: price,
      summary: fullSummary,
      qty: quantity,
      image: product.image,
      designPhotosRequired: activeDesign?.photosRequired ?? null,
      photosPerUnit: product.photosPerUnit ?? null,
      customizationMode: customMode,
      photos: isPhotoProduct ? files.map((f) => f.file) : null,
      bouquetBundle: isBouquetCustom
        ? buildBouquetSnapshot(bouquetQtys)
        : null,
    })
    if (isPhotoProduct) clearFiles()
  }

  const handlePlaceOrder = () => {
    if (isCustomDesign) return
    if (isBouquetCustom && !bouquetCartAllowed(bouquetQtys, bouquetTotal)) {
      setKeepsakeError(
        'Select at least one bouquet item before placing your order.',
      )
      return
    }

    if (isPhotoProduct) {
      if (files.length < photoReqs.min) {
        setKeepsakeError(
          `Please upload at least ${photoReqs.min} picture${photoReqs.min === 1 ? '' : 's'} before placing your order.`,
        )
        return
      }
      if (files.length > photoReqs.max) {
        setKeepsakeError(`Please use at most ${photoReqs.max} pictures.`)
        return
      }
    }

    const fullSummary = buildSummary()
    const bouquetBundle = isBouquetCustom
      ? buildBouquetSnapshot(bouquetQtys)
      : null
    setOrderMeta({
      slug: product.slug,
      name: product.name,
      price,
      summary: fullSummary,
      quantity,
      designPhotosRequired: activeDesign?.photosRequired ?? null,
      photosPerUnit: product.photosPerUnit ?? null,
      productId: product.id,
      initialFiles: isPhotoProduct ? files : null,
      bouquetBundle,
    })
    setKeepsakeError('')
    navigate(`/order/${product.slug}/customer`, {
      state: {
        price,
        summary: fullSummary,
        quantity,
        designPhotosRequired: activeDesign?.photosRequired ?? null,
        photosPerUnit: product.photosPerUnit ?? null,
        initialFiles: isPhotoProduct ? files : null,
        bouquetBundle,
      },
    })
  }

  const variantOptionLabel = (v) => {
    if (v.label) return v.label
    if (v.size != null) return v.size
    if (v.sides != null) return `${v.sides} sides`
    return 'Option'
  }

  const v0 = product.variants?.[0]
  const variantGroupLabel =
    product.variantSelectLabel ??
    (v0?.size != null ? 'Size' : v0?.sides != null ? 'Sides' : 'Option')

  const categoryLabel = getCategoryLabel(product.category)

  return (
    <main className="pdp-main relative min-h-[70vh] overflow-hidden bg-[var(--brand-white)] px-4 py-10 pb-28 sm:px-6 lg:py-14 lg:pb-14">

      <div className="relative mx-auto max-w-4xl">
      <nav className="pdp-breadcrumb mb-6" aria-label="Breadcrumb">
        <ol className="pdp-breadcrumb__list">
          <li>
            <Link to="/" className="pdp-breadcrumb__link">
              Home
            </Link>
          </li>
          <li aria-hidden className="pdp-breadcrumb__sep">
            /
          </li>
          <li>
            <Link
              to={{ pathname: '/', hash: `#section-${product.category}` }}
              className="pdp-breadcrumb__link"
            >
              {categoryLabel}
            </Link>
          </li>
          <li aria-hidden className="pdp-breadcrumb__sep">
            /
          </li>
          <li>
            <span className="pdp-breadcrumb__current" aria-current="page">
              {product.name}
            </span>
          </li>
        </ol>
        <button
          type="button"
          onClick={goBackToShop}
          className="pdp-breadcrumb__back"
        >
          ← Back
        </button>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className={`self-start overflow-hidden rounded-[1.1rem] border border-[rgba(233,175,193,0.55)] bg-[var(--brand-white)] shadow-[0_10px_28px_rgba(70,59,64,0.06)] ${
            product.slug === 'photobooth-strips' ||
            getProductImageFit(product.slug) === 'contain'
              ? 'mx-auto h-fit w-fit max-w-full'
              : 'h-fit w-full'
          }`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className={`group relative cursor-zoom-in p-0 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(206,111,145,0.35)] focus-visible:ring-offset-2 ${
              product.slug === 'photobooth-strips' ||
              getProductImageFit(product.slug) === 'contain'
                ? 'block w-fit max-w-full bg-[#fff8f5]'
                : 'block w-full'
            }`}
            aria-label="View full image"
          >
            <img
              src={
                galleryImages[activeImageIndex] ??
                activeDesign?.image ??
                product.image
              }
              alt={product.imageAlt ?? product.name}
              {...(product.slug === 'photobooth-strips' ||
              getProductImageFit(product.slug) === 'contain'
                ? {}
                : { width: 640, height: 800 })}
              className={
                product.slug === 'photobooth-strips' ||
                getProductImageFit(product.slug) === 'contain'
                  ? 'block h-auto w-auto max-h-[min(70vh,34rem)] max-w-full object-contain p-3 transition group-hover:brightness-[1.02] sm:max-h-[min(78vh,40rem)]'
                  : 'aspect-[4/5] w-full object-cover transition group-hover:brightness-[1.02]'
              }
              style={{
                objectPosition: getProductImagePosition(product.slug),
              }}
            />
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[rgba(70,59,64,0.55)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 shadow-sm transition group-hover:opacity-100 sm:text-xs">
              Full size
            </span>
          </button>
          {galleryImages.length > 1 && (
            <div className="flex gap-2 border-t border-[#f6b6cc]/80 bg-[#fffcfd]/95 p-3">
              {galleryImages.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(i)
                    if (isKeepsake) {
                      const designIndex = product.designs.findIndex(
                        (d) => d.image === src && !d.whatsappCustom,
                      )
                      if (designIndex >= 0) {
                        onKeepsakeSelectionChange({
                          ...selection,
                          designIndex,
                        })
                      }
                    } else if (
                      syncThumbnailToVariant &&
                      selection.kind === 'variants'
                    ) {
                      setSelection({ kind: 'variants', index: i })
                    }
                  }}
                  className={`relative shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 transition ${
                    activeImageIndex === i
                      ? 'ring-[#e66f98]'
                      : 'ring-transparent opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                    style={{
                      objectPosition: getProductImagePosition(product.slug),
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.08, duration: 0.5, ease: easeOut }}
          className="flex flex-col"
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#493c43] sm:text-4xl">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-[#755f69] sm:text-[15px]">
              {product.description}
            </p>
          )}

          {product.detailBullets?.length > 0 && !isBouquetCustom && (
            <div className="mt-5 rounded-2xl border border-[#f6b6cc]/80 bg-gradient-to-b from-[#fffcfd] to-[#fdf0f5] px-4 py-3.5 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#e66f98]">
                Details
              </p>
              <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[#493c43]/85 marker:text-[#e66f98] sm:text-sm">
                {product.detailBullets.map((line, i) => (
                  <li key={`${i}-${line}`}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 space-y-5 rounded-2xl border border-[#f6b6cc]/80 bg-gradient-to-b from-[#fffcfd] to-[#fdf0f5]/50 p-5 shadow-inner shadow-[#f6b6cc]/30">
            {isBouquetProduct && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#493c43]">
                  Bouquet options
                </p>
                <div className="bouquet-mode" role="group" aria-label="Bouquet mode">
                  <button
                    type="button"
                    className={`bouquet-mode__btn${bouquetMode === 'standard' ? ' bouquet-mode__btn--active' : ''}`}
                    aria-pressed={bouquetMode === 'standard'}
                    onClick={() => {
                      setBouquetMode('standard')
                      setKeepsakeError('')
                    }}
                  >
                    Standard Bouquet — RS. 4,000
                  </button>
                  <button
                    type="button"
                    className={`bouquet-mode__btn${bouquetMode === 'custom' ? ' bouquet-mode__btn--active' : ''}`}
                    aria-pressed={bouquetMode === 'custom'}
                    onClick={() => {
                      setBouquetMode('custom')
                      setBouquetQtys(getDefaultBouquetQtys())
                      setKeepsakeError('')
                    }}
                  >
                    Customize Your Bundle
                  </button>
                </div>
                {isBouquetCustom && (
                  <BouquetBundleBuilder
                    qtys={bouquetQtys}
                    onChange={setBouquetQtys}
                  />
                )}
              </div>
            )}

            {isWhatsAppProduct && (
              <p className="rounded-2xl border border-[#f6b6cc]/70 bg-[#fdf0f5]/60 px-4 py-3 text-xs leading-relaxed text-[#755f69]">
                Customization details will be collected on WhatsApp after
                placing your order.
              </p>
            )}

            {isPhotoProduct && (
              <p className="rounded-2xl border border-[#f6b6cc]/70 bg-[#fdf0f5]/60 px-4 py-3 text-xs leading-relaxed text-[#755f69]">
                Upload your pictures here before placing your order.
              </p>
            )}

            {isKeepsake && selection.kind === 'keepsake' && (
              <KeepsakeCustomize
                product={product}
                selection={selection}
                onSelectionChange={onKeepsakeSelectionChange}
                fieldValues={fieldValues}
                onFieldChange={(key, value) =>
                  setFieldValues((prev) => ({ ...prev, [key]: value }))
                }
                hideFields={isPhotoProduct || isWhatsAppProduct}
              />
            )}

            {isPhotoProduct && !isCustomDesign && (
              <LinePhotoUpload
                title="Your pictures"
                hint="Upload your pictures here before placing your order."
                files={files}
                min={photoReqs.min}
                max={photoReqs.max}
                onAddFiles={addFiles}
                onRemoveAt={removeFileAt}
                onClear={clearFiles}
                error={keepsakeError}
              />
            )}

            {hasPaperOptions && selection.kind === 'options' && (
              <>
                <label className="block text-sm font-semibold text-[#493c43]">
                  Paper type
                  <ShopSelect
                    value={selection.paperIndex}
                    options={product.options.map((opt) => opt.type)}
                    onChange={onPaperSelect}
                  />
                </label>
                <label className="block text-sm font-semibold text-[#493c43]">
                  Sides
                  <ShopSelect
                    value={selection.sideIndex}
                    options={product.options[selection.paperIndex].variants.map(
                      (v) => `${v.sides} sides`,
                    )}
                    onChange={onSidesSelect}
                  />
                </label>
              </>
            )}

            {hasFlatVariants && selection.kind === 'variants' && (
              <label className="block text-sm font-semibold text-[#493c43]">
                {variantGroupLabel}
                <ShopSelect
                  value={selection.index}
                  options={product.variants.map((v) => variantOptionLabel(v))}
                  onChange={onVariantSelect}
                />
              </label>
            )}

            {isCustomDesign && !isKeepsake && (
              <div className="rounded-2xl border border-dashed border-[#f6b6cc] bg-[#fffcfd] px-4 py-5 text-center">
                <p className="text-sm font-semibold text-[#493c43]">
                  Custom sticker sheet
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#755f69]">
                  Send your own sticker sheet design or reference on WhatsApp
                  and we will make it for you.
                </p>
                {customWhatsAppHref ? (
                  <a
                    href={customWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-candy mt-4 inline-flex items-center justify-center px-5 py-3 text-sm"
                  >
                    Send on WhatsApp
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-amber-800">
                    Set VITE_WHATSAPP_NUMBER to enable WhatsApp.
                  </p>
                )}
              </div>
            )}

            {!isCustomDesign && (
              <div className="border-t border-[#f6b6cc]/70 pt-5">
                <p className="text-sm font-semibold text-[#493c43]">Quantity</p>
                <div className="mt-2 flex max-w-[12rem] items-center gap-1 rounded-2xl border border-[#f6b6cc] bg-[#fffcfd] p-1 shadow-sm">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-[#493c43] transition hover:bg-[#fdf0f5] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] flex-1 text-center text-base font-semibold tabular-nums text-[#493c43]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-[#493c43] transition hover:bg-[#fdf0f5] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={quantity >= 99}
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  >
                    +
                  </button>
                </div>
                <div className="mt-4">
                  <PriceDisplay amount={price} />
                  <p className="mt-1 text-xs text-[#755f69]">Price per item</p>
                </div>
              </div>
            )}

            {keepsakeError && !isPhotoProduct && (
              <p className="text-xs font-medium text-[#e66f98]">{keepsakeError}</p>
            )}
          </div>

          {!isCustomDesign && (
            <>
              <p className="pdp-delivery-note mt-6">
                Delivery usually takes 4–7 working days. Delivery charges are
                fixed according to courier services.
              </p>
              <div className="pdp-actions mt-6 hidden gap-3 lg:flex">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!bouquetReady}
                  className="btn-candy btn-feedback flex-1 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={!bouquetReady}
                  className="btn-feedback flex flex-1 items-center justify-center rounded-2xl border-2 border-[rgba(233,175,193,0.85)] bg-[var(--brand-white)] py-3.5 text-center text-sm font-semibold text-[var(--brand-pink)] shadow-sm transition hover:border-[var(--brand-pink)] hover:bg-[var(--brand-blush)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Place order
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
      </div>

      {!isCustomDesign && (
        <div className="pdp-sticky-cta lg:hidden" role="region" aria-label="Purchase">
          <div className="pdp-sticky-cta__inner">
            <div className="pdp-sticky-cta__price">
              <span className="pdp-sticky-cta__label">{product.name}</span>
              <span className="pdp-sticky-cta__amount">
                RS. {(price * quantity).toLocaleString()}
              </span>
            </div>
            <div className="pdp-sticky-cta__btns">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!bouquetReady}
                className="btn-candy btn-feedback py-3 text-xs disabled:cursor-not-allowed disabled:opacity-45"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!bouquetReady}
                className="pdp-sticky-cta__order disabled:cursor-not-allowed disabled:opacity-45"
              >
                Place order
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full size product image"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-black/88 p-3 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="fixed right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#fffcfd]/15 text-3xl leading-none text-white transition hover:bg-[#fffcfd]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:top-5"
            aria-label="Close"
          >
            ×
          </button>
          <div
            className={`my-auto flex max-h-[min(92vh,100%)] max-w-[min(96vw,56rem)] items-center justify-center rounded-2xl p-2 sm:p-4 ${
              getProductImageFit(product.slug) === 'contain'
                ? 'bg-[#fff8f5]'
                : 'bg-transparent'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                galleryImages[activeImageIndex] ??
                activeDesign?.image ??
                product.image
              }
              alt={product.imageAlt ?? product.name}
              className="max-h-[min(88vh,100%)] w-auto max-w-full object-contain"
              draggable={false}
            />
          </div>
        </div>
      )}
    </main>
  )
}
