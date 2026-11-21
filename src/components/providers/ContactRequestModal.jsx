import { useEffect, useRef, useState } from 'react'
import { createContactRequest } from '../../services/contactRequestsService'
import { mutationErrorMessage } from '../../utils/format'

const MESSAGE_MIN = 10
const MESSAGE_MAX = 1000

export function ContactRequestModal({ provider, wedding, userId, onClose, onSent }) {
  const [weddingDate, setWeddingDate] = useState(wedding?.wedding_date || '')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef(null)
  const messageRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Focus trap: initial focus on the message, Escape closes, focus returns to the trigger.
  useEffect(() => {
    const dialog = dialogRef.current
    const previous = document.activeElement
    messageRef.current?.focus()
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
    if (!wedding?.id || !userId) {
      setError('Vous devez d’abord créer votre projet de mariage.')
      return
    }
    if (!weddingDate || Number.isNaN(new Date(`${weddingDate}T12:00:00`).getTime())) {
      setError('Veuillez indiquer une date de mariage valide.')
      return
    }
    const text = message.trim()
    if (text.length < MESSAGE_MIN) {
      setError(`Votre message doit contenir au moins ${MESSAGE_MIN} caractères.`)
      return
    }
    if (text.length > MESSAGE_MAX) {
      setError(`Votre message ne peut pas dépasser ${MESSAGE_MAX} caractères.`)
      return
    }
    setSaving(true)
    const { error: insertError } = await createContactRequest({ user_id: userId, provider_id: provider.id, wedding_date: weddingDate, message: text })
    setSaving(false)
    if (insertError) {
      setError(mutationErrorMessage(insertError, 'Votre demande n’a pas pu être envoyée.'))
      return
    }
    onSent()
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section ref={dialogRef} className="task-modal contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Demande d’informations</p>
            <h2 id="contact-modal-title">Contacter le prestataire</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <form className="task-form" onSubmit={submit} noValidate>
          <p className="contact-provider-name">Prestataire : <strong>{provider.name}</strong></p>
          <label>
            Date du mariage
            <input type="date" value={weddingDate} onChange={(event) => setWeddingDate(event.target.value)} required />
          </label>
          <label>
            Votre message
            <textarea
              ref={messageRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows="5"
              maxLength={MESSAGE_MAX}
              required
              placeholder="Présentez votre projet et vos questions..."
            />
            <small className="contact-counter">{message.trim().length} / {MESSAGE_MAX} caractères (minimum {MESSAGE_MIN})</small>
          </label>
          <p className="contact-disclaimer" role="note">
            Votre demande n’est pas une réservation confirmée. Le prestataire doit confirmer sa disponibilité.
          </p>
          {error && <p className="auth-message error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Annuler</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Envoi en cours...' : 'Envoyer ma demande'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
