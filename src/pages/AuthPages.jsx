import { useState } from 'react'
import { useAuth } from '../context/useAuth'

export function AuthScreen({ initialMode = 'signin', onBack, expired = false }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Veuillez indiquer vos noms.')
        const { data, error: signupError } = await signUp({ fullName: fullName.trim(), email, phone, password })
        if (signupError) throw signupError
        if (data.session) setSuccess('Votre compte est prêt.')
        else setSuccess('Votre compte est créé. Consultez votre e-mail pour confirmer votre inscription.')
      } else {
        const { error: signinError } = await signIn(email, password)
        if (signinError) throw signinError
      }
    } catch (caught) {
      setError(caught.message || 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <button className="auth-back" onClick={onBack}>← Retour</button>
        <div className="brand brand-auth"><span className="brand-mark">♡</span><span>LAMSA <em>by Farah</em></span></div>
        <h1>{mode === 'signup' ? 'Créer votre compte' : 'Bienvenue'}</h1>
        <p className="auth-intro">{mode === 'signup' ? 'Commencez à organiser votre mariage.' : 'Retrouvez votre espace mariage.'}</p>
        {expired && <p className="auth-message error">Votre session a expiré. Veuillez vous reconnecter.</p>}
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>Nom du couple ou prénom<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>
              <label>Téléphone facultatif<input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" /></label>
            </>
          )}
          <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required /></label>
          {error && <p className="auth-message error">{error}</p>}
          {success && <p className="auth-message success">{success}</p>}
          <button className="primary-button auth-submit" disabled={submitting}>{submitting ? 'Chargement...' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}</button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setSuccess('') }}>
          {mode === 'signup' ? 'J’ai déjà un compte' : 'Créer un compte'}
        </button>
      </section>
    </main>
  )
}
