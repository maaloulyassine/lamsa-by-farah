import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listFavoriteProviders } from '../../services/favoritesService'
import { ProviderCard } from '../providers/ProviderCard'
import { ProviderDetail } from '../providers/ProviderDetail'
import { runViewTransition } from '../../utils/viewTransition'
import { useFavoriteToggle } from './useFavoriteToggle'
import { Flourish } from '../ui/Flourish'

const SUCCESS_TIMEOUT_MS = 5000
const CONTACT_SUCCESS = 'Votre demande a été envoyée. Le prestataire doit confirmer sa disponibilité.'

function favoritesCountLabel(count) {
  if (count === 0) return 'Aucun prestataire'
  if (count === 1) return '1 prestataire en favori'
  return `${count} prestataires en favoris`
}

function SkeletonCards() {
  return (
    <div className="provider-grid favorites-grid" aria-busy="true" aria-label="Chargement des favoris">
      {[0, 1, 2].map((key) => <div key={key} className="provider-card provider-card-skeleton"><span /><span /><span /></div>)}
    </div>
  )
}

export function FavoritesPage({ wedding, userId, onDiscover, selectedSlug = null, onOpenProvider, onCloseProvider }) {
  // providers keeps the fetched rows; favoriteIds (optimistic) decides which ones are shown,
  // so an unfavorited card disappears immediately and comes back if the mutation fails.
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [morphSlug, setMorphSlug] = useState(null)
  const [success, setSuccess] = useState('')
  const lastOpened = useRef(null)
  const { favoriteIds, setFavoriteIds, pendingIds, toggleFavorite, toggleError, clearToggleError } = useFavoriteToggle()

  const apply = useCallback(({ data, error: loadError }) => {
    if (loadError) setError('Impossible de charger vos favoris.')
    else {
      setError('')
      setProviders(data)
      setFavoriteIds(data.map((provider) => provider.id))
    }
    setLoading(false)
  }, [setFavoriteIds])

  // Fresh fetch on every mount: favorites added from Services always show up here.
  useEffect(() => {
    let active = true
    listFavoriteProviders().then((result) => { if (active) apply(result) })
    return () => { active = false }
  }, [apply])

  const retry = async () => {
    setLoading(true)
    setError('')
    apply(await listFavoriteProviders())
  }

  useEffect(() => {
    if (!success) return undefined
    const timer = setTimeout(() => setSuccess(''), SUCCESS_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [success])

  useEffect(() => {
    if (selectedSlug || !lastOpened.current) return
    document.querySelector(`[data-provider-id="${lastOpened.current}"] .provider-open`)?.focus()
  }, [selectedSlug])

  const visible = useMemo(() => providers.filter((provider) => favoriteIds.has(provider.id)), [providers, favoriteIds])

  const toasts = (
    <>
      {success && <p className="success-banner" role="status">{success}</p>}
      {toggleError && <div className="error-banner favorite-toast" role="alert"><span>{toggleError}</span><button type="button" onClick={clearToggleError}>Fermer</button></div>}
    </>
  )

  if (selectedSlug) {
    return (
      <>
        {toasts}
        <ProviderDetail
          key={selectedSlug}
          providerSlug={selectedSlug}
          wedding={wedding}
          userId={userId}
          backLabel="Retour à mes favoris"
          onBack={onCloseProvider}
          onSent={() => setSuccess(CONTACT_SUCCESS)}
          preview={providers.find((provider) => provider.slug === selectedSlug) || null}
          favoriteFor={(id) => ({ isFavorite: favoriteIds.has(id), favoritePending: pendingIds.has(id), onToggleFavorite: toggleFavorite })}
        />
      </>
    )
  }

  let content
  if (loading) content = <SkeletonCards />
  else if (error) content = <div className="error-banner" role="alert"><span>{error}</span><button type="button" onClick={retry}>Réessayer</button></div>
  else if (visible.length === 0) {
    content = (
      <div className="empty-state favorites-empty">
        <h3>Aucun prestataire en favoris pour le moment.</h3>
        <p>Parcourez les services et ajoutez des prestataires à vos favoris.</p>
        <button type="button" className="primary-button" onClick={onDiscover}>Découvrir les services</button>
      </div>
    )
  } else {
    content = (
      <div className="provider-grid favorites-grid">
        {visible.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onOpen={() => { lastOpened.current = provider.id; runViewTransition(() => { onOpenProvider(provider.slug); window.scrollTo(0, 0) }, () => setMorphSlug(provider.slug)) }}
            morph={provider.slug === morphSlug}
            isFavorite
            favoritePending={pendingIds.has(provider.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="favorites-page" aria-labelledby="favorites-page-title">
      <div className="page-title">
        <div>
          <p className="eyebrow">Votre sélection</p>
          <h1 id="favorites-page-title">Mes favoris</h1>
          <Flourish className="title-flourish" />
        </div>
      </div>
      {toasts}
      {!loading && !error && visible.length > 0 && (
        <p className="favorites-count" data-testid="favorites-count">{favoritesCountLabel(visible.length)}</p>
      )}
      {content}
    </section>
  )
}
