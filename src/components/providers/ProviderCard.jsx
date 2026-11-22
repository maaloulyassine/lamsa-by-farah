import { useEffect, useRef, useState } from 'react'
import { Burst } from '../ui/Burst'
import { getCategoryImage } from '../../utils/categoryImages'
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

// Cover: the provider's own cover_image_url when set; otherwise the category illustration
// (free stock, always labelled "Photo d'illustration" — it is not a photo of the provider);
// otherwise (missing/failed image) the gradient placeholder with the category icon.
export function ProviderCover({ provider, iconSize = 40, className = '' }) {
  const illustration = getCategoryImage(provider.category?.slug)
  const [status, setStatus] = useState('loading') // loading | loaded | failed
  if (provider.cover_image_url) {
    return <div className={`provider-cover ${className}`}><img src={provider.cover_image_url} alt="" loading="lazy" /></div>
  }
  if (illustration && status !== 'failed') {
    // Gradient + icon stay visible until the illustration has really loaded; the
    // "Photo d'illustration" badge only appears on a loaded image.
    return (
      <div className={`provider-cover provider-cover-illustration provider-cover-placeholder ${status === 'loaded' ? 'is-loaded' : ''} ${className}`}>
        {status !== 'loaded' && <CategoryIcon name={provider.category?.icon} size={iconSize} />}
        <img src={illustration} alt="" loading="lazy" onLoad={() => setStatus('loaded')} onError={() => setStatus('failed')} />
        {status === 'loaded' && (
          <>
            <span className="provider-illustration-badge">Photo d'illustration</span>
            <span className="provider-illustration-icon" aria-hidden="true"><CategoryIcon name={provider.category?.icon} size={Math.round(iconSize * 0.8)} /></span>
          </>
        )}
      </div>
    )
  }
  return (
    <div className={`provider-cover provider-cover-placeholder ${className}`} aria-hidden="true">
      <CategoryIcon name={provider.category?.icon} size={iconSize} />
    </div>
  )
}

// Heart toggle: aria-pressed + label reflect the state; disabled while a mutation is in flight.
export function FavoriteButton({ providerName, isFavorite, pending, onToggle }) {
  // Pop + particles only when the user adds a favorite (never on load or removal).
  const [popping, setPopping] = useState(false)
  const popTimer = useRef(null)
  useEffect(() => () => clearTimeout(popTimer.current), [])
  const handleClick = (event) => {
    if (!isFavorite) {
      setPopping(true)
      clearTimeout(popTimer.current)
      popTimer.current = setTimeout(() => setPopping(false), 700)
    }
    onToggle?.(event)
  }
  return (
    <button
      type="button"
      className={`favorite-button ${isFavorite ? 'active' : ''} ${popping ? 'is-popping' : ''}`.trim()}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={`${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} : ${providerName}`}
      disabled={pending}
      onClick={handleClick}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 8.6c0 5.4-8.8 10.1-8.8 10.1S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />
      </svg>
      {popping && <Burst variant="hearts" />}
    </button>
  )
}

export function ProviderCard({ provider, onOpen, isFavorite = false, favoritePending = false, onToggleFavorite }) {
  const location = [provider.city, provider.governorate?.name].filter(Boolean).join(', ')
  return (
    <article className="provider-card" data-provider-id={provider.id}>
      <div className="provider-cover-wrap">
        <ProviderCover provider={provider} />
        {onToggleFavorite && (
          <FavoriteButton providerName={provider.name} isFavorite={isFavorite} pending={favoritePending} onToggle={() => onToggleFavorite(provider.id)} />
        )}
      </div>
      <div className="provider-body">
        <h3 className="provider-name">{provider.name}</h3>
        <p className="provider-meta">{provider.category?.name}</p>
        <p className="provider-meta">{location}</p>
        {Number(provider.rating) > 0 && (
          <p className="provider-rating"><b>★ {formatRating(provider.rating)}</b></p>
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
