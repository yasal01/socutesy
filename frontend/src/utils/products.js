/**
 * Shop catalog with structured pricing (fixed / variants / paper options).
 */
export const categories = [
  { id: 'polaroids', title: 'Polaroids & prints' },
  { id: 'stationery', title: 'Printables' },
  { id: 'cards', title: 'Cards' },
  { id: 'albums', title: 'Magazines & Albums' },
  { id: 'frames', title: 'Frames' },
  { id: 'gifting', title: 'Gifting' },
]

export const products = [
  {
    id: 'magazine',
    slug: 'custom-magazine',
    name: 'Custom Magazine',
    category: 'albums',
    image: '/images/magazine-1.png',
    images: [
      '/images/magazine-1.png',
      '/images/magazine-2.png',
      '/images/magazine-3.png',
      '/images/magazine-4.png',
      '/images/magazine-5.png',
      '/images/magazine-6.png',
    ],
    imageAlt:
      'Custom magazine spreads and covers — editorial layouts, collages, and portrait features.',
    description:
      'Your story in magazine form — editorial layouts and collages. Size A4; soft or hard paper.',
    options: [
      {
        type: 'Soft Paper',
        variants: [
          { sides: 6, price: 1800 },
          { sides: 8, price: 2200 },
          { sides: 10, price: 2600 },
        ],
      },
      {
        type: 'Hard Paper',
        variants: [
          { sides: 6, price: 2200 },
          { sides: 8, price: 2600 },
          { sides: 10, price: 3000 },
        ],
      },
    ],
  },
  {
    id: 'newspaper',
    slug: 'newspaper',
    name: 'Newspaper',
    category: 'stationery',
    image: '/images/newspaper-1.png',
    images: [
      '/images/newspaper-1.png',
      '/images/newspaper-2.png',
      '/images/newspaper-3.png',
    ],
    imageAlt:
      'Custom newspaper prints — Bestie Times zine style, Forever Times wedding spreads, puzzles, and columns.',
    description:
      'Newspaper-style prints for birthdays, weddings, and bestie shout-outs — choose A3 or A4.',
    variants: [
      { size: 'A3', price: 1000 },
      { size: 'A4', price: 500 },
    ],
  },
  {
    id: 'mini-frame',
    slug: 'mini-frame',
    name: 'Mini Frame',
    category: 'frames',
    image: '/images/mini-frame-1.png',
    imageAlt:
      'Personalized mini frame collage with photos and decorative details, held against green leaves.',
    description:
      'Pick a template, add your photos & text, or send your own layout on WhatsApp for a fully custom mini frame.',
    detailBullets: [
      'Size 6×6 inches',
      'Choose a ready template or custom design',
      'Perfect for desks, shelves, and gifts',
    ],
    sizes: [{ size: '6×6 inches', price: 1500 }],
    designs: [
      {
        id: 'bestie-lyrics',
        label: 'Bestie Lyrics Collage',
        image: '/images/mini-frame-1.png',
        photosRequired: 4,
        fields: [
          {
            key: 'lyric',
            label: 'Song lyric / quote bubble',
            placeholder: 'e.g. Does it ever drive you crazy…',
            required: true,
            multiline: true,
          },
          {
            key: 'dedication',
            label: 'Dedication text',
            placeholder: "e.g. You're my best friend, I'll love you forever",
            required: true,
            multiline: true,
          },
          {
            key: 'heartLabel',
            label: 'Heart sticker text',
            placeholder: 'e.g. my girl',
            required: true,
          },
        ],
      },
      {
        id: 'core-memories',
        label: 'Core Memories',
        image: '/images/mini-frame-2.png',
        photosRequired: 13,
        fieldHint:
          'Upload 1 main cutout photo (centre) + 12 small background photos (13 total).',
        fields: [
          {
            key: 'title',
            label: 'Centre title',
            placeholder: 'e.g. core memories',
            required: true,
          },
        ],
      },
      {
        id: 'favourite-person',
        label: 'Favourite Person',
        image: '/images/mini-frame-3.png',
        photosRequired: 2,
        fields: [
          {
            key: 'message',
            label: 'Top message',
            placeholder: "e.g. you're my favourite person <3",
            required: true,
          },
        ],
      },
      {
        id: 'custom',
        label: 'Custom template',
        whatsappCustom: true,
        image: '/images/custom-template.png',
        description:
          'Send your own layout / reference on WhatsApp and we will create it for you.',
      },
    ],
  },
  {
    id: 'keepsake-frame',
    slug: 'keepsake-frame',
    name: 'Keepsake Frame',
    category: 'frames',
    image: '/images/keepsake-frame-1.png',
    imageAlt:
      'Personalized keepsake photo frames — black-and-white collages with custom text in A4 and A3 sizes.',
    description:
      'Pick a template, add your photos & text, or send your own layout on WhatsApp for a fully custom frame.',
    detailBullets: [
      'Choose a ready template or custom design',
      'A4 or A3 size',
      'Black & white or colour photos',
    ],
    sizes: [
      { size: 'A4', price: 2500 },
      { size: 'A3', price: 3500 },
    ],
    designs: [
      {
        id: 'urdu-love',
        label: 'Urdu Love Collage',
        image: '/images/keepsake-frame-1.png',
        photosRequired: 8,
        fields: [
          {
            key: 'topText',
            label: 'Top text',
            placeholder: 'e.g. تولدت مبارک زندگیم',
            required: true,
          },
          {
            key: 'bottomText',
            label: 'Bottom verse',
            placeholder: 'Your poem or message',
            required: true,
          },
          {
            key: 'date',
            label: 'Date',
            placeholder: 'e.g. 83.07.13',
            required: true,
          },
        ],
      },
      {
        id: 'bestie-collage',
        label: 'Bestie Layered Collage',
        image: '/images/keepsake-frame-2.png',
        photosRequired: 8,
        fields: [
          {
            key: 'note',
            label: 'Optional note / names',
            placeholder: 'Names or a short caption (optional)',
            required: false,
          },
        ],
        fieldHint:
          'Upload 1 main photo (front) + 7 background collage photos (8 total).',
      },
      {
        id: 'birthday-message',
        label: 'Birthday Message Frame',
        image: '/images/keepsake-frame-3.png',
        photosRequired: 3,
        fields: [
          {
            key: 'header',
            label: 'Header title',
            placeholder: 'e.g. HAPPY BIRTHDAY',
            required: true,
          },
          {
            key: 'subtitle',
            label: 'Subtitle line',
            placeholder: 'Handwritten-style line',
            required: true,
          },
          {
            key: 'message',
            label: 'Message paragraph',
            placeholder: 'Your birthday message',
            required: true,
            multiline: true,
          },
          {
            key: 'date',
            label: 'Date',
            placeholder: 'e.g. 22/08/2003',
            required: true,
          },
          {
            key: 'qrLink',
            label: 'QR code link (optional)',
            placeholder: 'https://… song, playlist, or note',
            required: false,
          },
        ],
      },
      {
        id: 'anniversary-film',
        label: 'Anniversary Film Strip',
        image: '/images/keepsake-frame-4.png',
        photosRequired: 5,
        fieldHint:
          'Upload 1 main Polaroid photo + 4 photos for the film strip (5 total).',
        fields: [
          {
            key: 'title',
            label: 'Title',
            placeholder: 'e.g. 1st Anniversary',
            required: true,
          },
          {
            key: 'names',
            label: 'Names',
            placeholder: 'e.g. Darrel & Blayne',
            required: true,
          },
          {
            key: 'date',
            label: 'Date',
            placeholder: 'e.g. 20.05.2024',
            required: true,
          },
          {
            key: 'quote',
            label: 'Quote',
            placeholder: 'e.g. You are my today and all of my tomorrows',
            required: true,
            multiline: true,
          },
        ],
      },
      {
        id: 'custom',
        label: 'Custom template',
        whatsappCustom: true,
        image: '/images/custom-template.png',
        description:
          'Send your own layout / reference on WhatsApp and we will create it for you.',
      },
    ],
  },
  {
    id: 'coloring-book',
    slug: 'coloring-book',
    name: 'Coloring Book',
    category: 'albums',
    image: '/images/coloring-book-1.png',
    images: [
      '/images/coloring-book-1.png',
      '/images/coloring-book-2.png',
      '/images/coloring-book-3.png',
      '/images/coloring-book-4.png',
    ],
    imageAlt:
      'Personalized coloring book pages — custom line art from photos with pencils on dark surfaces.',
    description:
      'Custom line-art pages made from your photos — relax, colour, and keep it cute.',
    detailBullets: [
      '10 coloring pages',
      'Pencil colors',
      '1 sticker sheet',
    ],
    price: 2400,
  },
  {
    id: 'mini-photobook',
    slug: 'mini-photobook',
    name: 'Mini Photobook',
    category: 'polaroids',
    image: '/images/mini-photobook-1.png',
    images: [
      '/images/mini-photobook-1.png',
      '/images/mini-photobook-2.png',
      '/images/mini-photobook-3.png',
      '/images/mini-photobook-4.png',
    ],
    imageAlt:
      'Spiral-bound mini photobook with Polaroid-style pages, handwritten captions, and comb binding.',
    description:
      'Tiny spiral photobook — Polaroid-style pages in one pocket-sized keepsake.',
    detailBullets: [
      'Size 3.5×3.5 inches',
      'Includes 10 pictures',
    ],
    /** Workflow B: photos only (no captions collected on site) */
    photosPerUnit: 10,
    price: 1500,
  },
  {
    id: 'mini-bouquet',
    slug: 'mini-bouquet',
    name: 'Mini Bouquet',
    category: 'gifting',
    image: '/images/mini-bouquet.png',
    imageAlt:
      'Personalized SoCutesy mini bouquet wrapped in pink paper with Polaroid photos, jewelry, and beauty gifts.',
    description:
      'A gift bundle bouquet — photos, jewellery, and beauty bits wrapped up in pink.',
    detailBullets: [
      'Includes 5 polaroids',
      'Hair clip',
      'Pendant',
      'Bracelet',
      'Earrings',
      'Lip gloss',
      'Jelly tint',
    ],
    price: 4000,
  },
  {
    id: 'cd-journal',
    slug: 'cd-journal',
    name: 'CD Journal',
    category: 'gifting',
    image:
      'https://res.cloudinary.com/jdnt65gb/image/upload/v1791543524/socutesy/cd/cd-1.jpg',
    images: [
      'https://res.cloudinary.com/jdnt65gb/image/upload/v1791543524/socutesy/cd/cd-1.jpg',
      'https://res.cloudinary.com/jdnt65gb/image/upload/v1791543526/socutesy/cd/cd-2.jpg',
      'https://res.cloudinary.com/jdnt65gb/image/upload/v1791543528/socutesy/cd/cd-3.jpg',
    ],
    imageAlt:
      'Personalized CD journal — Lover scrapbook disc, vinyl-style designs, and photo collage CD cases.',
    description:
      'A custom CD journal with your songs, photos, and a personalized cover — perfect keepsakes.',
    detailBullets: [
      'Custom cover design',
      'Your track list / playlist',
      'Photo collage CD cases',
      'Gift-ready packaging',
    ],
    price: 800,
  },
  {
    id: 'phone-case',
    slug: 'phone-case',
    name: 'Phone Case',
    category: 'gifting',
    image:
      'https://res.cloudinary.com/jdnt65gb/image/upload/v1791545264/socutesy/phone-case/phone-case-1.jpg',
    images: [
      'https://res.cloudinary.com/jdnt65gb/image/upload/v1791545264/socutesy/phone-case/phone-case-1.jpg',
      'https://res.cloudinary.com/jdnt65gb/image/upload/v1791545266/socutesy/phone-case/phone-case-2.jpg',
      'https://res.cloudinary.com/jdnt65gb/image/upload/v1791545268/socutesy/phone-case/phone-case-3.jpg',
    ],
    imageAlt:
      'Personalized phone cases — collage sticker cases with photos, lyrics, and cute details.',
    description:
      'A custom phone case with your photos or design — cute, personal, everyday wear.',
    detailBullets: [
      'Upload your photos or send a design',
      'Compatible case styles on request',
      'Durable print finish',
    ],
    price: 1200,
  },
  {
    id: 'tote-bag',
    slug: 'tote-bag',
    name: 'Tote Bag',
    category: 'gifting',
    image: '/images/tote-bag-1.png?v=5',
    images: ['/images/tote-bag-1.png?v=5', '/images/tote-bag-2.jpg?v=5'],
    imageAlt:
      'Custom canvas tote bags — peacock floral print and playful smiley designs.',
    description:
      'A custom tote bag with your photos or design — cute, everyday, gift-ready.',
    detailBullets: [
      'Custom print design',
      'Durable everyday tote',
      'Send your photos or artwork on WhatsApp',
    ],
    price: 1500,
  },
  {
    id: 'mini-album',
    slug: 'mini-album',
    name: 'Mini Album',
    category: 'albums',
    image: '/images/mini-album-1.png',
    images: [
      '/images/mini-album-1.png',
      '/images/mini-album-2.png',
      '/images/mini-album-3.png',
      '/images/mini-album-4.png',
      '/images/mini-album-5.png',
      '/images/mini-album-6.png',
    ],
    imageAlt:
      'Spiral-bound mini album pages — scrapbook layouts, Polaroid grids, Spotify-style cover, and story spreads.',
    description:
      'Scrapbook-style mini album — size A5. Spiral-bound pages for photos, grids, and story spreads.',
    variants: [
      { sides: 6, price: 1800 },
      { sides: 8, price: 2200 },
      { sides: 10, price: 2500 },
    ],
  },
  {
    id: 'polaroids',
    slug: 'polaroids',
    name: 'Polaroids',
    category: 'polaroids',
    image: '/images/polaroids-1.png',
    images: ['/images/polaroids-1.png', '/images/polaroids-2.png'],
    imageAlt:
      'Polaroid-style photo prints with white borders — memories and portraits in classic instant-film format.',
    description:
      'Classic instant-film look — white borders and your memories in every print.',
    detailBullets: ['Size 3×3 inches'],
    /** Workflow B: one photo per Polaroid print */
    photosPerUnit: 1,
    price: 60,
  },
  {
    id: 'photobooth-strips',
    slug: 'photobooth-strips',
    name: 'Photobooth Strips',
    category: 'polaroids',
    image: '/images/photobooth-strips-cover.png',
    imageAlt:
      'Vertical photobooth strips — heart frames, film strip, camera collage, and soft pink layouts.',
    description:
      'Pick a strip template, add your photos & text, or send your own layout on WhatsApp.',
    detailBullets: [
      'Themed strip designs',
      '3–4 photos per strip (depends on template)',
      'Custom caption on some styles',
    ],
    sizes: [{ size: 'Standard strip', price: 250 }],
    designs: [
      {
        id: 'film-memories',
        label: 'Film Memories',
        image: '/images/photobooth-strips-1.png',
        photosRequired: 3,
        fields: [
          {
            key: 'caption',
            label: 'Bottom caption',
            placeholder: 'e.g. memories',
            required: true,
          },
        ],
      },
      {
        id: 'torn-hearts',
        label: 'Torn Hearts',
        image: '/images/photobooth-strips-2.png',
        photosRequired: 3,
        fields: [
          {
            key: 'note',
            label: 'Optional note',
            placeholder: 'Names or a short caption (optional)',
            required: false,
          },
        ],
      },
      {
        id: 'camera-collage',
        label: 'Camera Collage',
        image: '/images/photobooth-strips-3.png',
        photosRequired: 3,
        fields: [
          {
            key: 'note',
            label: 'Optional note',
            placeholder: 'Names or a short caption (optional)',
            required: false,
          },
        ],
      },
      {
        id: 'soft-pink',
        label: 'Soft Pink Strip',
        image: '/images/photobooth-strips-4.png',
        photosRequired: 4,
        fields: [
          {
            key: 'caption',
            label: 'Bottom caption',
            placeholder: 'e.g. us against the world',
            required: true,
          },
        ],
      },
      {
        id: 'custom',
        label: 'Custom template',
        whatsappCustom: true,
        image: '/images/custom-template.png',
        description:
          'Send your own photobooth strip layout on WhatsApp and we will create it for you.',
      },
    ],
  },
  {
    id: 'stickers',
    slug: 'stickers',
    name: 'Stickers',
    category: 'stationery',
    image: '/images/stickers-1.png',
    images: [
      '/images/stickers-1.png',
      '/images/stickers-2.png',
      '/images/stickers-3.png',
      '/images/stickers-4.png',
      '/images/stickers-5.png',
      '/images/stickers-6.png',
    ],
    imageAlt:
      'Die-cut sticker sheets — Y2K girly sets, love themes, retro media, red aesthetic, Starry Night, and cinema icons.',
    description:
      'Die-cut sticker sheets — Y2K, love, retro, and cinema vibes. Pick a design or send your own sheet on WhatsApp.',
    variantSelectLabel: 'Sticker sheet',
    variants: [
      { label: 'Sticker sheet 1', price: 250, image: '/images/stickers-1.png' },
      { label: 'Sticker sheet 2', price: 250, image: '/images/stickers-2.png' },
      { label: 'Sticker sheet 3', price: 250, image: '/images/stickers-3.png' },
      { label: 'Sticker sheet 4', price: 250, image: '/images/stickers-4.png' },
      { label: 'Sticker sheet 5', price: 250, image: '/images/stickers-5.png' },
      { label: 'Sticker sheet 6', price: 250, image: '/images/stickers-6.png' },
      {
        label: 'Custom sticker sheet',
        price: 250,
        image: '/images/custom-template.png',
        whatsappCustom: true,
      },
    ],
  },
  {
    id: 'bookmarks',
    slug: 'bookmarks',
    name: 'Bookmarks',
    category: 'stationery',
    image: '/images/bookmarks-1.png',
    imageAlt:
      'Cutesy reader bookmarks — pink bows, patterned sets, playful quotes, and striped designs.',
    description:
      'Cutesy bookmarks for readers — bows, patterns, quotes, and stripes. Sets of 2, 3, or 4.',
    variantSelectLabel: 'Choose set',
    /** Three photos only (no 4th). Order: 1st, then 3rd & 2nd swapped. Thumbnails match sets 2 / 3 / 4. */
    sharedVariantGallery: [
      '/images/bookmarks-1.png',
      '/images/bookmarks-3.png',
      '/images/bookmarks-2.png',
    ],
    variants: [
      {
        label: 'Set of 2 bookmarks',
        price: 450,
        image: '/images/bookmarks-1.png',
      },
      {
        label: 'Set of 3 bookmarks',
        price: 600,
        image: '/images/bookmarks-3.png',
      },
      {
        label: 'Set of 4 bookmarks',
        price: 750,
        image: '/images/bookmarks-2.png',
      },
    ],
  },
  {
    id: 'cards',
    slug: 'cards',
    name: 'Kraft Card',
    category: 'cards',
    image: '/images/cards-1.png',
    images: ['/images/cards-1.png', '/images/cards-2.png', '/images/cards-3.png'],
    imageAlt:
      'Custom handmade kraft cards on grass — Galentine scrapbook style with photos, stickers, and envelopes.',
    description:
      'Handmade kraft cards with photos and scrapbook details — birthdays, love notes, Galentine’s.',
    price: 600,
  },
  {
    id: 'scrapbook-card',
    slug: 'scrapbook-card',
    name: 'Scrapbook Card',
    category: 'cards',
    image: '/images/cards-1.jpg',
    images: ['/images/cards-1.jpg', '/images/cards-3.jpg', '/images/cards-2.jpg'],
    imageAlt:
      'Custom handmade scrapbook cards — black pages with photos, stickers, and handwritten notes.',
    description:
      'A black-page scrapbook card with your photos, stickers, and handwritten notes — birthdays & bestie gifts.',
    price: 1500,
  },
  {
    id: 'songbook',
    slug: 'songbook',
    name: 'Songbook',
    category: 'albums',
    image: '/images/songbook-1.png',
    images: [
      '/images/songbook-1.png',
      '/images/songbook-2.png',
      '/images/songbook-3.png',
      '/images/songbook-4.png',
      '/images/songbook-5.png',
      '/images/songbook-6.png',
      '/images/songbook-7.png',
      '/images/songbook-8.png',
    ],
    imageAlt:
      'Personalized songbook spreads — romantic scrapbook layouts, lyrics, polaroids, calendars, and music-player pages.',
    description:
      'A romantic songbook scrapbook — lyrics, photos, calendars, and music-player style pages.',
    price: 1200,
  },
]

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categoryId) {
  return products.filter((p) => p.category === categoryId)
}
