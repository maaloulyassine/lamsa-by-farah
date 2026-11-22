import { Fragment } from 'react'
import { coupleParts } from '../../utils/monogram'
import { Flourish } from '../ui/Flourish'
import { Monogram } from '../ui/Monogram'

// « Faire-part vivant »: time-aware salutation, the couple's names set like an engraved invitation
// (letters rising one by one, oversized calligraphic ampersand), a countdown sentence that changes with
// the date, and a rotating seal with the couple's monogram (opens the profile).
function salutation(date) {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Bonjour'
  if (h >= 12 && h < 18) return 'Bon après-midi'
  if (h >= 18 && h < 23) return 'Bonsoir'
  return 'Douce nuit'
}

function isoDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function countdownLine(weddingDateIso, daysLeft, now) {
  if (!weddingDateIso) return { lead: 'Votre histoire commence ici', count: null, tail: '' }
  const today = isoDay(now)
  if (weddingDateIso === today) return { lead: 'C’est le grand jour', count: null, tail: '' }
  if (weddingDateIso < today) return { lead: 'Félicitations aux jeunes mariés', count: null, tail: '' }
  // Calendar days (J-n counts dates, not full 24 h periods like the countdown card)
  const [y1, m1, d1] = today.split('-').map(Number), [y2, m2, d2] = weddingDateIso.split('-').map(Number)
  const days = Math.max(1, Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000) || daysLeft || 1)
  if (days === 1) return { lead: 'C’est demain', count: null, tail: '' }
  if (days <= 30) return { lead: 'Le compte à rebours est lancé :', count: `J-${days}`, tail: '' }
  return { lead: 'Plus que', count: String(days), tail: 'jours avant votre grand jour' }
}

// Letters wrapped per word so long names still wrap between words.
function Letters({ text, offset = 0 }) {
  let index = offset
  return text.split(' ').map((word, w, words) => (
    <Fragment key={`${word}-${w}`}>
      <span className="greet-word">
        {[...word].map((char) => <span className="greet-letter" style={{ '--d': index++ }} key={index}>{char}</span>)}
      </span>
      {w < words.length - 1 && ' '}
    </Fragment>
  ))
}

export function DashboardGreeting({ now, coupleName, fallbackName, weddingDateIso, weddingDateLabel, daysLeft, onOpenProfile }) {
  const hello = salutation(now)
  const parts = coupleParts(coupleName || fallbackName || '')
  const fullName = parts.length ? parts.join(' & ') : 'à vous'
  const line = countdownLine(weddingDateIso, daysLeft, now)
  const dateLine = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  const ring = `${fullName.toLocaleUpperCase('fr-FR')} · ${weddingDateIso ? weddingDateLabel.toLocaleUpperCase('fr-FR') : 'LAMSA BY FARAH'} · `

  return (
    <header className="greeting">
      <div className="greeting-head">
        <p className="eyebrow greeting-eyebrow">{dateLine}</p>
        <p className="greeting-salutation" aria-hidden="true">{hello},</p>
      </div>

      <h1 className="greeting-names" aria-label={`${hello}, ${fullName}`}>
        <span aria-hidden="true">
          {parts.length === 2 ? (
            <>
              <Letters text={parts[0]} />
              <span className="greet-amp">&amp;</span>
              <Letters text={parts[1]} offset={parts[0].length + 2} />
            </>
          ) : <Letters text={fullName} />}
        </span>
      </h1>
      <Flourish className="title-flourish greeting-flourish" />

      <p className="greeting-line">
        {line.lead}
        {line.count && <> <span className="greeting-count">{line.count}</span></>}
        {line.tail && <> {line.tail}</>}
        <span className="greeting-star" aria-hidden="true"> ✦</span>
      </p>

      <button type="button" className="greeting-seal" onClick={onOpenProfile} aria-label={`Mon profil — ${fullName}`}>
        <svg className="seal-ring" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
          <defs><path id="seal-circle" d="M60 60 m -47 0 a 47 47 0 1 1 94 0 a 47 47 0 1 1 -94 0" /></defs>
          <text><textPath href="#seal-circle" textLength="295" lengthAdjust="spacingAndGlyphs">{ring}</textPath></text>
        </svg>
        <span className="seal-core"><Monogram name={coupleName} fallback={fallbackName} /></span>
      </button>
    </header>
  )
}
