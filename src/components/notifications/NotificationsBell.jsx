import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { listWeddingTasks } from '../../services/tasksService'
import { listWeddingExpenses } from '../../services/expensesService'
import { listMyRequestUpdates } from '../../services/contactRequestsService'
import { formatTnd } from '../../utils/format'

// Notifications computed from existing data (no new table):
// overdue tasks, tasks of the next 7 days, contact requests whose status changed since the panel
// was last opened (stored per user on this device), and budget overspend.
const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const STATUS_LABEL = { sent: 'transmise au prestataire', closed: 'fermée' }

function isoDay(date) {
  const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function readSeen(key) {
  try { return localStorage.getItem(key) || '' } catch { return '' }
}
function writeSeen(key, value) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable: changes stay "new" for this visit */ }
}

function BellIcon() {
  return (
    <svg className="icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
  )
}

export function NotificationsBell({ wedding, userId, refreshKey, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState({ overdue: [], upcoming: [], requests: [], overspend: null, status: 'loading' })
  const [newSince, setNewSince] = useState('') // threshold used while the panel is open
  const seenKey = `lamsa-notifications-seen-${userId}`
  const [seenAt, setSeenAt] = useState(() => readSeen(seenKey))
  const panelId = useId()
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const weddingId = wedding?.id
  const totalBudget = Number(wedding?.total_budget || 0)

  const fetchData = useCallback(
    () => Promise.all([listWeddingTasks(weddingId), listWeddingExpenses(weddingId), listMyRequestUpdates()]),
    [weddingId],
  )
  const apply = useCallback(([tasksRes, expensesRes, requestsRes]) => {
    const today = new Date(); const todayIso = isoDay(today)
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7); const in7Iso = isoDay(in7)
    const openTasks = (tasksRes.data || []).filter((t) => t.status !== 'done')
    const overdue = openTasks.filter((t) => t.task_date < todayIso).sort((a, b) => a.task_date.localeCompare(b.task_date))
    const upcoming = openTasks.filter((t) => t.task_date >= todayIso && t.task_date <= in7Iso).sort((a, b) => a.task_date.localeCompare(b.task_date))
    const spent = (expensesRes.data || []).reduce((sum, e) => sum + Number(e.amount || 0), 0)
    setData({
      overdue, upcoming,
      requests: requestsRes.data || [],
      overspend: spent > totalBudget ? spent - totalBudget : null,
      status: tasksRes.error || expensesRes.error || requestsRes.error ? 'error' : 'ready',
    })
  }, [totalBudget])

  // Refresh on mount and whenever the user changes screen (refreshKey); also when the panel opens.
  useEffect(() => {
    if (!weddingId) return undefined
    let active = true
    fetchData().then((results) => { if (active) apply(results) })
    return () => { active = false }
  }, [fetchData, apply, refreshKey, weddingId])
  // Also refresh when the user comes back to the tab / app, and every minute while it is visible.
  useEffect(() => {
    if (!weddingId) return undefined
    const refresh = () => { if (document.visibilityState === 'visible') fetchData().then(apply) }
    const id = setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => { clearInterval(id); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [fetchData, apply, weddingId])
  const load = () => { if (weddingId) fetchData().then(apply) }

  const newRequests = data.requests.filter((r) => !seenAt || r.updated_at > seenAt)
  const badge = data.overdue.length + newRequests.length + (data.overspend ? 1 : 0)

  const openPanel = () => {
    setNewSince(seenAt)
    setOpen(true)
    load()
    const now = new Date().toISOString()
    writeSeen(seenKey, now)
    setSeenAt(now)
  }
  const close = useCallback((returnFocus = true) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }, [])

  // Escape closes; a click outside closes; focus moves into the panel when it opens.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape') { event.preventDefault(); close() } }
    const onPointer = (event) => {
      if (!panelRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) close(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    panelRef.current?.querySelector('button, [href]')?.focus()
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer) }
  }, [open, close])

  const go = (page) => { close(false); onNavigate(page) }
  const isNew = (r) => !newSince || r.updated_at > newSince
  const empty = data.status === 'ready' && !data.overdue.length && !data.upcoming.length && !data.requests.length && !data.overspend

  return (
    <div className="notifications">
      <button
        ref={buttonRef}
        type="button"
        className="icon-button notification"
        aria-label={badge ? `Notifications : ${badge} à voir` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? close() : openPanel())}
      >
        <BellIcon />
        {badge > 0 && <span className="notif-badge" aria-hidden="true">{badge > 9 ? '9+' : badge}</span>}
      </button>
      {open && (
        <div ref={panelRef} id={panelId} className="notif-panel" role="dialog" aria-label="Notifications">
          <div className="notif-head"><strong>Notifications</strong><button type="button" className="notif-close" onClick={() => close()} aria-label="Fermer les notifications">×</button></div>
          {data.status === 'loading' && <p className="notif-empty">Chargement…</p>}
          {data.status === 'error' && <p className="notif-empty">Les notifications n’ont pas pu être chargées. Réessayez plus tard.</p>}
          {empty && <p className="notif-empty">Tout est à jour. Profitez de votre préparation ✨</p>}
          {data.overspend && (
            <section className="notif-group">
              <h3>Budget</h3>
              <button type="button" className="notif-item is-alert" onClick={() => go('budget')}>
                <span>Budget dépassé de {formatTnd(data.overspend)}</span><small>Voir mon budget</small>
              </button>
            </section>
          )}
          {data.overdue.length > 0 && (
            <section className="notif-group">
              <h3>En retard ({data.overdue.length})</h3>
              {data.overdue.slice(0, 4).map((t) => (
                <button type="button" key={t.id} className="notif-item is-alert" onClick={() => go('planning')}>
                  <span>{t.title}</span><small>Prévue le {shortDate.format(new Date(`${t.task_date}T12:00:00`))}</small>
                </button>
              ))}
              {data.overdue.length > 4 && <button type="button" className="notif-more" onClick={() => go('planning')}>Voir les {data.overdue.length} tâches en retard</button>}
            </section>
          )}
          {data.upcoming.length > 0 && (
            <section className="notif-group">
              <h3>Cette semaine</h3>
              {data.upcoming.slice(0, 4).map((t) => (
                <button type="button" key={t.id} className="notif-item" onClick={() => go('planning')}>
                  <span>{t.title}</span><small>{shortDate.format(new Date(`${t.task_date}T12:00:00`))}</small>
                </button>
              ))}
            </section>
          )}
          {data.requests.length > 0 && (
            <section className="notif-group">
              <h3>Demandes de contact</h3>
              {data.requests.slice(0, 4).map((r) => (
                <button type="button" key={r.id} className={`notif-item ${isNew(r) ? 'is-new' : ''}`} onClick={() => go('requests')}>
                  <span>{r.provider?.name || 'Prestataire indisponible'} : demande {STATUS_LABEL[r.status]}</span>
                  <small>{isNew(r) ? 'Nouveau · ' : ''}{shortDate.format(new Date(r.updated_at))}</small>
                </button>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
