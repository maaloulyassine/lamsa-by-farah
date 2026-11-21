import { useEffect, useRef, useState } from 'react'
import { MAX_TND_AMOUNT, mutationErrorMessage, parseTndAmount } from '../../utils/format'

export function BudgetEditModal({ currentBudget = 0, onClose, onSave }) {
  const [budget, setBudget] = useState(() => (currentBudget ? String(currentBudget) : ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    const previous = document.activeElement
    inputRef.current?.focus()
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

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const parsed = parseTndAmount(budget, { allowZero: true })
    if (parsed.error) {
      setError(parsed.error)
      return
    }
    setSaving(true)
    try {
      await onSave(parsed.value)
      onClose()
    } catch (caught) {
      setError(mutationErrorMessage(caught, 'Le budget total n’a pas pu être mis à jour.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section ref={dialogRef} className="task-modal" role="dialog" aria-modal="true" aria-labelledby="budget-edit-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Objectif financier</p>
            <h2 id="budget-edit-title">{currentBudget > 0 ? 'Modifier le budget total' : 'Définir le budget'}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <form className="task-form" onSubmit={submit} noValidate>
          <label>
            Budget total prévu (TND)
            <input ref={inputRef} type="number" inputMode="decimal" min="0" max={MAX_TND_AMOUNT} step="0.01" value={budget} onChange={(event) => setBudget(event.target.value)} required />
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
