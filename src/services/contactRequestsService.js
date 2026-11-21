import { supabase } from './supabaseClient'

// status is enforced to 'pending' by RLS (contact_requests_insert_owner) and set explicitly here.
// Returning nothing: the insert needs no SELECT round-trip.
export async function createContactRequest({ user_id, provider_id, wedding_date, message }) {
  return supabase
    .from('contact_requests')
    .insert({ user_id, provider_id, wedding_date: wedding_date || null, message, status: 'pending' })
}

// Read-only history for the "Mes demandes de contact" screen, newest first.
// Plain (left) join: a request to a provider deactivated later stays listed (provider = null).
export async function listMyContactRequests() {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) return { data: null, error: new Error('Session expirée. Veuillez vous reconnecter.') }
  return supabase
    .from('contact_requests')
    .select('id, wedding_date, message, status, created_at, provider:providers(name, category:categories(name), governorate:governorates(name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}
