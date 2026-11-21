import { supabase } from './supabaseClient'

// status is enforced to 'pending' by RLS (contact_requests_insert_owner) and set explicitly here.
// Returning nothing: the insert needs no SELECT round-trip.
export async function createContactRequest({ user_id, provider_id, wedding_date, message }) {
  return supabase
    .from('contact_requests')
    .insert({ user_id, provider_id, wedding_date: wedding_date || null, message, status: 'pending' })
}
