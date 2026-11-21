import { useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, listWeddingTasks, setWeddingPlan, updateTask } from '../../services/tasksService'
import { listSentContactRequests } from '../../services/contactRequestsService'

const sentWeddingDateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
import { TaskModal } from './TaskModal'

const statusLabels = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminée',
}

const tndFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'TND',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isUrgent(task) {
  const today = toIsoDate(new Date())
  return task.status !== 'done' && task.task_date < today
}

export function PlanningPage({ wedding, onNavigateToRequests }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [sentRequests, setSentRequests] = useState([])

  const reload = async () => {
    setLoading(true)
    setError('')
    const { data, error: readError } = await listWeddingTasks(wedding.id)
    if (readError) setError(readError.message)
    setTasks(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    listWeddingTasks(wedding.id).then(({ data, error: readError }) => {
      if (!active) return
      if (readError) setError(readError.message)
      setTasks(data ?? [])
      setLoading(false)
    })
    return () => { active = false }
  }, [wedding.id])

  // Phase 6.5: secondary info — fails silently so Planning never breaks because of it.
  useEffect(() => {
    let active = true
    listSentContactRequests()
      .then((rows) => { if (active) setSentRequests(rows) })
      .catch((caught) => console.warn('Demandes transmises non chargées :', caught?.message || caught))
    return () => { active = false }
  }, [wedding.id])

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const first = new Date(year, month, 1)
    const mondayOffset = (first.getDay() + 6) % 7
    const firstVisible = new Date(year, month, 1 - mondayOffset)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstVisible)
      date.setDate(firstVisible.getDate() + index)
      return date
    })
  }, [currentMonth])

  const selectedTasks = tasks.filter((task) => task.task_date === selectedDate)
  const generatedCount = tasks.filter((task) => task.is_generated).length

  const openCreate = () => {
    setEditingTask({ task_date: selectedDate })
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const saveTask = async (values) => {
    if (editingTask?.id) {
      const { error: updateError } = await updateTask(editingTask.id, wedding.id, values)
      if (updateError) throw updateError
      setSuccess('La tâche a été modifiée.')
    } else {
      const { error: createError } = await createTask({
        ...values,
        wedding_id: wedding.id,
        template_key: null,
      })
      if (createError) throw createError
      setSuccess('La tâche a été ajoutée.')
    }
    await reload()
  }

  const removeTask = async (task) => {
    if (!window.confirm('Supprimer cette tâche ? Cette action est définitive.')) return
    const { error: deleteError } = await deleteTask(task.id, wedding.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setSuccess('La tâche a été supprimée.')
    await reload()
  }

  const changeStatus = async (task, status) => {
    const { error: updateError } = await updateTask(task.id, wedding.id, { status })
    if (updateError) {
      setError(updateError.message)
      return
    }
    setSuccess('Le statut a été enregistré.')
    await reload()
  }

  const regenerate = async () => {
    const today = new Date()
    const todayIso = toIsoDate(today)
    const weddingDate = new Date(`${wedding.wedding_date}T12:00:00`)
    const daysUntilWedding = Math.ceil((weddingDate - today) / 86400000)
    const prepStart = wedding.preparation_start_date
      ? new Date(`${wedding.preparation_start_date}T12:00:00`)
      : null
    const prepWindow = prepStart
      ? Math.ceil((weddingDate - prepStart) / 86400000)
      : null

    if (wedding.wedding_date >= todayIso && daysUntilWedding < 30 && prepWindow !== null && prepWindow < 90) {
      if (!window.confirm('Votre mariage approche (moins de 30 jours). Les tâches passées seront replanifiées à partir d\'aujourd\'hui, et vos préparatifs commencent dans moins de 90 jours — plusieurs tâches seront regroupées. Continuer ?')) return
    } else if (wedding.wedding_date >= todayIso && daysUntilWedding < 30) {
      if (!window.confirm('Votre mariage approche (moins de 30 jours). Les tâches passées seront replanifiées à partir d’aujourd’hui. Continuer ?')) return
    } else if (prepWindow !== null && prepWindow < 90) {
      if (!window.confirm('Vos préparatifs commencent moins de 90 jours avant le mariage. Plusieurs tâches risquent d’être regroupées à partir de cette date. Continuer ?')) return
    }

    const hasGenerated = tasks.some((task) => task.is_generated)
    if (hasGenerated) {
      const edited = tasks.some((task) =>
        task.is_generated && task.updated_at && task.created_at && task.updated_at > task.created_at
      )
      const modifiedWarning = edited
        ? '\nCertaines tâches générées ont été modifiées. Ces modifications seront perdues.'
        : ''
      if (!window.confirm(`Cette action remplacera toutes les tâches générées. Les tâches personnelles seront conservées.${modifiedWarning}`)) return
    }

    setLoading(true)
    setError('')
    const { error: rpcError } = await setWeddingPlan(wedding.id)
    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
      return
    }
    setSuccess('Le planning a été généré.')
    await reload()
  }

  const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <main>
      <div className="page-title">
        <div><p className="eyebrow">Votre organisation</p><h1>Mon planning</h1></div>
        <div className="planning-actions">
          {generatedCount > 0 && <button className="secondary-button" onClick={regenerate}>Régénérer</button>}
          <button className="primary-button compact-button" onClick={openCreate}>+ Ajouter</button>
        </div>
      </div>
      {success && <p className="success-banner" onAnimationEnd={() => setSuccess('')}>{success}</p>}
      {error && <div className="error-banner"><span>{error}</span><button onClick={reload}>Réessayer</button></div>}
      {sentRequests.length > 0 && (
        <section className="sent-requests-section" aria-labelledby="sent-requests-title">
          <div className="sent-requests-heading">
            <h2 id="sent-requests-title">Demandes de contact transmises</h2>
            <p>{sentRequests.length === 1 ? '1 demande transmise au prestataire' : `${sentRequests.length} demandes transmises au prestataire`}</p>
          </div>
          <ul className="sent-requests-list">
            {sentRequests.map((request) => (
              <li key={request.id} className="content-card sent-request-card" data-request-id={request.id}>
                <div className="sent-request-head">
                  <strong className="sent-request-provider">{request.provider?.name || 'Prestataire indisponible'}</strong>
                  <span className="request-status request-status-sent sent-request-badge">Transmise</span>
                </div>
                <p className="sent-request-date"><span>Date du mariage :</span> {request.wedding_date ? sentWeddingDateFormatter.format(new Date(`${request.wedding_date}T12:00:00`)) : 'non précisée'}</p>
                <button type="button" className="text-button sent-request-link" onClick={onNavigateToRequests}>Voir dans Mes demandes</button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {loading ? (
        <div className="loading-state">Chargement du planning...</div>
      ) : tasks.length === 0 ? (
        <section className="empty-state planner-empty">
            <span className="empty-icon">♡</span>
          <h3>Aucune tâche prévue</h3>
          <p>Générez automatiquement les étapes préparées pour votre mariage.</p>
          <button className="primary-button" onClick={regenerate}>Générer le planning</button>
        </section>
      ) : (
        <div className="planning-layout">
          <section className="content-card calendar-card">
            <div className="month-header">
              <button onClick={() => setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
              <h2>{monthLabel}</h2>
              <button onClick={() => setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
            </div>
            <div className="weekdays">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="calendar-grid">
              {monthDays.map((date) => {
                const iso = toIsoDate(date)
                const dayTasks = tasks.filter((task) => task.task_date === iso)
                const urgent = dayTasks.some(isUrgent)
                return (
                  <button
                    key={iso}
                    className={`${iso === selectedDate ? 'selected' : ''} ${date.getMonth() !== currentMonth.getMonth() ? 'outside-month' : ''}`}
                    onClick={() => setSelectedDate(iso)}
                  >
                    {date.getDate()}
                    {dayTasks.length > 0 && <i className={urgent ? 'urgent-dot' : ''} />}
                  </button>
                )
              })}
            </div>
          </section>
          <section className="content-card day-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <h2>Vos tâches</h2>
              </div>
              <span className="day-count">{selectedTasks.length}</span>
            </div>
            {selectedTasks.length === 0 ? (
              <div className="empty-day"><span>♡</span><p>Aucune tâche pour cette date</p><button className="text-button" onClick={openCreate}>Ajouter une tâche</button></div>
            ) : (
              <div className="task-list">
                {selectedTasks.map((task) => (
                  <article className={`planner-task ${task.status === 'done' ? 'completed' : ''} ${isUrgent(task) ? 'urgent-task' : ''}`} key={task.id}>
                    <button className="check-button" onClick={() => changeStatus(task, task.status === 'done' ? 'todo' : 'done')}>{task.status === 'done' ? '✓' : ''}</button>
                    <div className="planner-task-body">
                      <strong>{task.title}</strong>
                      {task.task_time && <small>{task.task_time}</small>}
                      {task.description && <p>{task.description}</p>}
                      {task.estimated_cost != null && <small>{tndFormatter.format(task.estimated_cost)}</small>}
                      {isUrgent(task) && <b className="urgent-label">Urgente</b>}
                    </div>
                    <select className="status-select" value={task.status} onChange={(event) => changeStatus(task, event.target.value)} aria-label={`Statut de ${task.title}`}>
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <button className="task-edit" onClick={() => openEdit(task)}>Modifier</button>
                    <button className="task-delete" onClick={() => removeTask(task)}>Supprimer</button>
                  </article>
                ))}
              </div>
            )}
            <p className="cost-note">Les coûts estimés sont indicatifs.</p>
          </section>
        </div>
      )}
      {modalOpen && <TaskModal key={editingTask?.id || `new-${editingTask?.task_date || 'task'}`} task={editingTask} onClose={() => setModalOpen(false)} onSave={saveTask} />}
    </main>
  )
}
