export const tndFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'TND',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatTnd(n) { return tndFormatter.format(Number(n) || 0) }

// Upper bound of numeric(12, 2) columns (expenses.amount, weddings.total_budget).
export const MAX_TND_AMOUNT = 9999999999.99

export function roundTnd(n) { return Math.round(n * 100) / 100 }

// Parses a raw form value into a TND amount rounded to 2 decimals.
// Returns { value } or { error } with French copy.
export function parseTndAmount(raw, { allowZero = false } = {}) {
  const text = String(raw ?? '').trim()
  if (!text) return { error: 'Veuillez saisir un montant.' }
  const parsed = Number(text)
  if (!Number.isFinite(parsed)) return { error: 'Le montant doit être un nombre valide.' }
  const value = roundTnd(parsed)
  if (allowZero ? value < 0 : value <= 0) {
    return { error: allowZero ? 'Le montant doit être positif ou nul.' : 'Le montant doit être strictement supérieur à 0.' }
  }
  if (value > MAX_TND_AMOUNT) return { error: `Le montant ne peut pas dépasser ${formatTnd(MAX_TND_AMOUNT)}.` }
  return { value }
}

// French copy for failed Supabase mutations; network failures surface as "Failed to fetch".
export function mutationErrorMessage(error, fallback) {
  const message = error?.message || ''
  if (!message) return fallback
  if (/failed to fetch|network/i.test(message)) return 'Connexion impossible. Vérifiez votre réseau puis réessayez.'
  return message
}
