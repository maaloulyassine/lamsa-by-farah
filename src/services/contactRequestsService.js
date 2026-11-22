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

// Lot 3a notifications: the user's own requests whose status moved past « En attente » (sent / closed),
// with updated_at so the bell can tell which changes are new. Explicit user_id filter (admins can read all rows).
export async function listMyRequestUpdates() {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) return { data: [], error: null }
  return supabase
    .from('contact_requests')
    .select('id, status, updated_at, provider:providers(name)')
    .eq('user_id', userId)
    .in('status', ['sent', 'closed'])
    .order('updated_at', { ascending: false })
    .limit(20)
}

// Phase 6.5: the user's own requests already transmitted to the provider (status 'sent'), for the Planning page.
// Explicit user_id filter: since Phase 6, contact_requests_select_admin lets admins read every row, so RLS
// alone would show an admin all users' requests. Plain (left) join to providers, like 4e
// ("Prestataire indisponible" fallback when the provider is later deactivated).
// Throws on error; the caller handles it silently.
export async function listSentContactRequests() {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) return []
  const { data, error } = await supabase
    .from('contact_requests')
    .select('id, wedding_date, created_at, status, provider:providers(name, category:categories(name))')
    .eq('status', 'sent')
    .eq('user_id', userId)
    .order('wedding_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
