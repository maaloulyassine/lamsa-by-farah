import { useCallback, useEffect, useState } from 'react'
import { getProviderById } from '../../services/providersService'
import { formatRating, formatTndRange } from '../../utils/format'
import { ContactRequestModal } from './ContactRequestModal'
import { DemoBadge, ProviderCover } from './ProviderCard'

function galleryUrls(gallery) {
  if (!Array.isArray(gallery)) return []
  return gallery.map((item) => (typeof item === 'string' ? item : item?.url)).filter((url) => typeof url === 'string' && url.startsWith('https://'))
}

function externalUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function ProviderDetail({ providerId, wedding, userId, onBack, onSent }) {
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
    getProviderById(providerId).then((result) => { if (active) apply(result) })
    return () => { active = false }
  }, [providerId, apply])

  const retry = async () => {
    setStatus('loading')
    apply(await getProviderById(providerId))
  }

  const backButton = <button type="button" className="secondary-button provider-back" onClick={onBack}>← Retour au catalogue</button>

  if (status === 'loading') {
    return <section className="provider-detail">{backButton}<div className="provider-detail-skeleton" aria-busy="true" aria-label="Chargement du prestataire"><span /><span /><span /></div></section>
  }
  if (status === 'error') {
    return (
      <section className="provider-detail">
        <div className="error-banner" role="alert"><span>Ce prestataire n’a pas pu être chargé.</span><button type="button" onClick={retry}>Réessayer</button></div>
        <button type="button" className="secondary-button provider-back" onClick={onBack}>Retour au catalogue</button>
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
      <ProviderCover provider={provider} iconSize={64} className="provider-detail-cover" />
      {gallery.length > 0 && (
        <div className="provider-gallery" aria-label="Galerie">
          {gallery.map((url) => <img key={url} src={url} alt="" loading="lazy" />)}
        </div>
      )}

      <div className="provider-detail-grid">
        <div className="provider-detail-main content-card">
          {provider.is_demo && <DemoBadge />}
          <h1 id="provider-detail-title">{provider.name}</h1>
          <p className="provider-detail-meta">{meta}</p>
          <p className="provider-detail-rating">
            {hasRating
              ? <><b>{formatRating(provider.rating)} ★</b> ({provider.review_count} avis)</>
              : 'Pas encore d’avis'}
          </p>
          {provider.description && <p className="provider-detail-description">{provider.description}</p>}
          {provider.address && <p className="provider-detail-address"><span>Adresse :</span> {provider.address}</p>}

          <div className="provider-availability">
            <h2>Disponibilité déclarée</h2>
            <p data-testid="availability-notes">{provider.availability_notes?.trim() || 'Non renseignée'}</p>
            <p className="provider-availability-disclaimer" role="note">
              Disponibilité déclarée par le prestataire — non garantie. Cette information ne constitue pas une confirmation de réservation.
            </p>
          </div>

          {(provider.phone || provider.website || provider.social_url) && (
            <div className="provider-contact-links">
              <h2>Coordonnées</h2>
              {provider.phone && <a href={`tel:${provider.phone.replace(/\s+/g, '')}`}>{provider.phone}</a>}
              {provider.website && <a href={externalUrl(provider.website)} target="_blank" rel="noopener noreferrer">Site web</a>}
              {provider.social_url && <a href={externalUrl(provider.social_url)} target="_blank" rel="noopener noreferrer">Réseaux sociaux</a>}
            </div>
          )}
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
