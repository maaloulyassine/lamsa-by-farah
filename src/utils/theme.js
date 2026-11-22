import { useSyncExternalStore } from 'react'
import { runViewTransition } from './viewTransition'

// Light ("clair", default) or evening ("soiree") theme. The choice is a per-device convenience
// kept in localStorage; index.html applies it before the first paint to avoid a light flash.
const STORAGE_KEY = 'lamsa-theme'
const THEME_COLORS = { clair: '#f7f0e9', soiree: '#1b1411' }
const listeners = new Set()

function currentTheme() {
  return typeof document !== 'undefined' && document.documentElement.dataset.theme === 'soiree' ? 'soiree' : 'clair'
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'soiree') root.dataset.theme = 'soiree'
  else delete root.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (private mode, blocked site data): the theme still applies for this visit.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, currentTheme, () => 'clair')
}

// Cross-fades between the two themes where View Transitions are supported.
export function toggleTheme() {
  const next = currentTheme() === 'soiree' ? 'clair' : 'soiree'
  runViewTransition(() => applyTheme(next))
}
