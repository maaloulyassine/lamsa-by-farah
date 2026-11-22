import { useCallback, useEffect, useState } from 'react'
import { getProviderBySlug } from '../../services/providersService'
import { formatRating, formatTndRange } from '../../utils/format'
import { ContactRequestModal } from './ContactRequestModal'
import { FavoriteButton, ProviderCover } from './ProviderCard'

function galleryUrls(gallery) {
  if (!Array.isArray(gallery)) return []
  return gallery.map((item) => (typeof item === 'string' ? item : item?.url)).filter((url) => typeof url === 'string' && url.startsWith('https://'))
}

// Google Maps search (no API key): name + city + governorate name (governorate is a joined object).
function mapsSearchUrl(provider) {
  const governorate = provider.governorate?.name
  const parts = [provider.name, provider.city, governorate && governorate !== provider.city ? governorate : null]
  const query = parts.filter(Boolean).join(' ')
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`
}

function externalUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function ProviderDetail({ providerSlug, wedding, userId, onBack, onSent, backLabel = 'Retour au catalogue', favoriteFor = null, preview = null }) {
  const [provider, setProvider] = useState(null)
  const [status, setStatus] = useState('loading') // loading | error | notfound | ready
  const [contactOpen, setContactOpen] = useState(false)

  const apply = useCallback(({ data, error }) => {
    if (error) setStatus('error')
    else if (!data) setStatus('notfound')
    else {
      setProvider(data)
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    let active = true
    getProviderBySlug(providerSlug).then((result) => { if (active) apply(result) })
    return () => { active = false }
  }, [providerSlug, apply])

  const retry = async () => {
    setStatus('loading')
    apply(await getProviderBySlug(providerSlug))
  }

  const backButton = <button type="button" className="secondary-button provider-back" onClick={onBack}>← {backLabel}</button>

  if (status === 'loading') {
    // With the card's data (preview) the cover is shown at once while the full profile loads.
    return (
      <section className="provider-detail">
        {backButton}
        {preview && (
          <div className="provider-cover-wrap provider-detail-cover-wrap" style={{ viewTransitionName: 'provider-cover' }}>
            <ProviderCover provider={preview} iconSize={64} className="provider-detail-cover" />
          </div>
        )}
        <div className="provider-detail-skeleton" aria-busy="true" aria-label="Chargement du prestataire"><span /><span /><span /></div>
      </section>
    )
  }
  if (status === 'error') {
    return (
      <section className="provider-detail">
        <div className="error-banner" role="alert"><span>Ce prestataire n’a pas pu être chargé.</span><button type="button" onClick={retry}>Réessayer</button></div>
        <button type="button" className="secondary-button provider-back" onClick={onBack}>{backLabel}</button>
      </section>
    )
  }
  if (status === 'notfound') {
    return (
      <section className="provider-detail">
        <div className="empty-state"><h3>Ce prestataire n’est plus disponible.</h3></div>
        {backButton}
      </section>
    )
  }

  const gallery = galleryUrls(provider.gallery)
  const meta = [provider.category?.name, provider.governorate?.name, provider.city].filter(Boolean).join(' · ')
  const hasRating = Number(provider.rating) > 0

  return (
    <section className="provider-detail" aria-labelledby="provider-detail-title">
      {backButton}
      <div className="provider-cover-wrap provider-detail-cover-wrap" style={{ viewTransitionName: 'provider-cover' }}>
        <ProviderCover provider={provider} iconSize={64} className="provider-detail-cover" />
        {favoriteFor && (() => {
          const fav = favoriteFor(provider.id)
          return <FavoriteButton providerName={provider.name} isFavorite={fav.isFavorite} pending={fav.favoritePending} onToggle={() => fav.onToggleFavorite(provider.id)} />
        })()}
      </div>
      {gallery.length > 0 && (
        <div className="provider-gallery" aria-label="Galerie">
          {gallery.map((url) => <img key={url} src={url} alt="" loading="lazy" />)}
        </div>
      )}

      <div className="provider-detail-grid">
        <div className="provider-detail-main content-card">
          <h1 id="provider-detail-title">{provider.name}</h1>
          <p className="provider-detail-meta">{meta}</p>
          <p className="provider-detail-rating">
            {hasRating
              ? <><b>{formatRating(provider.rating)} ★</b>{Number(provider.review_count) > 0 && <> ({provider.review_count} avis)</>}</>
              : 'Pas encore d’avis'}
          </p>
          {hasRating && Number(provider.review_count) === 0 && (
            <p className="provider-rating-note" role="note">Note indicative — aucun avis réel pour le moment.</p>
          )}
          {provider.description && <p className="provider-detail-description">{provider.description}</p>}
          {provider.address && <p className="provider-detail-address"><span>Adresse :</span> {provider.address}</p>}

          <div className="provider-availability">
            <h2>Disponibilité déclarée</h2>
            <p data-testid="availability-notes">{provider.availability_notes?.trim() || 'Disponibilité non renseignée. Contactez le prestataire directement.'}</p>
            <p className="provider-availability-disclaimer" role="note">
              Disponibilité déclarée par le prestataire — non garantie. Cette information ne constitue pas une confirmation de réservation.
            </p>
          </div>

          <div className="provider-contact-links">
            <h2>Coordonnées</h2>
            {provider.phone
              ? <a href={`tel:${provider.phone.replace(/\s+/g, '')}`}>{provider.phone}</a>
              : <p className="provider-phone-missing">Téléphone non renseigné</p>}
            {provider.website && <a href={externalUrl(provider.website)} target="_blank" rel="noopener noreferrer">Site web</a>}
            {provider.social_url && <a href={externalUrl(provider.social_url)} target="_blank" rel="noopener noreferrer">Réseaux sociaux</a>}
            <a href={mapsSearchUrl(provider)} target="_blank" rel="noopener noreferrer" className="provider-maps-link">
              📍 Voir sur Google Maps
            </a>
          </div>
        </div>

        <aside className="provider-price-card content-card">
          <span>Tarif indicatif</span>
          <strong data-testid="provider-detail-price">{formatTndRange(provider.price_from, provider.price_to)}</strong>
          <p>Prix indicatif, à confirmer directement avec le prestataire.</p>
          <button type="button" className="primary-button provider-contact-button" onClick={() => setContactOpen(true)}>
            Contacter / Demander des informations
          </button>
        </aside>
      </div>

      {contactOpen && (
        <ContactRequestModal
          provider={provider}
          wedding={wedding}
          userId={userId}
          onClose={() => setContactOpen(false)}
          onSent={onSent}
        />
      )}
    </section>
  )
}
