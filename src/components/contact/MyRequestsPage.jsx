import { useCallback, useEffect, useState } from 'react'
import { listMyContactRequests } from '../../services/contactRequestsService'

const STATUS = {
  pending: { label: 'En attente', className: 'request-status-pending' },
  sent: { label: 'Transmise au prestataire', className: 'request-status-sent' },
  closed: { label: 'Fermée', className: 'request-status-closed' },
}

const weddingDateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const sentAtFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Tunis' })

function formatWeddingDate(value) {
  if (!value) return 'Date non précisée'
  return weddingDateFormatter.format(new Date(`${value}T12:00:00`))
}

function requestsCountLabel(count) {
  return count === 1 ? '1 demande envoyée' : `${count} demandes envoyées`
}

function SkeletonRequests() {
  return (
    <div className="requests-list" aria-busy="true" aria-label="Chargement des demandes">
      {[0, 1].map((key) => <div key={key} className="content-card request-card request-card-skeleton"><span /><span /><span /></div>)}
    </div>
  )
}

// Read-only history of the user's contact requests (no cancel / edit / resubmit in 4e).
export function MyRequestsPage({ onBack, onDiscover }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const apply = useCallback(({ data, error: loadError }) => {
    if (loadError) setError('Impossible de charger vos demandes.')
    else {
      setError('')
      setRequests(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    listMyContactRequests().then((result) => { if (active) apply(result) })
    return () => { active = false }
  }, [apply])

  const retry = async () => {
    setLoading(true)
    setError('')
    apply(await listMyContactRequests())
  }

  let content
  if (loading) content = <SkeletonRequests />
  else if (error) content = <div className="error-banner" role="alert"><span>{error}</span><button type="button" onClick={retry}>Réessayer</button></div>
  else if (requests.length === 0) {
    content = (
      <div className="empty-state requests-empty">
        <h3>Vous n’avez pas encore envoyé de demande de contact.</h3>
        <p>Parcourez les services et contactez un prestataire pour démarrer.</p>
        <button type="button" className="primary-button" onClick={onDiscover}>Découvrir les services</button>
      </div>
    )
  } else {
    content = (
      <ol className="requests-list">
        {requests.map((request) => {
          const status = STATUS[request.status] || STATUS.pending
          const meta = [request.provider?.category?.name, request.provider?.governorate?.name].filter(Boolean).join(' · ')
          return (
            <li key={request.id} className="content-card request-card" data-request-id={request.id}>
              <div className="request-card-head">
                <h2 className="request-provider">{request.provider?.name || 'Prestataire indisponible'}</h2>
                <span className={`request-status ${status.className}`}>{status.label}</span>
              </div>
              {meta && <p className="request-meta">{meta}</p>}
              <p className="request-date"><span>Date du mariage :</span> {formatWeddingDate(request.wedding_date)}</p>
              {request.message && <p className="request-message">{request.message}</p>}
              <p className="request-sent-at">Envoyée le {sentAtFormatter.format(new Date(request.created_at))}</p>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <section className="requests-page" aria-labelledby="requests-page-title">
      <button type="button" className="secondary-button requests-back" onClick={onBack}>← Retour au profil</button>
      <div className="page-title">
        <div>
          <p className="eyebrow">Votre espace personnel</p>
          <h1 id="requests-page-title">Mes demandes de contact</h1>
        </div>
      </div>
      {!loading && !error && requests.length > 0 && (
        <p className="requests-count" data-testid="requests-count">{requestsCountLabel(requests.length)}</p>
      )}
      <p className="requests-disclaimer" role="note">
        Le statut « Transmise au prestataire » ne constitue pas une réservation confirmée. Le prestataire doit confirmer sa disponibilité directement.
      </p>
      {content}
    </section>
  )
}
