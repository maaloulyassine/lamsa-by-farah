import { supabase } from './supabaseClient'

const PROVIDER_SELECT = '*, category:categories(id, name, slug, icon, sort_order), governorate:governorates(id, name, slug)'

export const PROVIDER_SORTS = {
  name: [['name', { ascending: true }]],
  price_asc: [['price_from', { ascending: true, nullsFirst: false }], ['name', { ascending: true }]],
  price_desc: [['price_from', { ascending: false, nullsFirst: false }], ['name', { ascending: true }]],
  rating_desc: [['rating', { ascending: false }], ['review_count', { ascending: false }], ['name', { ascending: true }]],
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

// Server-side filters (category, governorate, price, rating, sort).
// Text search (name OR city) is applied client-side by the caller to avoid
// building PostgREST `or` expressions from free user input.
// Price semantics: the provider's indicative range must fit inside [min, max]:
//   price_from >= min AND COALESCE(price_to, price_from) <= max.
export async function listProviders(filters = {}) {
  let query = supabase.from('providers').select(PROVIDER_SELECT).eq('is_active', true)

  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.governorateId) query = query.eq('governorate_id', filters.governorateId)

  const priceMin = toNumber(filters.priceMin)
  const priceMax = toNumber(filters.priceMax)
  const ratingMin = toNumber(filters.ratingMin)
  if (priceMin !== null) query = query.gte('price_from', priceMin)
  if (priceMax !== null) query = query.or(`price_to.lte.${priceMax},and(price_to.is.null,price_from.lte.${priceMax})`)
  if (ratingMin) query = query.gte('rating', ratingMin)

  for (const [column, options] of PROVIDER_SORTS[filters.sort] || PROVIDER_SORTS.name) {
    query = query.order(column, options)
  }
  return query
}

export async function getProviderById(id) {
  return supabase
    .from('providers')
    .select(PROVIDER_SELECT)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()
}

export async function listFilterOptions() {
  return Promise.all([
    supabase.from('categories').select('id, name, slug, icon, sort_order').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('governorates').select('id, name, slug').eq('is_active', true).order('name', { ascending: true }),
  ])
}
