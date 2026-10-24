/**
 * Frontend shop curation — only real catalog slugs / assets.
 * Category IDs and order stay in products.js; labels here are display-only.
 */

import { categories } from './products'

/**
 * Professional display labels for existing category IDs.
 * Does not change IDs, order, routes, or product mappings.
 */
export const CATEGORY_LABELS = {
  polaroids: 'Polaroid Prints',
  stationery: 'Custom Printables',
  albums: 'Custom Magazines & Albums',
  frames: 'Photo Frames',
  gifting: 'Gifting',
  cards: 'Cards',
}

/** Resolve a category display name without mutating catalog data. */
export function getCategoryLabel(categoryId) {
  if (!categoryId) return null
  if (CATEGORY_LABELS[categoryId]) return CATEGORY_LABELS[categoryId]
  return categories.find((c) => c.id === categoryId)?.title ?? categoryId
}

/**
 * Reel Studio hero — three vertical product reels in phone mockups.
 * Videos: /public/videos/hero/ (see README there). Posters are real catalog photos.
 */
export const HERO_REELS = [
  {
    id: 'mini-albums',
    label: 'Photobooth Strips',
    categoryId: 'albums',
    // Left phone
    videoMp4: '/videos/hero/mini-albums.mp4',
    poster: '/images/hero/reel-mini-albums-poster.jpg',
  },
  {
    id: 'magazines',
    label: 'Custom Magazines',
    categoryId: 'albums',
    // Center phone — featured
    videoMp4: '/videos/hero/magazines.mp4',
    poster: '/images/hero/reel-magazines-poster.jpg',
    featured: true,
  },
  {
    id: 'polaroids',
    label: 'Mini Bouquet',
    categoryId: 'gifting',
    // Right phone
    videoMp4: '/videos/hero/polaroids.mp4',
    poster: '/images/hero/reel-polaroids-poster.jpg',
  },
]

/**
 * Legacy campaign slides (unused while Reel Studio hero is active).
 * Desktop 16:9 · Mobile 3:4
 */
export const HERO_SLIDES = [
  {
    id: 'gift-edit',
    eyebrow: 'SoCutesy',
    headline: 'Personalized Gifts',
    lede: 'Custom magazines, polaroids, albums, and keepsakes.',
    ctaLabel: 'Shop Now',
    ctaHref: '#products-top',
    image: '/images/hero/hero-gift-edit-desktop.jpg',
    mobileImage: '/images/hero/hero-gift-edit-mobile.jpg',
    alt: 'SoCutesy personalized gift collection',
  },
  {
    id: 'magazine-moment',
    eyebrow: 'Collection',
    headline: 'Custom Magazines',
    lede: 'A4 magazines with soft or hard paper finishes.',
    ctaLabel: 'Shop Magazines',
    ctaAction: { type: 'category', id: 'albums' },
    image: '/images/hero/hero-magazine-moment-desktop.jpg',
    mobileImage: '/images/hero/hero-magazine-moment-mobile.jpg',
    alt: 'Custom SoCutesy magazine',
  },
  {
    id: 'little-things',
    eyebrow: 'Keepsakes',
    headline: 'Photo Keepsakes',
    lede: 'Mini albums, photobooks, polaroids, and frames.',
    ctaLabel: 'View Products',
    ctaHref: '#section-polaroids',
    image: '/images/hero/hero-little-things-desktop.jpg',
    mobileImage: '/images/hero/hero-little-things-mobile.jpg',
    alt: 'SoCutesy personalized mini gifts',
  },
]

/** Featured products on the homepage */
export const FEATURED_SLUGS = [
  'custom-magazine',
  'mini-album',
  'newspaper',
  'polaroids',
  'mini-photobook',
  'keepsake-frame',
  'photobooth-strips',
  'songbook',
]

/**
 * Category card visuals — ids match `categories` in products.js.
 */
export const CATEGORY_VISUALS = {
  polaroids: {
    image: '/images/polaroids-1.png',
    alt: 'Polaroid prints',
  },
  stationery: {
    image: '/images/newspaper-1.png',
    alt: 'Custom printables',
  },
  albums: {
    image: '/images/magazine-1.png',
    alt: 'Custom magazines and albums',
  },
  frames: {
    image: '/images/keepsake-frame-2.png',
    alt: 'Photo frames',
  },
  gifting: {
    image: '/images/mini-bouquet.png',
    alt: 'Mini bouquet, CD journal, phone case, and tote bag',
  },
  cards: {
    image: '/images/cards-1.png',
    alt: 'Custom cards',
  },
}

/**
 * Optional object-position overrides for product card images (CSS values).
 * Keeps authentic photos while cropping consistently at 4:5.
 */
export const PRODUCT_IMAGE_POSITION = {
  'custom-magazine': 'center 18%',
  newspaper: 'center 28%',
  'mini-frame': 'center 22%',
  'keepsake-frame': 'center 28%',
  'mini-bouquet': 'center center',
  'cd-journal': 'center 26%',
  'phone-case': 'center 22%',
  'tote-bag': 'center center',
  'mini-album': 'center 22%',
  polaroids: 'center 28%',
  'mini-photobook': 'center 26%',
  'photobooth-strips': 'center top',
  stickers: 'center 28%',
  bookmarks: 'center 20%',
  cards: 'center 28%',
  'scrapbook-card': 'center 28%',
  'coloring-book': 'center 22%',
  songbook: 'center 26%',
}

/** Prefer contain when tight crops would hide product edges. */
export const PRODUCT_IMAGE_FIT = {
  'photobooth-strips': 'contain',
  bookmarks: 'contain',
  stickers: 'contain',
  'tote-bag': 'contain',
  'mini-bouquet': 'contain',
}

export function getProductImagePosition(slug) {
  return PRODUCT_IMAGE_POSITION[slug] ?? 'center center'
}

export function getProductImageFit(slug) {
  return PRODUCT_IMAGE_FIT[slug] ?? 'cover'
}

/**
 * Customer reviews — leave empty until real quotes exist.
 * Shape: { quote, name, detail? }
 */
export const CUSTOMER_REVIEWS = []

export const INSTAGRAM_URL = 'https://www.instagram.com/socutesyyy_/'
export const WHATSAPP_DISPLAY = '0371 6912402'
export const EMAIL = 'socutesy124@gmail.com'
