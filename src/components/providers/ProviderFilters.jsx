import { useState } from 'react'

const RATING_OPTIONS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

export function ProviderFilters({ filters, activeCount, onChange, onClear, categories, governorates, optionsLoading, optionsError, onRetryOptions, priceError }) {
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
        <label>
          Prix min (TND)
          <input type="number" inputMode="decimal" min="0" step="100" value={filters.priceMin} onChange={set('priceMin')} placeholder="0" />
        </label>
        <label>
          Prix max (TND)
          <input type="number" inputMode="decimal" min="0" step="100" value={filters.priceMax} onChange={set('priceMax')} placeholder="Sans limite" />
        </label>
        <label>
          Note minimale
          <select value={filters.ratingMin} onChange={set('ratingMin')}>
            {RATING_OPTIONS.map((value) => (
              <option key={value} value={String(value)}>
                {value === 0 ? 'Toutes les notes' : `${value.toLocaleString('fr-FR')} ★ et plus`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trier par
          <select value={filters.sort} onChange={set('sort')}>
            <option value="name">Nom (A → Z)</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="rating_desc">Meilleure note</option>
          </select>
        </label>
        <button type="button" className="text-button provider-clear" onClick={onClear} disabled={activeCount === 0 && filters.sort === 'name'}>
          Effacer les filtres
        </button>
        {priceError && <p className="auth-message error provider-price-error" role="alert">{priceError}</p>}
      </div>
    </section>
  )
}
