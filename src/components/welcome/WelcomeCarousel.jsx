import { useCallback, useEffect, useRef, useState } from 'react'
import { Flourish } from '../ui/Flourish'
import { Wordmark } from '../ui/Wordmark'

const BASE = import.meta.env.BASE_URL

// position: horizontal focus point so the subject stays visible when a portrait screen crops the 16:9 photo
const SLIDES = [
  { image: `${BASE}images/welcome/slide-1.webp`, position: '35% 50%', kb: ['-2%', '-1.5%'], slogan: 'Votre mariage, votre signature.' },
  { image: `${BASE}images/welcome/slide-2.webp`, position: '58% 50%', kb: ['2%', '1%'], slogan: 'L’élégance dans chaque détail.' },
  { image: `${BASE}images/welcome/slide-3.webp`, position: '35% 50%', kb: ['-1.5%', '1.5%'], slogan: 'Des souvenirs qui vous ressemblent.' },
  { image: `${BASE}images/welcome/slide-4.webp`, position: '50% 50%', kb: ['0%', '-2%'], slogan: 'L’art de célébrer l’amour.' },
  { image: `${BASE}images/welcome/slide-5.webp`, position: '30% 50%', kb: ['2%', '-1%'], slogan: 'Votre histoire commence ici.' },
]

const ROTATE_MS = 6000
const PAUSE_MS = 30000
const SWIPE_PX = 50

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return undefined
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function WelcomeCarousel({ children }) {
  // prev = the slide fading out, so its slow zoom keeps running during the cross-fade
  const [slide, setSlide] = useState({ current: 0, prev: null })
  const current = slide.current
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const pauseTimer = useRef(null)
  const touchStartX = useRef(null)
  const count = SLIDES.length

  // Auto-rotate unless paused or the user prefers reduced motion
  useEffect(() => {
    if (paused || reducedMotion) return undefined
    const id = setInterval(() => setSlide((s) => ({ current: (s.current + 1) % count, prev: s.current })), ROTATE_MS)
    return () => clearInterval(id)
  }, [paused, reducedMotion, count])

  useEffect(() => () => clearTimeout(pauseTimer.current), [])

  // Preload the next two images
  useEffect(() => {
    for (const step of [1, 2]) {
      const img = new Image()
      img.src = SLIDES[(current + step) % count].image
    }
  }, [current, count])

  const pause = useCallback(() => {
    setPaused(true)
    clearTimeout(pauseTimer.current)
    pauseTimer.current = setTimeout(() => setPaused(false), PAUSE_MS)
  }, [])

  const goTo = useCallback((index) => {
    const target = ((index % count) + count) % count
    setSlide((s) => (s.current === target ? s : { current: target, prev: s.current }))
    pause()
  }, [count, pause])
  const next = () => goTo(current + 1)
  const prev = () => goTo(current - 1)

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); next() }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); prev() }
  }
  const onTouchStart = (event) => { touchStartX.current = event.changedTouches[0].clientX }
  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const dx = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (dx <= -SWIPE_PX) next()
    else if (dx >= SWIPE_PX) prev()
  }

  return (
    <section
      className={`welcome-carousel ${reducedMotion ? 'is-reduced-motion' : ''}`.trim()}
      aria-roledescription="carousel"
      aria-label="Bienvenue sur Lamsa"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      data-current={current}
      data-paused={paused || reducedMotion ? 'true' : 'false'}
    >
      {SLIDES.map((item, i) => (
        <div
          key={item.image}
          className={`welcome-slide ${i === current ? 'is-active' : ''} ${i === current || i === slide.prev ? 'kb-run' : ''}`.replace(/\s+/g, ' ').trim()}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} sur ${count}`}
          aria-hidden={i !== current}
        >
          <div className="welcome-slide-image" style={{ backgroundImage: `url(${item.image})`, backgroundPosition: item.position, '--kb-x': item.kb[0], '--kb-y': item.kb[1] }} />
          <div className="welcome-slide-overlay" />
          <div className="welcome-slide-content">
            <Wordmark size="lg" />
            <p className="welcome-slogan">{item.slogan}</p>
            <Flourish className="welcome-flourish" />
          </div>
        </div>
      ))}

      <button type="button" className="welcome-arrow welcome-arrow-prev" onClick={prev} aria-label="Slide précédent">‹</button>
      <button type="button" className="welcome-arrow welcome-arrow-next" onClick={next} aria-label="Slide suivant">›</button>

      <div className="welcome-cta-wrapper">{children}</div>

      <div className="welcome-dots">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            className={`welcome-dot ${i === current ? 'is-active' : ''}`.trim()}
            onClick={() => goTo(i)}
            aria-label={`Aller au slide ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
