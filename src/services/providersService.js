import { supabase } from './supabaseClient'

const PROVIDER_SELECT = '*, category:categories(id, name, slug, icon, sort_order), governorate:governorates(id, name, slug)'

// Server-side filters: category and governorate; ordered by name.
// Text search (name OR city) is applied client-side by the caller to avoid
// building PostgREST `or` expressions from free user input.
// Price and rating filters/sorts were removed in Phase 6.6 (no real pricing or
// review data yet); the columns stay in the schema for a later release.
export async function listProviders(filters = {}) {
  let query = supabase.from('providers').select(PROVIDER_SELECT).eq('is_active', true)

  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.governorateId) query = query.eq('governorate_id', filters.governorateId)

  return query.order('name', { ascending: true })
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
