import { supabase } from './supabaseClient'

const FAVORITE_PROVIDER_SELECT = 'created_at, provider:providers!inner(*, category:categories(id, name, slug, icon, sort_order), governorate:governorates(id, name, slug))'

// favorites.user_id has no default and RLS checks auth.uid() = user_id,
// so the id is read from the local session (no network round-trip).
async function currentUserId() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}

const noSessionError = () => ({ data: null, error: new Error('Session expirée. Veuillez vous reconnecter.') })

export async function listFavoriteIds() {
  const userId = await currentUserId()
  if (!userId) return noSessionError()
  const { data, error } = await supabase.from('favorites').select('provider_id').eq('user_id', userId)
  return { data: error ? null : (data ?? []).map((row) => row.provider_id), error }
}

// One query: favorites joined to active providers (inner join drops inactive ones).
export async function listFavoriteProviders() {
  const userId = await currentUserId()
  if (!userId) return noSessionError()
  const { data, error } = await supabase
    .from('favorites')
    .select(FAVORITE_PROVIDER_SELECT)
    .eq('user_id', userId)
    .eq('provider.is_active', true)
    .order('created_at', { ascending: false })
  return { data: error ? null : (data ?? []).map((row) => row.provider).filter(Boolean), error }
}

// INSERT ... ON CONFLICT (user_id, provider_id) DO NOTHING
export async function addFavorite(providerId) {
  const userId = await currentUserId()
  if (!userId) return noSessionError()
  return supabase
    .from('favorites')
    .upsert({ user_id: userId, provider_id: providerId }, { onConflict: 'user_id,provider_id', ignoreDuplicates: true })
}

export async function removeFavorite(providerId) {
  const userId = await currentUserId()
  if (!userId) return noSessionError()
  return supabase.from('favorites').delete().eq('user_id', userId).eq('provider_id', providerId)
}
