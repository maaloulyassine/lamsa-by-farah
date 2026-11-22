import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import { Wordmark } from '../components/ui/Wordmark'

export function WeddingSetup() {
  const { user, profile, refreshWedding, signOut } = useAuth()
  const [governorates, setGovernorates] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(isSupabaseConfigured ? '' : 'Les données Supabase ne sont pas configurées.')
  const [saving, setSaving] = useState(false)
  const [coupleName, setCoupleName] = useState(profile?.full_name || '')
  const [weddingDate, setWeddingDate] = useState('')
  const [preparationStart, setPreparationStart] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [city, setCity] = useState('')
  const [budget, setBudget] = useState('')
  const [guestCount, setGuestCount] = useState('')

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
    setError('')
    setSaving(true)

    try {
      const { error: insertError } = await supabase.from('weddings').insert({
        user_id: user.id,
        couple_name: coupleName.trim(),
        wedding_date: weddingDate,
        preparation_start_date: preparationStart || null,
        governorate_id: governorateId,
        city: city.trim(),
        guest_count: guestCount ? Number(guestCount) : null,
        total_budget: Number(budget),
      })
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
        <form onSubmit={submit}>
          <label>Nom du couple ou du projet<input value={coupleName} onChange={(event) => setCoupleName(event.target.value)} required /></label>
          <label>Date du mariage<input type="date" value={weddingDate} onChange={(event) => setWeddingDate(event.target.value)} required /></label>
          <label>Gouvernorat
            <select value={governorateId} onChange={(event) => setGovernorateId(event.target.value)} required>
              <option value="">Sélectionner</option>
              {governorates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>Ville<input value={city} onChange={(event) => setCity(event.target.value)} required /></label>
          <label>Budget total (TND)<input type="number" min="0" step="0.01" value={budget} onChange={(event) => setBudget(event.target.value)} required /></label>
          <label>Nombre d’invités<input type="number" min="0" value={guestCount} onChange={(event) => setGuestCount(event.target.value)} /></label>
          <label>Date de début des préparatifs<input type="date" value={preparationStart} onChange={(event) => setPreparationStart(event.target.value)} /></label>
          <button className="primary-button auth-submit" disabled={saving || governorates.length === 0}>{saving ? 'Création...' : 'Créer mon projet'}</button>
        </form>
        <button className="auth-switch" onClick={signOut}>Se déconnecter</button>
      </section>
    </main>
  )
}
