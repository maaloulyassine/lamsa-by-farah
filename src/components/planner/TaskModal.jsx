import { useState } from 'react'

const emptyTask = {
  title: '',
  description: '',
  task_date: '',
  task_time: '',
  notes: '',
  estimated_cost: '',
  status: 'todo',
}

export function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task ? {
    title: task.title || '',
    description: task.description || '',
    task_date: task.task_date || '',
    task_time: task.task_time || '',
    notes: task.notes || '',
    estimated_cost: task.estimated_cost ?? '',
    status: task.status || 'todo',
  } : emptyTask)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({
        ...form,
        task_time: form.task_time || null,
        estimated_cost: form.estimated_cost === '' ? null : Number(form.estimated_cost),
      })
      onClose()
    } catch (caught) {
      setError(caught.message || 'La tâche n’a pas pu être enregistrée.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Votre planning</p>
            <h2 id="task-modal-title">{task ? 'Modifier la tâche' : 'Ajouter une tâche'}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <form className="task-form" onSubmit={submit}>
          <label>Titre<input value={form.title} onChange={update('title')} required /></label>
          <label>Description<textarea value={form.description} onChange={update('description')} rows="3" /></label>
          <div className="task-form-grid">
            <label>Date<input type="date" value={form.task_date} onChange={update('task_date')} required /></label>
            <label>Heure<input type="time" value={form.task_time} onChange={update('task_time')} /></label>
          </div>
          <label>Statut
            <select value={form.status} onChange={update('status')}>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="done">Terminée</option>
            </select>
          </label>
          <label>Coût estimé (TND)<input type="number" min="0" step="0.01" value={form.estimated_cost} onChange={update('estimated_cost')} /></label>
          <label>Notes<textarea value={form.notes} onChange={update('notes')} rows="3" /></label>
          {error && <p className="auth-message error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Annuler</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
        <p className="cost-note">Les coûts estimés sont indicatifs.</p>
      </section>
    </div>
  )
}
