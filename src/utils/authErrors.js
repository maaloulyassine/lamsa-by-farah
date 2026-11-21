// Maps Supabase Auth (GoTrue) error messages to French UI copy.
// Only Supabase-returned errors go through here; app-side French messages are shown as-is.
export function translateAuthError(message) {
  const m = (message || '').toLowerCase()
  if (m.includes('invalid login credentials'))
    return 'Email ou mot de passe incorrect.'
  if (m.includes('email not confirmed'))
    return 'Veuillez confirmer votre email avant de vous connecter.'
  if (m.includes('user already registered'))
    return 'Un compte existe déjà avec cet email.'
  if (m.includes('password should be at least 6 characters'))
    return 'Le mot de passe doit contenir au moins 6 caractères.'
  // GoTrue wording: "Unable to validate email address: invalid format"
  if (m.includes('invalid email') || m.includes('unable to validate email address'))
    return 'Adresse email invalide.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Trop de tentatives. Veuillez réessayer dans quelques minutes.'
  return 'Une erreur est survenue. Veuillez réessayer.'
}
