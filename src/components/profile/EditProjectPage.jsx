import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { listGovernorates, updateWedding } from '../../services/projectService'
import { mutationErrorMessage } from '../../utils/format'
import { validateWedding, valuesToWeddingRow, weddingToValues } from '../../utils/weddingForm'
import { Flourish } from '../ui/Flourish'
import { WeddingFields } from './WeddingFields'

const SUCCESS_TIMEOUT_MS = 4000

// « Mon projet de mariage » (Profil): edit the wedding project created at first run.
export function EditProjectPage({ onBack, onNavigate }) {
  const { user, wedding, refreshWedding } = useAuth()
  const [values, setValues] = useState(() => weddingToValues(wedding))
  const [governorates, setGovernorates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [dateChanged, setDateChanged] = useState(false)

  useEffect(() => {
    let active = true
    listGovernorates().then(({ data, error: readError }) => {
      if (!active) return
      if (readError) setError('Les gouvernorats n’ont pas pu être chargés.')
      setGovernorates(data ?? [])
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!success) return undefined
    const id = setTimeout(() => setSuccess(''), SUCCESS_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [success])

  const onChange = (field, value) => setValues((current) => ({ ...current, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    const invalid = validateWedding(values)
    if (invalid) { setError(invalid); return }
    setError('')
    setSaving(true)
    const previousDate = wedding?.wedding_date
    const { error: updateError } = await updateWedding(wedding.id, user.id, valuesToWeddingRow(values))
    if (updateError) {
      setSaving(false)
      setError(mutationErrorMessage(updateError, 'Le projet n’a pas pu être enregistré.'))
      return
    }
    await refreshWedding()
    setSaving(false)
    setDateChanged(previousDate !== values.weddingDate)
    setSuccess('Votre projet a été mis à jour.')
  }

  return (
    <section className="edit-project-page" aria-labelledby="edit-project-title">
      <button type="button" className="secondary-button provider-back" onClick={onBack}>← Retour au profil</button>
      <div className="page-title">
        <div>
          <p className="eyebrow">Votre espace personnel</p>
          <h1 id="edit-project-title">Mon projet de mariage</h1>
          <Flourish className="title-flourish" />
        </div>
      </div>
      {success && <p className="success-banner" role="status">{success}</p>}
      {dateChanged && (
        <div className="project-notice" role="note">
          <p>La date du mariage a changé. Les tâches déjà prévues gardent leurs dates : vous pouvez régénérer le planning pour les recalculer.</p>
          <button type="button" className="text-button" onClick={() => onNavigate('planning')}>Aller au planning</button>
        </div>
      )}
      <div className="content-card project-form-card">
        {loading ? <div className="loading-state">Chargement…</div> : (
          <form className="task-form" onSubmit={submit} noValidate>
            {error && <p className="auth-message error" role="alert">{error}</p>}
            <WeddingFields values={values} onChange={onChange} governorates={governorates} />
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={onBack} disabled={saving}>Annuler</button>
              <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
