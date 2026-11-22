import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import { Wordmark } from '../components/ui/Wordmark'
import { WeddingFields } from '../components/profile/WeddingFields'
import { EMPTY_WEDDING_VALUES, validateWedding, valuesToWeddingRow } from '../utils/weddingForm'

export function WeddingSetup() {
  const { user, profile, refreshWedding, signOut } = useAuth()
  const [governorates, setGovernorates] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(isSupabaseConfigured ? '' : 'Les données Supabase ne sont pas configurées.')
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState(() => ({ ...EMPTY_WEDDING_VALUES, coupleName: profile?.full_name || '' }))
  const onChange = (field, value) => setValues((current) => ({ ...current, [field]: value }))

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    supabase
      .from('governorates')
      .select('id,name,slug')
      .eq('is_active', true)
      .order('name')
      .then(({ data, error: readError }) => {
        if (readError) setError(readError.message)
        setGovernorates(data ?? [])
        setLoading(false)
      })
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    const invalid = validateWedding(values)
    if (invalid) { setError(invalid); return }
    setError('')
    setSaving(true)

    try {
      const { error: insertError } = await supabase.from('weddings').insert({ user_id: user.id, ...valuesToWeddingRow(values) })
      if (insertError) throw insertError
      await refreshWedding()
    } catch (caught) {
      setError(caught.message || 'Le projet n’a pas pu être créé.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="state-page"><div className="loading-state">Chargement des gouvernorats...</div></main>

  return (
    <main className="auth-screen setup-screen">
      <section className="auth-card setup-card">
        <div className="brand brand-auth"><Wordmark size="md" /></div>
        <p className="eyebrow">Premier accès</p>
        <h1>Votre projet de mariage</h1>
        <p className="auth-intro">Renseignez les informations essentielles. Vous pourrez les modifier ensuite.</p>
        {error && <p className="auth-message error">{error}</p>}
        {!error && governorates.length === 0 && <p className="auth-message error">Aucun gouvernorat disponible. Le catalogue doit être initialisé.</p>}
        <form onSubmit={submit} noValidate>
          <WeddingFields values={values} onChange={onChange} governorates={governorates} />
          <button className="primary-button auth-submit" disabled={saving || governorates.length === 0}>{saving ? 'Création...' : 'Créer mon projet'}</button>
        </form>
        <button className="auth-switch" onClick={signOut}>Se déconnecter</button>
      </section>
    </main>
  )
}
