import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [wedding, setWedding] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(isSupabaseConfigured ? '' : 'Supabase n’est pas configuré.')
  const [sessionExpired, setSessionExpired] = useState(false)

  const refreshProfileAndWedding = useCallback(async (user, { silent = false } = {}) => {
    if (!user) {
      setProfile(null)
      setWedding(null)
      setLoading(false)
      return
    }

    if (!silent) setLoading(true)
    setError('')

    const [profileResult, weddingResult] = await Promise.all([
      supabase.from('profiles').select('id,full_name,phone,created_at,updated_at').eq('id', user.id).maybeSingle(),
      supabase.from('weddings').select('*, governorates(name,slug)').eq('user_id', user.id).maybeSingle(),
    ])

    const authErrors = [profileResult.error, weddingResult.error].filter(Boolean)
    const expired = authErrors.some((resultError) =>
      resultError.status === 401
      || resultError.code === 'PGRST301'
      || /JWT|token|expired/i.test(resultError.message || '')
    )
    if (expired) {
      setSessionExpired(true)
      await supabase.auth.signOut()
      setSession(null)
      setProfile(null)
      setWedding(null)
      setError('Votre session a expiré. Veuillez vous reconnecter.')
      setLoading(false)
      return
    }

    if (profileResult.error) setError(profileResult.error.message)
    if (weddingResult.error) setError(weddingResult.error.message)

    setProfile(profileResult.data ?? null)
    setWedding(weddingResult.data ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Configuration state is initialized directly below, avoiding setState in effect.
      return undefined
    }

    let active = true

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) {
        setError(sessionError.message)
        setLoading(false)
        return
      }
      setSession(data.session)
      refreshProfileAndWedding(data.session?.user).catch((refreshError) => {
        setError(refreshError.message)
        setLoading(false)
      })
    })

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setProfile(null)
        setWedding(null)
        setError('')
        setLoading(false)
        return
      }
      setSession(nextSession)
      refreshProfileAndWedding(nextSession?.user).catch((refreshError) => {
        setError(refreshError.message)
        setLoading(false)
      })
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [refreshProfileAndWedding])

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase n’est pas configuré.')
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (!result.error) setSessionExpired(false)
    return result
  }

  const signUp = async ({ fullName, email, phone, password }) => {
    if (!supabase) throw new Error('Supabase n’est pas configuré.')
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone || null } },
    })
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setWedding(null)
    setError('')
  }

  const refreshWedding = useCallback(async () => {
    if (session?.user) await refreshProfileAndWedding(session.user, { silent: true })
  }, [session, refreshProfileAndWedding])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    wedding,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshWedding,
    sessionExpired,
  }), [session, profile, wedding, loading, error, sessionExpired, refreshWedding])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

