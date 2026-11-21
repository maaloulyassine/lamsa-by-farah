import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listFilterOptions, listProviders } from '../../services/providersService'
import { ProviderCard } from './ProviderCard'
import { ProviderDetail } from './ProviderDetail'
import { ProviderFilters } from './ProviderFilters'

const EMPTY_FILTERS = {
  search: '',
  categoryId: '',
  governorateId: '',
  priceMin: '',
  priceMax: '',
  ratingMin: '0',
  sort: 'name',
}
const FILTER_DEBOUNCE_MS = 250
const SUCCESS_TIMEOUT_MS = 5000
const CONTACT_SUCCESS = 'Votre demande a été envoyée. Le prestataire doit confirmer sa disponibilité.'

function countActiveFilters(filters) {
  return ['search', 'categoryId', 'governorateId', 'priceMin', 'priceMax'].filter((key) => String(filters[key]).trim() !== '').length
    + (Number(filters.ratingMin) > 0 ? 1 : 0)
}

function getPriceError({ priceMin, priceMax }) {
  const min = priceMin === '' ? null : Number(priceMin)
  const max = priceMax === '' ? null : Number(priceMax)
  if ((min !== null && (!Number.isFinite(min) || min < 0)) || (max !== null && (!Number.isFinite(max) || max < 0))) {
    return 'Les prix doivent être des nombres positifs.'
  }
  if (min !== null && max !== null && min > max) return 'Le prix minimum doit être inférieur ou égal au prix maximum.'
  return ''
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

  const { categoryId, governorateId, priceMin, priceMax, ratingMin, sort } = filters
  const priceError = getPriceError(filters)
  const serverFilters = useMemo(
    () => ({ categoryId, governorateId, priceMin, priceMax, ratingMin, sort }),
    [categoryId, governorateId, priceMin, priceMax, ratingMin, sort],
  )

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
    if (priceError) return undefined
    const timer = setTimeout(() => refetch(serverFilters), FILTER_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [serverFilters, priceError, refetch])

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

  const toast = success && <p className="success-banner" role="status" onAnimationEnd={() => setSuccess('')}>{success}</p>

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
        />
      </>
    )
  }

  let listContent
  if (priceError) {
    listContent = null
  } else if (listLoading) {
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
    listContent = <div className="provider-grid">{visibleProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} onOpen={openProvider} />)}</div>
  }

  return (
    <section className="providers-page" aria-labelledby="providers-page-title">
      <div className="page-title">
        <div>
          <p className="eyebrow">Tout pour votre grand jour</p>
          <h1 id="providers-page-title">Trouver un service</h1>
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
        priceError={priceError}
      />
      <div className="section-heading">
        <h2>Prestataires</h2>
        {!listLoading && !listError && !priceError && (
          <span data-testid="provider-count">{visibleProviders.length} résultat{visibleProviders.length > 1 ? 's' : ''}</span>
        )}
      </div>
      <p className="provider-demo-note">Les prestataires affichés sont des exemples de démonstration fictifs. Prix et disponibilités indicatifs.</p>
      {listContent}
    </section>
  )
}
