import { useEffect, useState } from 'react'
import './App.css'
import { useAuth } from './context/useAuth'
import { AuthScreen } from './pages/AuthPages'
import { WeddingSetup } from './pages/WeddingSetup'
import { isSupabaseConfigured, supabase } from './services/supabaseClient'

const dashboardNow = new Date()

const providerImages = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=85',
]

const categories = [
  ['Salle de mariage', 'building', 'Salles de mariage'],
  ['Décoration', 'flower', 'Décoration'],
  ['Robe', 'dress', 'Robes de mariée'],
  ['Traiteur', 'cloche', 'Traiteurs et chefs'],
  ['Gâteau', 'cake', 'Wedding cakes / gâteaux'],
  ['Artistes & DJ', 'music', 'DJ et artistes'],
]

const initialTasks = [
  { id: 1, title: 'Réserver la salle', date: '2026-11-18', status: 'done', icon: 'building' },
  { id: 2, title: 'Choisir le thème', date: '2026-11-20', status: 'done', icon: 'flower' },
  { id: 3, title: 'Commander le gâteau', date: '2026-11-24', status: 'todo', icon: 'cake' },
  { id: 4, title: 'Finaliser la décoration', date: '2026-11-28', status: 'todo', icon: 'flower' },
  { id: 5, title: 'Confirmer les prestataires', date: '2026-12-03', status: 'todo', icon: 'check' },
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
    check: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.check}</svg>
}

function App() {
  const { user, profile, wedding, loading, error, sessionExpired } = useAuth()
  const [authMode, setAuthMode] = useState(null)
  const [activePage, setActivePage] = useState('home')
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedCategory, setSelectedCategory] = useState('Toutes')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleTask = (id) => setTasks((items) => items.map((task) => task.id === id ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task))

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
        <div className="brand brand-sidebar"><span className="brand-mark">♡</span><span>LAMSA <em>by Farah</em></span></div>
        <nav className="side-nav">
          <NavItem icon="home" label="Accueil" active={activePage === 'home'} onClick={() => setActivePage('home')} />
          <NavItem icon="heart" label="Mes favoris" active={activePage === 'favorites'} onClick={() => setActivePage('favorites')} />
          <NavItem icon="calendar" label="Mon planning" active={activePage === 'planning'} onClick={() => setActivePage('planning')} />
          <NavItem icon="wallet" label="Mon budget" active={activePage === 'budget'} onClick={() => setActivePage('budget')} />
          <NavItem icon="building" label="Trouver un service" active={activePage === 'services'} onClick={() => setActivePage('services')} />
        </nav>
        <div className="side-bottom"><NavItem icon="user" label="Mon profil" active={activePage === 'profile'} onClick={() => setActivePage('profile')} /><p>Votre mariage,<br /><strong>votre signature.</strong></p></div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Ouvrir le menu">☰</button>
          <div className="brand brand-mobile"><span className="brand-mark">♡</span><span>LAMSA <em>by Farah</em></span></div>
          <div className="topbar-actions"><button className="icon-button notification" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><button className="avatar" onClick={() => setActivePage('profile')}>F</button></div>
        </header>
        <main className="page-content">
          {activePage === 'home' && <Dashboard setActivePage={setActivePage} tasks={tasks} toggleTask={toggleTask} wedding={wedding} profile={profile} />}
          {activePage === 'planning' && <Planning tasks={tasks} toggleTask={toggleTask} />}
          {activePage === 'budget' && <Budget />}
          {activePage === 'services' && <Services search={search} setSearch={setSearch} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />}
          {activePage === 'favorites' && <Favorites setActivePage={setActivePage} />}
          {activePage === 'profile' && <Profile setActivePage={setActivePage} />}
        </main>
      </div>
    </div>
  )
}

function Welcome({ onStart, onSignIn }) {
  return <div className="welcome-screen"><div className="welcome-art" /><div className="welcome-card"><div className="brand brand-welcome"><span className="brand-mark">♡</span><span>LAMSA <em>by Farah</em></span></div><p className="welcome-tagline">Votre mariage,<br /><strong>votre signature.</strong></p><div className="welcome-rule">♡</div><button className="primary-button welcome-button" onClick={onStart}>Commencer <Icon name="arrow" size={17} /></button><button className="welcome-signin" onClick={onSignIn}>J’ai déjà un compte</button><p className="welcome-note">Votre assistant pour un mariage inoubliable</p></div></div>
}

function NavItem({ icon, label, active, onClick }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><Icon name={icon} size={19} /><span>{label}</span></button>
}

function PageTitle({ eyebrow, title, action }) {
  return <div className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{action}</div>
}

function Dashboard({ setActivePage, tasks, toggleTask, wedding, profile }) {
  const upcoming = tasks.filter((task) => task.status !== 'done').slice(0, 3)
  const greetingName = profile?.full_name?.trim() || 'vous'
  const weddingDate = wedding?.wedding_date ? new Date(`${wedding.wedding_date}T12:00:00`) : null
  const weddingDateLabel = weddingDate
    ? weddingDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date à définir'
  const initials = greetingName[0]?.toUpperCase() || 'F'
  return <><PageTitle eyebrow={new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dashboardNow)} title={<>Bonjour {greetingName} <span className="wave">👋</span></>} action={<button className="profile-chip" onClick={() => setActivePage('profile')}><span>{initials}</span><b>{greetingName.split(' ')[0]}</b><Icon name="chevron" size={14} /></button>} /><p className="intro-copy">Prête à organiser le plus beau jour de votre vie ?</p>
    <section className="hero-card"><div className="hero-image" /><div className="hero-overlay"><span className="pill light">Votre espace mariage</span><h2>Rêvez grand.<br /><em>On s’occupe du reste.</em></h2><button className="ghost-button" onClick={() => setActivePage('services')}>Découvrir les services <Icon name="arrow" size={15} /></button></div></section>
    <div className="quick-grid">{categories.map(([label, icon]) => <button key={label} className="quick-card" onClick={() => setActivePage('services')}><span className="quick-icon"><Icon name={icon} size={23} /></span><span>{label}</span></button>)}</div>
    <div className="dashboard-grid"><section className="content-card countdown-card"><div className="card-heading"><div><p className="eyebrow">Le grand jour</p><h2>{weddingDateLabel}</h2></div><span className="calendar-badge"><Icon name="calendar" size={19} /></span></div><div className="countdown"><div><strong>{weddingDate ? Math.max(0, Math.ceil((weddingDate - dashboardNow) / 86400000)) : '--'}</strong><span>jours</span></div><b>·</b><div><strong>08</strong><span>heures</span></div><b>·</b><div><strong>42</strong><span>minutes</span></div></div><div className="progress-label"><span>Votre préparation</span><b>42%</b></div><div className="progress"><span style={{ width: '42%' }} /></div><button className="text-button" onClick={() => setActivePage('planning')}>Voir mon planning <Icon name="arrow" size={14} /></button></section>
      <section className="content-card tasks-card"><div className="card-heading"><div><p className="eyebrow">À ne pas oublier</p><h2>Prochaines tâches</h2></div><button className="round-button" onClick={() => setActivePage('planning')}><Icon name="plus" size={17} /></button></div><div className="task-list compact">{upcoming.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}</div><button className="text-button" onClick={() => setActivePage('planning')}>Voir toutes les tâches <Icon name="arrow" size={14} /></button></section></div>
  </>
}

function TaskRow({ task, onToggle }) {
  return <div className={`task-row ${task.status === 'done' ? 'completed' : ''}`}><button className="check-button" onClick={onToggle} aria-label={`Marquer ${task.title}`}>{task.status === 'done' && <Icon name="check" size={14} />}</button><span className="task-icon"><Icon name={task.icon} size={17} /></span><div><strong>{task.title}</strong><small>{new Date(`${task.date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</small></div></div>
}

function Planning() {
  return <><PageTitle eyebrow="Fonctionnalité à venir" title="Mon planning" /><div className="empty-state phase-placeholder"><Icon name="calendar" size={28} /><h3>Votre planning sera disponible prochainement</h3><p>Cette section sera activée avec les données réelles lors de la phase suivante.</p></div></>
}

function Budget() {
  return <><PageTitle eyebrow="Fonctionnalité à venir" title="Mon budget" /><div className="empty-state phase-placeholder"><Icon name="wallet" size={28} /><h3>Votre budget réel sera disponible prochainement</h3><p>Les dépenses locales de démonstration ne sont pas sauvegardées.</p></div></>
}

function Services({ search, setSearch, selectedCategory, setSelectedCategory }) {
  const [providers, setProviders] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(isSupabaseConfigured ? '' : 'Supabase n’est pas configuré.')

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    Promise.all([
      supabase.from('providers').select('*, categories(name,slug), governorates(name,slug)').eq('is_active', true).order('name'),
      supabase.from('categories').select('id,name,slug').eq('is_active', true).order('sort_order'),
    ]).then(([providerResult, categoryResult]) => {
      if (providerResult.error) setError(providerResult.error.message)
      if (categoryResult.error) setError(categoryResult.error.message)
      setProviders(providerResult.data ?? [])
      setCategories(categoryResult.data ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = providers.filter((provider) => {
    const matchesCategory = selectedCategory === 'Toutes' || provider.categories?.slug === selectedCategory
    const matchesSearch = `${provider.name} ${provider.city}`.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return <><PageTitle eyebrow="Tout pour votre grand jour" title="Trouver un service" action={<button className="filter-button"><Icon name="sliders" size={18} /> Filtres</button>} /><div className="search-bar"><Icon name="search" size={19} /><input placeholder="Rechercher un service ou une ville..." value={search} onChange={(event) => setSearch(event.target.value)} /><button>⌘ K</button></div>{loading ? <div className="loading-state">Chargement des services...</div> : error ? <div className="error-state"><h3>Les services n’ont pas pu être chargés</h3><p>{error}</p><button className="text-button" onClick={() => window.location.reload()}>Réessayer</button></div> : <><div className="category-scroller"><button className={selectedCategory === 'Toutes' ? 'active' : ''} onClick={() => setSelectedCategory('Toutes')}>Toutes</button>{categories.map((category) => <button key={category.id} className={selectedCategory === category.slug ? 'active' : ''} onClick={() => setSelectedCategory(category.slug)}>{category.name}</button>)}</div><div className="section-heading"><h2>Nos recommandations</h2><span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span></div>{filtered.length ? <div className="provider-grid">{filtered.map((provider) => <ProviderCard key={provider.id} provider={{ id: provider.id, name: provider.name, city: provider.city, governorate: provider.governorates?.name, rating: provider.rating, reviews: provider.review_count, price: provider.price_from, image: provider.cover_image_url || providerImages[0], description: provider.description, isDemo: provider.is_demo }} favorite={false} onFavorite={() => {}} />)}</div> : <div className="empty-state"><Icon name="search" size={28} /><h3>Aucun service trouvé</h3><p>Essayez une autre recherche ou catégorie.</p></div>}</>}</>
}

function ProviderCard({ provider, favorite, onFavorite }) {
  return <article className="provider-card"><div className="provider-image"><img src={provider.image} alt="" /><span className="provider-location"><Icon name="map" size={12} /> {provider.governorate || provider.city}</span>{provider.isDemo && <span className="demo-badge">Exemple de démonstration</span>}<button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label="Ajouter aux favoris"><Icon name="heart" size={18} /></button></div><div className="provider-body"><div className="provider-title"><h3>{provider.name}</h3><span><b>★</b> {provider.rating} <small>({provider.reviews})</small></span></div><p>{provider.description}</p><div className="provider-footer"><strong>À partir de {Number(provider.price || 0).toLocaleString('fr-FR')} DT</strong><button className="small-arrow"><Icon name="arrow" size={14} /></button></div></div></article>
}

function Favorites({ setActivePage }) {
  return <><PageTitle eyebrow="Fonctionnalité à venir" title="Mes favoris" /><div className="empty-state phase-placeholder"><Icon name="heart" size={28} /><h3>Vos favoris seront disponibles prochainement</h3><p>Les favoris locaux ne sont pas sauvegardés.</p><button className="primary-button" onClick={() => setActivePage('services')}>Découvrir les services</button></div></>
}

function Profile({ setActivePage }) {
  const { signOut, profile, user, wedding } = useAuth()
  const initial = profile?.full_name?.trim()?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'F'
  const weddingDate = wedding?.wedding_date
    ? new Date(`${wedding.wedding_date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Projet à compléter'
  return <><PageTitle eyebrow="Votre espace personnel" title="Mon profil" /><section className="profile-header content-card"><div className="large-avatar">{initial}</div><div><h2>{profile?.full_name || 'Votre profil'}</h2><p>{user?.email}</p><button className="text-button">Modifier mon profil <Icon name="arrow" size={14} /></button></div></section><div className="profile-menu content-card">{[['calendar', 'Mon projet de mariage', weddingDate], ['wallet', 'Mon budget', `${Number(wedding?.total_budget || 0).toLocaleString('fr-FR')} DT`], ['building', 'Mes services favoris', 'Phase suivante'], ['user', 'Paramètres', 'Préférences et sécurité']].map(([icon, label, meta], index) => <button key={label} onClick={() => index === 1 && setActivePage('budget')}><span className="profile-menu-icon"><Icon name={icon} size={19} /></span><span><strong>{label}</strong><small>{meta}</small></span><Icon name="chevron" size={17} /></button>)}</div><button className="logout-button" onClick={signOut}>Se déconnecter</button></>
}

export default App
