// Thin hand-drawn underline used by the wordmark, the welcome slogans and section titles.
export function Flourish({ className = 'wordmark-flourish' }) {
  return (
    <svg className={className} viewBox="0 0 120 12" aria-hidden="true" focusable="false">
      <path d="M2 6 Q 30 0, 60 6 T 118 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}
