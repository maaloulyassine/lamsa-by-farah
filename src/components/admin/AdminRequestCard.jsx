const STATUS = {
  pending: { label: 'En attente', className: 'request-status-pending' },
  sent: { label: 'Transmise', className: 'request-status-sent' },
  closed: { label: 'Fermée', className: 'request-status-closed' },
}

const weddingDateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const sentAtFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Tunis' })

export function AdminRequestCard({ request, pending, onMarkSent, onClose }) {
  const status = STATUS[request.status] || STATUS.pending
  const clientName = request.client?.full_name?.trim() || 'Client inconnu'
  const phone = request.client?.phone?.trim()
  return (
    <li className="content-card request-card admin-request-card" data-request-id={request.id} data-status={request.status}>
      <div className="request-card-head">
        <h2 className="request-provider">{request.provider?.name || 'Prestataire indisponible'}</h2>
        <span className={`request-status ${status.className}`}>{status.label}</span>
      </div>
      <p className="request-client">
        <span>Client :</span> {clientName}
        {phone && <> · <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a></>}
      </p>
      <p className="request-date"><span>Date du mariage :</span> {request.wedding_date ? weddingDateFormatter.format(new Date(`${request.wedding_date}T12:00:00`)) : 'Date non précisée'}</p>
      <p className="request-sent-at">Envoyée le {sentAtFormatter.format(new Date(request.created_at))}</p>
      {request.message && <p className="request-message">{request.message}</p>}
      {request.status !== 'closed' && (
        <div className="admin-request-actions">
          {request.status === 'pending' && (
            <button type="button" className="primary-button" disabled={pending} onClick={() => onMarkSent(request)}>Marquer transmise</button>
          )}
          <button type="button" className="secondary-button" disabled={pending} onClick={() => onClose(request)}>Fermer</button>
        </div>
      )}
    </li>
  )
}
