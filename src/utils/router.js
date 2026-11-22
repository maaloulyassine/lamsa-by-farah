import { useSyncExternalStore } from 'react'
import { runViewTransition } from './viewTransition'

// Hash routes (GitHub Pages + offline friendly): #/accueil, #/services/<slug>, #/profil/projet…
// The store is updated synchronously on navigate() (history.pushState does not fire hashchange),
// so a navigation can run inside a View Transition. Back / forward (popstate) are wrapped in one too.
const ROUTES = {
  home: 'accueil',
  planning: 'planning',
  budget: 'budget',
  services: 'services',
  favorites: 'favoris',
  profile: 'profil',
  'edit-project': 'profil/projet',
  'edit-profile': 'profil/modifier',
  requests: 'demandes',
  'admin-requests': 'admin',
}
const PAGE_BY_PATH = Object.fromEntries(Object.entries(ROUTES).map(([page, path]) => [path, page]))
const DETAIL = /^(services|favoris)\/([a-z0-9-]+)$/

export function parseHash(hash) {
  let path = (hash || '').replace(/^#\/?/, '').replace(/\/+$/, '')
  try { path = decodeURIComponent(path) } catch { /* malformed escape: treated as unknown */ }
  if (!path) return { page: 'home', slug: null, known: true }
  if (PAGE_BY_PATH[path]) return { page: PAGE_BY_PATH[path], slug: null, known: true }
  const detail = path.match(DETAIL)
  if (detail) return { page: detail[1] === 'services' ? 'services' : 'favorites', slug: detail[2], known: true }
  return { page: 'home', slug: null, known: false }
}

export function toHash({ page, slug = null }) {
  return `#/${ROUTES[page] || ROUTES.home}${slug ? `/${encodeURIComponent(slug)}` : ''}`
}

const hasWindow = typeof window !== 'undefined'
let current = hasWindow ? window.location.hash : ''
let popPending = false
const listeners = new Set()
const emit = () => listeners.forEach((listener) => listener())

if (hasWindow) {
  window.addEventListener('popstate', () => {
    if (window.location.hash === current) return
    popPending = true
    runViewTransition(() => {
      popPending = false
      current = window.location.hash
      emit()
    })
  })
  // Hash typed / edited by hand (no popstate in some browsers): apply directly.
  window.addEventListener('hashchange', () => {
    if (popPending || window.location.hash === current) return
    current = window.location.hash
    emit()
  })
}

// `state` is stored in history.state (e.g. { fromList: true } when a detail is opened from a list).
export function navigate(route, { replace = false, state = null } = {}) {
  const hash = toHash(route)
  if (hash === current && !replace) return
  const data = { lamsa: true, ...(state || {}) }
  if (replace) window.history.replaceState(data, '', hash)
  else window.history.pushState(data, '', hash)
  current = hash
  emit()
}

// True when the current history entry was pushed with that flag (lets « Retour » use history.back()).
export function historyFlag(flag) {
  return hasWindow && window.history.state?.[flag] === true
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => current, () => '')
  return parseHash(hash)
}
