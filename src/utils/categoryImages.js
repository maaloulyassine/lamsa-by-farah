// Phase 6.7: one free-stock illustration per category, used when a provider has no cover_image_url.
// These are NOT photos of the providers — the UI always labels them "Photo d'illustration".
// Paths are prefixed with Vite's BASE_URL so they resolve under /lamsa-by-farah/ on GitHub Pages.
const CATEGORY_SLUGS = [
  'salles-de-mariage',
  'robes-de-mariee',
  'coiffure-maquillage',
  'decoration',
  'traiteurs-et-chefs',
  'gateaux',
  'photo-video',
  'dj-artistes',
  'fleurs',
  'location-voitures',
]

const base = import.meta.env.BASE_URL

export const categoryImages = Object.fromEntries(
  CATEGORY_SLUGS.map((slug) => [slug, `${base}images/categories/${slug}.webp`]),
)

export function getCategoryImage(slug) {
  return categoryImages[slug] || null
}
