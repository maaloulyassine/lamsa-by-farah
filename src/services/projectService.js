import { supabase } from './supabaseClient'

// Active governorates for the wedding-project form.
export async function listGovernorates() {
  return supabase.from('governorates').select('id,name,slug').eq('is_active', true).order('name')
}

// Owner-only update (RLS weddings_update_owner); both ids in the filter for clarity.
export async function updateWedding(weddingId, userId, row) {
  return supabase.from('weddings').update(row).eq('id', weddingId).eq('user_id', userId).select().single()
}

// Owner-only update (RLS profiles_update_own).
export async function updateProfile(userId, { full_name, phone }) {
  return supabase.from('profiles').update({ full_name, phone }).eq('id', userId).select().single()
}
