import { formatRating, formatTndRange } from '../../utils/format'

const categoryPaths = {
  building: <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />,
  dress: <path d="M9 3h6l1 5 4 4-3 2-2-2 2 9H7l2-9-2 2-3-2 4-4 1-5Z" />,
  flower: <path d="M12 21c-1.6-4.1-1.5-7.5 0-10.2C13.6 8.1 16.3 7.5 18 9c1.8 1.6.7 4.5-2.1 5.5M12 21C10.4 16.9 10.5 13.5 12 10.8 10.4 8.1 7.7 7.5 6 9c-1.8 1.6-.7 4.5 2.1 5.5" />,
  cloche: <path d="M4 17h16M6 17a6 6 0 0 1 12 0M3 20h18M12 7V5M10 5h4" />,
  cake: <path d="M4 12h16v8H4zM4 16h16M7 12V9h10v3M9 9V6h6v3M12 6V3" />,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
  music: <path d="M9 18V5l10-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3ZM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" />,
  car: <><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5l1.5-3h8l1.5 3H19a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>,
}

export function CategoryIcon({ name, size = 18 }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {categoryPaths[name] || categoryPaths.building}
    </svg>
  )
}

// Cover image when provided; otherwise a gradient placeholder with the category icon
// (no stock venue photos on fictitious providers — spec §8).
export function ProviderCover({ provider, iconSize = 40, className = '' }) {
  if (provider.cover_image_url) {
    return <div className={`provider-cover ${className}`}><img src={provider.cover_image_url} alt="" loading="lazy" /></div>
  }
  return (
    <div className={`provider-cover provider-cover-placeholder ${className}`} aria-hidden="true">
      <CategoryIcon name={provider.category?.icon} size={iconSize} />
    </div>
  )
}

export function DemoBadge() {
  return <span className="provider-demo-badge">Exemple de démonstration</span>
}

export function ProviderCard({ provider, onOpen }) {
  const location = [provider.city, provider.governorate?.name].filter(Boolean).join(', ')
  return (
    <article className="provider-card" data-provider-id={provider.id}>
      <ProviderCover provider={provider} />
      <div className="provider-body">
        <div className="provider-card-badges">{provider.is_demo && <DemoBadge />}</div>
        <h3 className="provider-name">{provider.name}</h3>
        <p className="provider-meta">{provider.category?.name}</p>
        <p className="provider-meta">{location}</p>
        {Number(provider.review_count) > 0 && (
          <p className="provider-rating"><b>{formatRating(provider.rating)} ★</b> <small>({provider.review_count} avis)</small></p>
        )}
        <div className="provider-footer">
          <strong className="provider-price">{formatTndRange(provider.price_from, provider.price_to)}</strong>
          <button type="button" className="secondary-button provider-open" onClick={() => onOpen(provider.id)} aria-label={`Voir les détails de ${provider.name}`}>
            Voir les détails
          </button>
        </div>
      </div>
    </article>
  )
}
