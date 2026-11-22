import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listFavoriteIds } from '../../services/favoritesService'
import { listFilterOptions, listProviders } from '../../services/providersService'
import { useFavoriteToggle } from '../favorites/useFavoriteToggle'
import { ProviderCard } from './ProviderCard'
import { ProviderDetail } from './ProviderDetail'
import { ProviderFilters } from './ProviderFilters'
import { Flourish } from '../ui/Flourish'

const EMPTY_FILTERS = {
  search: '',
  categoryId: '',
  governorateId: '',
}
const FILTER_DEBOUNCE_MS = 250
const SUCCESS_TIMEOUT_MS = 5000
const CONTACT_SUCCESS = 'Votre demande a été envoyée. Le prestataire doit confirmer sa disponibilité.'

function countActiveFilters(filters) {
  return ['search', 'categoryId', 'governorateId'].filter((key) => String(filters[key]).trim() !== '').length
}

function SkeletonCards() {
  return (
    <div className="provider-grid" aria-busy="true" aria-label="Chargement des prestataires">
      {[0, 1, 2].map((key) => <div key={key} className="provider-card provider-card-skeleton"><span /><span /><span /></div>)}
    </div>
  )
}

export function ProvidersPage({ wedding, userId }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [categories, setCategories] = useState([])
  const [governorates, setGovernorates] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const [providers, setProviders] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [success, setSuccess] = useState('')
  const requestId = useRef(0)
  const lastOpened = useRef(null)
  const listScrollY = useRef(0)
  const { favoriteIds, setFavoriteIds, pendingIds, toggleFavorite, toggleError, clearToggleError } = useFavoriteToggle()
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [favoritesError, setFavoritesError] = useState('')

  const { categoryId, governorateId } = filters
  const serverFilters = useMemo(() => ({ categoryId, governorateId }), [categoryId, governorateId])

  // Filter dropdown data (categories + governorates).
  const applyOptions = useCallback(([catRes, govRes]) => {
    const error = catRes.error || govRes.error
    setOptionsError(error ? error.message : '')
    if (!catRes.error) setCategories(catRes.data ?? [])
    if (!govRes.error) setGovernorates(govRes.data ?? [])
    setOptionsLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    listFilterOptions().then((results) => { if (active) applyOptions(results) })
    return () => { active = false }
  }, [applyOptions])

  // Favorite ids are fetched fresh on every mount (no cross-screen cache).
  const applyFavoriteIds = useCallback(({ data, error }) => {
    if (error) setFavoritesError('Impossible de charger vos favoris.')
    else {
      setFavoritesError('')
      setFavoriteIds(data)
    }
    setFavoritesLoading(false)
  }, [setFavoriteIds])

  useEffect(() => {
    let active = true
    listFavoriteIds().then((result) => { if (active) applyFavoriteIds(result) })
    return () => { active = false }
  }, [applyFavoriteIds])

  const retryFavorites = async () => {
    setFavoritesLoading(true)
    applyFavoriteIds(await listFavoriteIds())
  }

  // Hearts stay disabled until the user's favorites are known, so a toggle never starts from a wrong state.
  const favoriteProps = (id) => ({
    isFavorite: favoriteIds.has(id),
    favoritePending: favoritesLoading || Boolean(favoritesError) || pendingIds.has(id),
    onToggleFavorite: toggleFavorite,
  })

  const retryOptions = async () => {
    setOptionsLoading(true)
    setOptionsError('')
    applyOptions(await listFilterOptions())
  }

  // Provider list: refetch re-runs the Supabase query with the current filters (no page reload).
  const refetch = useCallback(async (nextFilters) => {
    const id = ++requestId.current
    setListLoading(true)
    setListError('')
    const { data, error } = await listProviders(nextFilters)
    if (id !== requestId.current) return
    if (error) setListError(error.message)
    else setProviders(data ?? [])
    setListLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => refetch(serverFilters), FILTER_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [serverFilters, refetch])

  useEffect(() => {
    if (!success) return undefined
    const timer = setTimeout(() => setSuccess(''), SUCCESS_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [success])

  // Back from detail: restore scroll and focus the card that was opened.
  useEffect(() => {
    if (selectedId || !lastOpened.current) return
    window.scrollTo(0, listScrollY.current)
    document.querySelector(`[data-provider-id="${lastOpened.current}"] .provider-open`)?.focus()
  }, [selectedId])

  const visibleProviders = useMemo(() => {
    const term = filters.search.trim().toLocaleLowerCase('fr-FR')
    if (!term) return providers
    return providers.filter((provider) => `${provider.name} ${provider.city}`.toLocaleLowerCase('fr-FR').includes(term))
  }, [providers, filters.search])

  const activeCount = countActiveFilters(filters)
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const clearFilters = () => setFilters(EMPTY_FILTERS)

  const openProvider = (id) => {
    lastOpened.current = id
    listScrollY.current = window.scrollY
    setSelectedId(id)
    window.scrollTo(0, 0)
  }

  const toast = (
    <>
      {success && <p className="success-banner" role="status">{success}</p>}
      {toggleError && <div className="error-banner favorite-toast" role="alert"><span>{toggleError}</span><button type="button" onClick={clearToggleError}>Fermer</button></div>}
      {favoritesError && <div className="error-banner" role="alert"><span>{favoritesError}</span><button type="button" onClick={retryFavorites}>Réessayer</button></div>}
    </>
  )

  if (selectedId) {
    return (
      <>
        {toast}
        <ProviderDetail
          key={selectedId}
          providerId={selectedId}
          wedding={wedding}
          userId={userId}
          onBack={() => setSelectedId(null)}
          onSent={() => setSuccess(CONTACT_SUCCESS)}
          {...favoriteProps(selectedId)}
        />
      </>
    )
  }

  let listContent
  if (listLoading) {
    listContent = <SkeletonCards />
  } else if (listError) {
    listContent = <div className="error-banner" role="alert"><span>Les prestataires n’ont pas pu être chargés.</span><button type="button" onClick={() => refetch(serverFilters)}>Réessayer</button></div>
  } else if (visibleProviders.length === 0) {
    listContent = activeCount === 0
      ? <div className="empty-state"><h3>Aucun prestataire disponible.</h3></div>
      : (
        <div className="empty-state">
          <h3>Aucun prestataire ne correspond à vos critères.</h3>
          <button type="button" className="primary-button" onClick={clearFilters}>Effacer les filtres</button>
        </div>
      )
  } else {
    listContent = <div className="provider-grid">{visibleProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} onOpen={openProvider} {...favoriteProps(provider.id)} />)}</div>
  }

  return (
    <section className="providers-page" aria-labelledby="providers-page-title">
      <div className="page-title">
        <div>
          <p className="eyebrow">Tout pour votre grand jour</p>
          <h1 id="providers-page-title">Trouver un service</h1>
          <Flourish className="title-flourish" />
        </div>
      </div>
      {toast}
      <ProviderFilters
        filters={filters}
        activeCount={activeCount}
        onChange={updateFilter}
        onClear={clearFilters}
        categories={categories}
        governorates={governorates}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        onRetryOptions={retryOptions}
      />
      <div className="section-heading">
        <h2>Prestataires</h2>
        {!listLoading && !listError && (
          <span data-testid="provider-count">{visibleProviders.length} résultat{visibleProviders.length > 1 ? 's' : ''}</span>
        )}
      </div>
      <p className="provider-demo-note">Coordonnées issues de recherches manuelles. Notes, prix et disponibilités indicatifs : contactez directement le prestataire.</p>
      {listContent}
    </section>
  )
}
