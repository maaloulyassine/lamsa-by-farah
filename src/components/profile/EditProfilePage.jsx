import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { updateProfile } from '../../services/projectService'
import { mutationErrorMessage } from '../../utils/format'
import { Flourish } from '../ui/Flourish'

const SUCCESS_TIMEOUT_MS = 4000
const PHONE_PATTERN = /^[+\d][\d\s().-]{5,19}$/

// « Modifier mon profil »: display name and phone. E-mail / password are managed by Supabase Auth (out of scope).
export function EditProfilePage({ onBack }) {
  const { user, profile, refreshWedding } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!success) return undefined
    const id = setTimeout(() => setSuccess(''), SUCCESS_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [success])

  const submit = async (event) => {
    event.preventDefault()
    if (!fullName.trim()) { setError('Indiquez votre nom ou celui du couple.'); return }
    if (phone.trim() && !PHONE_PATTERN.test(phone.trim())) { setError('Le numéro de téléphone n’est pas valide.'); return }
    setError('')
    setSaving(true)
    const { error: updateError } = await updateProfile(user.id, { full_name: fullName.trim(), phone: phone.trim() || null })
    if (updateError) {
      setSaving(false)
      setError(mutationErrorMessage(updateError, 'Le profil n’a pas pu être enregistré.'))
      return
    }
    await refreshWedding() // reloads profile + wedding
    setSaving(false)
    setSuccess('Votre profil a été mis à jour.')
  }

  return (
    <section className="edit-profile-page" aria-labelledby="edit-profile-title">
      <button type="button" className="secondary-button provider-back" onClick={onBack}>← Retour au profil</button>
      <div className="page-title">
        <div>
          <p className="eyebrow">Votre espace personnel</p>
          <h1 id="edit-profile-title">Modifier mon profil</h1>
          <Flourish className="title-flourish" />
        </div>
      </div>
      {success && <p className="success-banner" role="status">{success}</p>}
      <div className="content-card project-form-card">
        <form className="task-form" onSubmit={submit} noValidate>
          {error && <p className="auth-message error" role="alert">{error}</p>}
          <label>Nom du couple ou prénom<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>
          <label>Téléphone facultatif<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+216 XX XXX XXX" /></label>
          <label>E-mail<input type="email" value={user?.email || ''} readOnly aria-describedby="email-hint" /></label>
          <small id="email-hint" className="field-hint">L’adresse e-mail sert à la connexion et ne peut pas être modifiée ici.</small>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onBack} disabled={saving}>Annuler</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}
