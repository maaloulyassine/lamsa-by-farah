import { monogramLetters } from '../../utils/monogram'

// Couple monogram « S&K » (or a single initial), engraved-seal style. Decorative: the parent carries the label.
export function Monogram({ name, fallback = '', className = '' }) {
  const [first, second] = monogramLetters(name, fallback)
  return (
    <span className={`monogram ${second ? 'is-pair' : ''} ${className}`.trim()} aria-hidden="true">
      {first}
      {second && <><span className="monogram-amp">&amp;</span>{second}</>}
    </span>
  )
}
