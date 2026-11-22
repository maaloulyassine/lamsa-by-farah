// Couple-name helpers: « Sarra & Karim » → ['Sarra', 'Karim'] → monogram S&K; « Maaloul » → M.
const SEPARATORS = /\s*(?:&|\+|\/|\bet\b|\band\b)\s*/i

export function coupleParts(name) {
  const clean = (name || '').trim().replace(/\s+/g, ' ')
  if (!clean) return []
  const parts = clean.split(SEPARATORS).map((part) => part.trim()).filter(Boolean)
  return parts.length >= 2 ? [parts[0], parts.slice(1).join(' & ')] : [clean]
}

function firstLetter(text) {
  const match = (text || '').match(/\p{L}/u)
  return match ? match[0].toLocaleUpperCase('fr-FR') : ''
}

// One letter per partner (max two); falls back to `fallback` (e.g. the profile name), then « L » for Lamsa.
export function monogramLetters(name, fallback = '') {
  const parts = coupleParts(name)
  const letters = parts.map(firstLetter).filter(Boolean).slice(0, 2)
  if (letters.length) return letters
  const alt = firstLetter(fallback)
  return [alt || 'L']
}
