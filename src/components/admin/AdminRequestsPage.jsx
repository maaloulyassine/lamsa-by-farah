import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listAllContactRequests, updateRequestStatus } from '../../services/adminService'
import { AdminRequestCard } from './AdminRequestCard'

const TABS = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'sent', label: 'Transmises' },
  { key: 'closed', label: 'Fermées' },
]
const TOAST_TIMEOUT_MS = 4000
const UPDATE_ERROR = 'Impossible de mettre à jour la demande. Réessayez.'

function pendingLabel(count) {
  if (count === 0) return 'Aucune demande en attente'
  return count === 1 ? '1 demande en attente' : `${count} demandes en attente`
}

function SkeletonRequests() {
  return (
    <div className="requests-list" aria-busy="true" aria-label="Chargement des demandes">
      {[0, 1].map((key) => <div key={key} className="content-card request-card request-card-skeleton"><span /><span /><span /></div>)}
    </div>
  )
}

// Phase 6 (post-MVP bonus): all contact requests across users, status lifecycle only.
export function AdminRequestsPage({ onBack }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [pendingIds, setPendingIds] = useState(() => new Set())
  const [toast, setToast] = useState(null)
  const inFlight = useRef(new Set())

  const apply = useCallback(({ data, error: loadError }) => {
    if (loadError) setError('Impossible de charger les demandes.')
    else {
      setError('')
      setRequests(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    listAllContactRequests().then((result) => { if (active) apply(result) })
    return () => { active = false }
  }, [apply])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), TOAST_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const retry = async () => {
    setLoading(true)
    setError('')
    apply(await listAllContactRequests())
  }

  // Optimistic status change with revert on error; one mutation per request at a time.
  const changeStatus = async (request, nextStatus, successMessage) => {
    if (inFlight.current.has(request.id)) return
    inFlight.current = new Set(inFlight.current).add(request.id)
    setPendingIds(inFlight.current)
    const previous = request.status
    setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status: nextStatus } : item)))
    const { error: updateError } = await updateRequestStatus(request.id, nextStatus)
    if (updateError) {
      setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status: previous } : item)))
      setToast({ kind: 'error', text: UPDATE_ERROR })
    } else {
      setToast({ kind: 'success', text: successMessage })
    }
    const next = new Set(inFlight.current)
    next.delete(request.id)
    inFlight.current = next
    setPendingIds(next)
  }

  const markSent = (request) => changeStatus(request, 'sent', 'Demande marquée comme transmise.')
  const closeRequest = (request) => {
    // Native confirm, same pattern as 4a/4b deletions (see Known issues).
    if (!window.confirm('Fermer cette demande ? Le client ne pourra plus la voir comme en attente.')) return
    changeStatus(request, 'closed', 'Demande fermée.')
  }

  const pendingCount = useMemo(() => requests.filter((request) => request.status === 'pending').length, [requests])
  const visible = useMemo(() => (tab === 'all' ? requests : requests.filter((request) => request.status === tab)), [requests, tab])

  let content
  if (loading) content = <SkeletonRequests />
  else if (error) content = <div className="error-banner" role="alert"><span>{error}</span><button type="button" onClick={retry}>Réessayer</button></div>
  else if (requests.length === 0) content = <div className="empty-state admin-empty"><h3>Aucune demande de contact pour le moment.</h3></div>
  else if (visible.length === 0) content = <div className="empty-state admin-empty"><h3>Aucune demande dans cette catégorie.</h3></div>
  else {
    content = (
      <ol className="requests-list">
        {visible.map((request) => (
          <AdminRequestCard key={request.id} request={request} pending={pendingIds.has(request.id)} onMarkSent={markSent} onClose={closeRequest} />
        ))}
      </ol>
    )
  }

  return (
    <section className="requests-page admin-requests-page" aria-labelledby="admin-requests-title">
      <button type="button" className="secondary-button requests-back" onClick={onBack}>← Retour au profil</button>
      <div className="page-title">
        <div>
          <p className="eyebrow">Administration · bonus post-MVP</p>
          <h1 id="admin-requests-title">Demandes de contact</h1>
        </div>
      </div>
      {!loading && !error && <p className="requests-count" data-testid="admin-pending-count">{pendingLabel(pendingCount)}</p>}
      {toast && (
        <p className={toast.kind === 'error' ? 'error-banner admin-toast' : 'success-banner admin-toast'} role={toast.kind === 'error' ? 'alert' : 'status'}>{toast.text}</p>
      )}
      <div className="admin-tabs" role="group" aria-label="Filtrer par statut">
        {TABS.map((item) => (
          <button key={item.key} type="button" className={`admin-tab ${tab === item.key ? 'active' : ''}`} aria-pressed={tab === item.key} onClick={() => setTab(item.key)}>
            {item.label}
          </button>
        ))}
      </div>
      {content}
    </section>
  )
}
