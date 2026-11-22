import { useEffect, useState } from 'react'
import './App.css'
import { useAuth } from './context/useAuth'
import { AuthScreen } from './pages/AuthPages'
import { WeddingSetup } from './pages/WeddingSetup'
import { PlanningPage } from './components/planner/PlanningPage'
import { listWeddingTasks, updateTask } from './services/tasksService'
import { BudgetPage } from './components/budget/BudgetPage'
import { ProvidersPage } from './components/providers/ProvidersPage'
import { FavoritesPage } from './components/favorites/FavoritesPage'
import { MyRequestsPage } from './components/contact/MyRequestsPage'
import { AdminRequestsPage } from './components/admin/AdminRequestsPage'
import { formatTnd, mutationErrorMessage } from './utils/format'
import { Wordmark } from './components/ui/Wordmark'
import { Flourish } from './components/ui/Flourish'
import { Burst } from './components/ui/Burst'
import { RollingNumber } from './components/ui/RollingNumber'
import { toggleTheme, useTheme } from './utils/theme'
import { WelcomeCarousel } from './components/welcome/WelcomeCarousel'

const categories = [
  ['Salle de mariage', 'building', 'Salles de mariage'],
  ['Décoration', 'flower', 'Décoration'],
  ['Robe', 'dress', 'Robes de mariée'],
  ['Traiteur', 'cloche', 'Traiteurs et chefs'],
  ['Gâteau', 'cake', 'Wedding cakes / gâteaux'],
  ['Artistes & DJ', 'music', 'DJ et artistes'],
]

function Icon({ name, size = 20 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    heart: <path d="M20.8 8.6c0 5.4-8.8 10.1-8.8 10.1S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />,
    calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M16 2v5M8 2v5M3 10h18" /></>,
    wallet: <><path d="M3 6.5h16a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2v-11Z" /><path d="M3 7V5a2 2 0 0 1 2-2h13v4M16 14h.01" /></>,
    user: <><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    search: <><circle cx="10.8" cy="10.8" r="7.5" /><path d="m17 17 4 4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    back: <path d="m15 18-6-6 6-6" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></>,
    building: <><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6M8 10h1M15 10h1M8 13h1M15 13h1" /></>,
    flower: <><path d="M12 21c-1.6-4.1-1.5-7.5 0-10.2C13.6 8.1 16.3 7.5 18 9c1.8 1.6.7 4.5-2.1 5.5-2.5.9-4.1-.9-3.9-3.6" /><path d="M12 21c1.6-4.1 1.5-7.5 0-10.2C10.4 8.1 7.7 7.5 6 9c-1.8 1.6-.7 4.5 2.1 5.5 2.5.9 4.1-.9 3.9-3.6M12 11c-2-2-2.1-4.8 0-6 2.1 1.2 2 4 0 6Z" /></>,
    dress: <path d="M9 3h6l1 5 4 4-3 2-2-2 2 9H7l2-9-2 2-3-2 4-4 1-5Z" />,
    cloche: <><path d="M4 17h16M6 17a6 6 0 0 1 12 0M3 20h18M12 7V5M10 5h4" /></>,
    cake: <><path d="M4 12h16v8H4zM4 16h16M7 12V9h10v3M9 9V6h6v3M12 6V3" /></>,
    music: <><path d="M9 18V5l10-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3ZM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" /></>,
    camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
    car: <><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5l1.5-3h8l1.5 3H19a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>,
    check: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></>,
    moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.check}</svg>
}

function App() {
  const { user, profile, wedding, loading, error, sessionExpired, refreshWedding } = useAuth()
  // Phase 6: admin flag from the JWT's app_metadata (server-side only); RLS enforces it anyway.
  const isAdmin = user?.app_metadata?.is_admin === true
  const [authMode, setAuthMode] = useState(null)
  const [activePage, setActivePage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const theme = useTheme()


  if (!user && (authMode || sessionExpired)) {
    return <AuthScreen initialMode="signin" onBack={() => setAuthMode(null)} expired={sessionExpired} />
  }

  if (!user) return <Welcome onStart={() => setAuthMode('signup')} onSignIn={() => setAuthMode('signin')} />

  if (loading) return <main className="state-page"><div className="loading-state">Chargement de votre espace mariage...</div></main>

  if (error) return <main className="state-page"><div className="error-state"><h1>Impossible de charger votre espace</h1><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()}>Réessayer</button></div></main>

  if (!wedding) return <WeddingSetup />

  return (
    <div className="app-shell">
      <aside className={`side-panel ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand brand-sidebar"><Wordmark size="md" /></div>
        <nav className="side-nav">
          <NavItem icon="home" label="Accueil" active={activePage === 'home'} onClick={() => { setActivePage('home'); setMenuOpen(false) }} />
          <NavItem icon="heart" label="Mes favoris" active={activePage === 'favorites'} onClick={() => { setActivePage('favorites'); setMenuOpen(false) }} />
          <NavItem icon="calendar" label="Mon planning" active={activePage === 'planning'} onClick={() => { setActivePage('planning'); setMenuOpen(false) }} />
          <NavItem icon="wallet" label="Mon budget" active={activePage === 'budget'} onClick={() => { setActivePage('budget'); setMenuOpen(false) }} />
          <NavItem icon="building" label="Trouver un service" active={activePage === 'services'} onClick={() => { setActivePage('services'); setMenuOpen(false) }} />
        </nav>
        <div className="side-bottom"><NavItem icon="user" label="Mon profil" active={activePage === 'profile' || activePage === 'requests' || activePage === 'admin-requests'} onClick={() => { setActivePage('profile'); setMenuOpen(false) }} /><p>Votre mariage,<br /><strong>votre signature.</strong></p></div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Ouvrir le menu">☰</button>
          <div className="brand brand-mobile"><Wordmark size="sm" /></div>
          <div className="topbar-actions"><button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={theme === 'soiree' ? 'Passer au mode clair' : 'Passer au mode soirée'} title={theme === 'soiree' ? 'Mode clair' : 'Mode soirée'}><Icon name={theme === 'soiree' ? 'sun' : 'moon'} size={19} /></button><button className="icon-button notification" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><button className="avatar" onClick={() => setActivePage('profile')}>F</button></div>
        </header>
        <main className="page-content">
          {activePage === 'home' && <Dashboard setActivePage={setActivePage} wedding={wedding} profile={profile} />}
          {activePage === 'planning' && <PlanningPage wedding={wedding} onNavigateToRequests={() => setActivePage('requests')} />}
          {activePage === 'budget' && <BudgetPage wedding={wedding} refreshWedding={refreshWedding} />}
          {activePage === 'services' && <ProvidersPage wedding={wedding} userId={user?.id} />}
          {activePage === 'favorites' && <FavoritesPage wedding={wedding} userId={user?.id} onDiscover={() => setActivePage('services')} />}
          {activePage === 'profile' && <Profile setActivePage={setActivePage} />}
          {activePage === 'requests' && <MyRequestsPage onBack={() => setActivePage('profile')} onDiscover={() => setActivePage('services')} />}
          {activePage === 'admin-requests' && isAdmin && <AdminRequestsPage onBack={() => setActivePage('profile')} />}
        </main>
      </div>
    </div>
  )
}

function Welcome({ onStart, onSignIn }) {
  return (
    <WelcomeCarousel>
      <button type="button" className="primary-button welcome-cta" onClick={onStart}>Commencer <Icon name="arrow" size={17} /></button>
      <button type="button" className="secondary-button welcome-cta" onClick={onSignIn}>J’ai déjà un compte</button>
    </WelcomeCarousel>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><Icon name={icon} size={19} /><span>{label}</span></button>
}

function PageTitle({ eyebrow, title, action }) {
  return <div className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><Flourish className="title-flourish" /></div>{action}</div>
}

const TASK_LEAVE_MS = 560

function Dashboard({ setActivePage, wedding, profile }) {
  const [dashboardNow, setDashboardNow] = useState(() => new Date())
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState('')
  const [success, setSuccess] = useState('')
  const [toggleError, setToggleError] = useState('')
  const [pendingTaskId, setPendingTaskId] = useState(null)
  const [leavingTaskId, setLeavingTaskId] = useState(null)
  const [barPercent, setBarPercent] = useState(0)

  // Auto-dismiss the success toast (same 4 s as Planning).
  useEffect(() => {
    if (!success) return undefined
    const id = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(id)
  }, [success])

  // Same status update as Planning's check box; done tasks then drop out of the upcoming list.
  const toggleTask = async (task) => {
    if (pendingTaskId) return
    const status = task.status === 'done' ? 'todo' : 'done'
    setPendingTaskId(task.id)
    setToggleError('')
    const { error: updateError } = await updateTask(task.id, wedding.id, { status })
    setPendingTaskId(null)
    if (updateError) {
      setToggleError(mutationErrorMessage(updateError, 'Impossible d’enregistrer le statut. Réessayez.'))
      return
    }
    setSuccess('Le statut a été enregistré.')
    const apply = () => setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status } : item)))
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (status !== 'done' || reduce) { apply(); return }
    // Confetti on the box, then the row slides out before the list updates.
    setLeavingTaskId(task.id)
    setTimeout(() => { apply(); setLeavingTaskId(null) }, TASK_LEAVE_MS)
  }

  useEffect(() => {
    const id = setInterval(() => setDashboardNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let active = true
    listWeddingTasks(wedding.id).then(({ data, error }) => {
      if (!active) return
      if (error) setTasksError(error.message)
      setTasks(data ?? [])
      setTasksLoading(false)
    })
    return () => { active = false }
  }, [wedding.id])

  const upcoming = tasks.filter((task) => task.status !== 'done').slice(0, 3)
  // Countdown to the start (00:00) of the wedding day; preparation = done tasks / all tasks.
  const countdownTarget = wedding?.wedding_date ? new Date(`${wedding.wedding_date}T00:00:00`) : null
  const remainingMs = countdownTarget ? Math.max(0, countdownTarget - dashboardNow) : 0
  const cdDays = Math.floor(remainingMs / 86_400_000)
  const cdHours = Math.floor((remainingMs % 86_400_000) / 3_600_000)
  const cdMinutes = Math.floor((remainingMs % 3_600_000) / 60_000)
  const doneCount = tasks.filter((task) => task.status === 'done').length
  const preparation = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0
  const greetingName = profile?.full_name?.trim() || 'vous'
  const weddingDate = wedding?.wedding_date ? new Date(`${wedding.wedding_date}T12:00:00`) : null
  const weddingDateLabel = weddingDate
    ? weddingDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date à définir'
  const initials = greetingName[0]?.toUpperCase() || 'F'

  useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setBarPercent(preparation)) })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [preparation])
  return <><PageTitle eyebrow={new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dashboardNow)} title={<>Bonjour {greetingName} <span className="wave">👋</span></>} action={<button className="profile-chip" onClick={() => setActivePage('profile')}><span>{initials}</span><b>{greetingName.split(' ')[0]}</b><Icon name="chevron" size={14} /></button>} /><p className="intro-copy">Prête à organiser le plus beau jour de votre vie ?</p>
    {success && <p className="success-banner" role="status">{success}</p>}
    {toggleError && <div className="error-banner" role="alert"><span>{toggleError}</span><button onClick={() => setToggleError('')} aria-label="Fermer">×</button></div>}
    <section className="hero-card dash-enter" style={{ '--i': 1 }}><div className="hero-image" /><div className="hero-overlay"><span className="pill light">Votre espace mariage</span><h2>Rêvez grand.<br /><em>On s’occupe du reste.</em></h2><button className="ghost-button" onClick={() => setActivePage('services')}>Découvrir les services <Icon name="arrow" size={15} /></button></div></section>
    <div className="quick-grid dash-enter" style={{ '--i': 2 }}>{categories.map(([label, icon]) => <button key={label} className="quick-card" onClick={() => setActivePage('services')}><span className="quick-icon"><Icon name={icon} size={23} /></span><span>{label}</span></button>)}</div>
    <div className="dashboard-grid"><section className="content-card countdown-card dash-enter" style={{ '--i': 3 }}><div className="card-heading"><div><p className="eyebrow">Le grand jour</p><h2>{weddingDateLabel}</h2></div><span className="calendar-badge"><Icon name="calendar" size={19} /></span></div><div className="countdown"><div><strong><RollingNumber value={countdownTarget ? cdDays : '--'} testId="countdown-days" /></strong><span>jours</span></div><b>·</b><div><strong><RollingNumber value={countdownTarget ? cdHours : '--'} pad={2} testId="countdown-hours" /></strong><span>heures</span></div><b>·</b><div><strong><RollingNumber value={countdownTarget ? cdMinutes : '--'} pad={2} testId="countdown-minutes" /></strong><span>minutes</span></div></div><div className="progress-label"><span>Votre préparation</span><b data-testid="preparation-percent">{preparation}%</b></div><div className="progress" role="progressbar" aria-label="Votre préparation" aria-valuemin={0} aria-valuemax={100} aria-valuenow={preparation}><span className="progress-fill" style={{ transform: `scaleX(${barPercent / 100})` }} /></div><button className="text-button" onClick={() => setActivePage('planning')}>Voir mon planning <Icon name="arrow" size={14} /></button></section>
      <section className="content-card tasks-card dash-enter" style={{ '--i': 4 }}><div className="card-heading"><div><p className="eyebrow">À ne pas oublier</p><h2>Prochaines tâches</h2></div><button className="round-button" onClick={() => setActivePage('planning')}><Icon name="plus" size={17} /></button></div>{tasksLoading ? <div className="loading-state">Chargement...</div> : tasksError ? <div className="error-banner">{tasksError}</div> : upcoming.length === 0 ? <div className="empty-day"><p>Aucune tâche à venir</p><button className="text-button" onClick={() => setActivePage('planning')}>Générer le planning</button></div> : <div className="task-list compact">{upcoming.map((task) => <TaskRow key={task.id} task={{ ...task, date: task.task_date }} onToggle={() => toggleTask(task)} disabled={pendingTaskId === task.id || leavingTaskId === task.id} leaving={leavingTaskId === task.id} />)}</div>}<button className="text-button" onClick={() => setActivePage('planning')}>Voir toutes les tâches <Icon name="arrow" size={14} /></button></section></div>
  </>
}

function TaskRow({ task, onToggle, disabled = false, leaving = false }) {
  return <div className={`task-row ${task.status === 'done' || leaving ? 'completed' : ''} ${leaving ? 'is-leaving' : ''}`}><button className="check-button" onClick={onToggle} disabled={disabled} aria-label={`Marquer ${task.title} comme ${task.status === 'done' ? 'à faire' : 'terminée'}`}>{(task.status === 'done' || leaving) && <Icon name="check" size={14} />}{leaving && <Burst variant="confetti" />}</button><span className="task-icon"><Icon name={task.icon || 'check'} size={17} /></span><div><strong>{task.title}</strong><small>{new Date(`${task.date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</small></div></div>
}

function Profile({ setActivePage }) {
  const { signOut, profile, user, wedding } = useAuth()
  const isAdmin = user?.app_metadata?.is_admin === true
  const theme = useTheme()
  const initial = profile?.full_name?.trim()?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'F'
  const weddingDate = wedding?.wedding_date
    ? new Date(`${wedding.wedding_date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Projet à compléter'
  // Explicit action per item (no index-based dispatch). `page: null` = inactive placeholder (see Known issues).
  const menuItems = [
    { icon: 'calendar', label: 'Mon projet de mariage', meta: weddingDate, page: null },
    { icon: 'wallet', label: 'Mon budget', meta: formatTnd(wedding?.total_budget), page: 'budget' },
    { icon: 'heart', label: 'Mes services favoris', meta: 'Vos prestataires enregistrés', page: 'favorites' },
    { icon: 'mail', label: 'Mes demandes de contact', meta: 'Suivi de vos demandes aux prestataires', page: 'requests' },
    ...(isAdmin ? [{ icon: 'shield', label: 'Admin — Demandes', meta: 'Bonus post-MVP · toutes les demandes', page: 'admin-requests' }] : []),
    // Former inactive « Paramètres » item: now the evening-theme switch.
    { icon: theme === 'soiree' ? 'sun' : 'moon', label: 'Mode soirée', meta: theme === 'soiree' ? 'Activé · thème sombre et doré' : 'Désactivé · thème clair', onSelect: toggleTheme, switchOn: theme === 'soiree' },
  ]
  return <><PageTitle eyebrow="Votre espace personnel" title="Mon profil" /><section className="profile-header content-card"><div className="large-avatar">{initial}</div><div><h2>{profile?.full_name || 'Votre profil'}</h2><p>{user?.email}</p><button className="text-button">Modifier mon profil <Icon name="arrow" size={14} /></button></div></section><div className="profile-menu content-card">{menuItems.map(({ icon, label, meta, page, onSelect, switchOn }) => <button key={label} onClick={() => { if (onSelect) onSelect(); else if (page) setActivePage(page) }} {...(switchOn === undefined ? {} : { role: 'switch', 'aria-checked': switchOn, className: 'theme-switch-row' })}><span className="profile-menu-icon"><Icon name={icon} size={19} /></span><span><strong>{label}</strong><small>{meta}</small></span>{switchOn === undefined ? <Icon name="chevron" size={17} /> : <span className={`theme-switch ${switchOn ? 'is-on' : ''}`} aria-hidden="true" />}</button>)}</div><button className="logout-button" onClick={signOut}>Se déconnecter</button></>
}

export default App
