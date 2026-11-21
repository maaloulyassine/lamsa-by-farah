import { useState } from 'react'

// Price, rating and sort controls removed (Phase 6.6): no real pricing/review data yet.

export function ProviderFilters({ filters, activeCount, onChange, onClear, categories, governorates, optionsLoading, optionsError, onRetryOptions }) {
  const [open, setOpen] = useState(false)
  const set = (key) => (event) => onChange(key, event.target.value)
  const selectsDisabled = optionsLoading || Boolean(optionsError)

  return (
    <section className="provider-filters" aria-label="Filtres des prestataires">
      <div className="provider-search">
        <label htmlFor="provider-search" className="visually-hidden">Rechercher par nom ou ville</label>
        <input
          id="provider-search"
          type="search"
          placeholder="Rechercher par nom ou ville..."
          value={filters.search}
          onChange={set('search')}
        />
        <button
          type="button"
          className="secondary-button provider-filters-toggle"
          aria-expanded={open}
          aria-controls="provider-filters-panel"
          onClick={() => setOpen((value) => !value)}
        >
          Filtres{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>

      {optionsError && (
        <div className="error-banner" role="alert">
          <span>Impossible de charger les filtres.</span>
          <button type="button" onClick={onRetryOptions}>Réessayer</button>
        </div>
      )}

      <div id="provider-filters-panel" className={`provider-filters-panel ${open ? 'is-open' : ''}`} aria-busy={optionsLoading}>
        <label>
          Catégorie
          <select value={filters.categoryId} onChange={set('categoryId')} disabled={selectsDisabled} className={optionsLoading ? 'is-loading' : ''}>
            <option value="">Toutes les catégories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>
          Gouvernorat
          <select value={filters.governorateId} onChange={set('governorateId')} disabled={selectsDisabled} className={optionsLoading ? 'is-loading' : ''}>
            <option value="">Tous les gouvernorats</option>
            {governorates.map((governorate) => <option key={governorate.id} value={governorate.id}>{governorate.name}</option>)}
          </select>
        </label>
        <button type="button" className="text-button provider-clear" onClick={onClear} disabled={activeCount === 0}>
          Effacer les filtres
        </button>
      </div>
    </section>
  )
}
