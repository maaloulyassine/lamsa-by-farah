import { useCallback, useEffect, useRef, useState } from 'react'
import { addFavorite, removeFavorite } from '../../services/favoritesService'

export const FAVORITE_ERROR = 'Impossible de mettre à jour les favoris. Réessayez.'
const ERROR_TIMEOUT_MS = 4000

// Shared optimistic favorite toggle (Services list, provider detail, Favorites screen).
// - favoriteIds: Set of provider ids currently shown as favorites
// - pendingIds: Set of provider ids with a mutation in flight (button disabled, extra clicks ignored)
export function useFavoriteToggle() {
  const [favoriteIds, setFavoriteIdsState] = useState(() => new Set())
  const [pendingIds, setPendingIds] = useState(() => new Set())
  const [toggleError, setToggleError] = useState('')
  const favoritesRef = useRef(new Set())
  const pendingRef = useRef(new Set())

  const setFavoriteIds = useCallback((ids) => {
    const next = new Set(ids)
    favoritesRef.current = next
    setFavoriteIdsState(next)
  }, [])

  const toggleFavorite = useCallback(async (providerId) => {
    if (pendingRef.current.has(providerId)) return
    pendingRef.current = new Set(pendingRef.current).add(providerId)
    setPendingIds(pendingRef.current)

    const wasFavorite = favoritesRef.current.has(providerId)
    const optimistic = new Set(favoritesRef.current)
    if (wasFavorite) optimistic.delete(providerId)
    else optimistic.add(providerId)
    setFavoriteIds(optimistic)

    let failed = false
    try {
      const { error } = wasFavorite ? await removeFavorite(providerId) : await addFavorite(providerId)
      failed = Boolean(error)
    } catch {
      failed = true
    }

    if (failed) {
      const reverted = new Set(favoritesRef.current)
      if (wasFavorite) reverted.add(providerId)
      else reverted.delete(providerId)
      setFavoriteIds(reverted)
      setToggleError(FAVORITE_ERROR)
    }

    const stillPending = new Set(pendingRef.current)
    stillPending.delete(providerId)
    pendingRef.current = stillPending
    setPendingIds(stillPending)
  }, [setFavoriteIds])

  useEffect(() => {
    if (!toggleError) return undefined
    const timer = setTimeout(() => setToggleError(''), ERROR_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [toggleError])

  return { favoriteIds, setFavoriteIds, pendingIds, toggleFavorite, toggleError, clearToggleError: () => setToggleError('') }
}
