import { flushSync } from 'react-dom'

// Runs a React state update inside a View Transition when the browser supports it
// (Chrome / Edge 111+, Safari 18+). Elsewhere, or when the user prefers reduced motion,
// the update is applied immediately, exactly as before.
// `prepare` (optional) runs first and synchronously, e.g. to tag the element that should morph
// so it is part of the "old" snapshot.
export function runViewTransition(update, prepare) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (typeof document === 'undefined' || !document.startViewTransition || reduce) {
    prepare?.()
    update()
    return
  }
  if (prepare) flushSync(prepare)
  document.startViewTransition(() => {
    flushSync(update)
  })
}
