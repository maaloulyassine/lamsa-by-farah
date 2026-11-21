import { supabase } from './supabaseClient'

// Phase 6 (post-MVP bonus): admin view of all contact requests.
// Authorization is enforced server-side: contact_requests_select_admin,
// profiles_select_admin and contact_requests_update_admin require
// app_metadata.is_admin = true in the JWT; a column guard trigger limits
// admins to the status column.

const REQUEST_SELECT = 'id, user_id, provider_id, wedding_date, message, status, created_at, provider:providers(name, category:categories(name), governorate:governorates(name))'

export const ADMIN_STATUSES = ['pending', 'sent', 'closed']

export async function listAllContactRequests(filters = {}) {
  let query = supabase.from('contact_requests').select(REQUEST_SELECT).order('created_at', { ascending: false })
  if (filters.status && ADMIN_STATUSES.includes(filters.status)) query = query.eq('status', filters.status)
  const { data: requests, error } = await query
  if (error) return { data: null, error }

  // contact_requests.user_id → auth.users, not profiles, so PostgREST cannot embed profiles from this table.
  // Second query by user ids, merged client-side.
  const userIds = [...new Set((requests ?? []).map((request) => request.user_id))]
  if (userIds.length === 0) return { data: [], error: null }
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, full_name, phone').in('id', userIds)
  if (profilesError) return { data: null, error: profilesError }

  const byId = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  return { data: requests.map((request) => ({ ...request, client: byId.get(request.user_id) ?? null })), error: null }
}

export async function updateRequestStatus(requestId, newStatus) {
  if (!ADMIN_STATUSES.includes(newStatus)) return { data: null, error: new Error('Statut invalide.') }
  const { data, error } = await supabase.from('contact_requests').update({ status: newStatus }).eq('id', requestId).select('id, status')
  if (error) return { data: null, error }
  // RLS silently filters rows the caller may not update: treat 0 rows as a failure.
  if (!data || data.length === 0) return { data: null, error: new Error('Mise à jour refusée.') }
  return { data: data[0], error: null }
}
