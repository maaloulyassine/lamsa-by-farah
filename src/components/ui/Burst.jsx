// Small celebratory particle burst (CSS-animated, decorative only).
// variant "confetti": terracotta / gold paper bits; variant "hearts": soft rose dots.
const PALETTES = {
  confetti: ['#a97b63', '#d7b08c', '#c9a227', '#e8c9b5', '#715340'],
  hearts: ['#a95f5c', '#d98b86', '#ead9ce'],
}

function makePieces(variant, count) {
  const palette = PALETTES[variant] || PALETTES.confetti
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (variant === 'confetti' ? (i % 2) * 0.35 : 0)
    const distance = variant === 'confetti' ? 22 + (i % 3) * 7 : 17 + (i % 2) * 4
    return {
      x: Math.round(Math.cos(angle) * distance),
      y: Math.round(Math.sin(angle) * distance) - (variant === 'confetti' ? 6 : 0),
      r: (i * 47) % 360,
      c: palette[i % palette.length],
    }
  })
}

const PIECES = { confetti: makePieces('confetti', 12), hearts: makePieces('hearts', 8) }

export function Burst({ variant = 'confetti' }) {
  const pieces = PIECES[variant] || PIECES.confetti
  return (
    <span className={`burst burst-${variant}`} aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--r': `${p.r}deg`, '--c': p.c }} />
      ))}
    </span>
  )
}
