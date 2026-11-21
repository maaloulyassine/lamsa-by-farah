import { useEffect, useRef, useState } from 'react'
import { MAX_TND_AMOUNT, mutationErrorMessage, parseTndAmount } from '../../utils/format'

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ExpenseModal({ expense, categories = [], onClose, onSave }) {
  const [form, setForm] = useState(() => (expense ? {
    title: expense.title || '',
    category_id: expense.category_id || categories[0]?.id || '',
    amount: expense.amount != null ? String(expense.amount) : '',
    expense_date: expense.expense_date || toIsoDate(new Date()),
    notes: expense.notes || '',
  } : {
    title: '',
    category_id: categories[0]?.id || '',
    amount: '',
    expense_date: toIsoDate(new Date()),
    notes: '',
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    const previous = document.activeElement
    titleRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const items = [...dialog.querySelectorAll('button, input, select, textarea')].filter((node) => !node.disabled)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previous && typeof previous.focus === 'function') previous.focus()
    }
  }, [])

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.title.trim()) {
      setError('Veuillez saisir un titre pour la dépense.')
      return
    }
    if (!form.category_id) {
      setError('Veuillez sélectionner une catégorie.')
      return
    }
    const amount = parseTndAmount(form.amount)
    if (amount.error) {
      setError(amount.error)
      return
    }
    if (!form.expense_date) {
      setError('Veuillez indiquer une date pour la dépense.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        title: form.title.trim(),
        category_id: form.category_id,
        amount: amount.value,
        expense_date: form.expense_date,
        notes: form.notes.trim() || null,
      })
      onClose()
    } catch (caught) {
      setError(mutationErrorMessage(caught, 'La dépense n’a pas pu être enregistrée.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section ref={dialogRef} className="task-modal" role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Gestion du budget</p>
            <h2 id="expense-modal-title">{expense?.id ? 'Modifier la dépense' : 'Ajouter une dépense'}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <form className="task-form" onSubmit={submit} noValidate>
          <label>
            Titre de la dépense
            <input ref={titleRef} value={form.title} onChange={update('title')} required />
          </label>
          <div className="task-form-grid">
            <label>
              Catégorie
              <select value={form.category_id} onChange={update('category_id')} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Montant (TND)
              <input type="number" inputMode="decimal" min="0.01" max={MAX_TND_AMOUNT} step="0.01" value={form.amount} onChange={update('amount')} required />
            </label>
          </div>
          <label>
            Date de la dépense
            <input type="date" value={form.expense_date} onChange={update('expense_date')} required />
          </label>
          <label>
            Notes facultatives
            <textarea value={form.notes} onChange={update('notes')} rows="3" />
          </label>
          {error && <p className="auth-message error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Annuler</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
