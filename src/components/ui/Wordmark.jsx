export function Flourish({ className = 'wordmark-flourish' }) {
  return (
    <svg className={className} viewBox="0 0 120 12" aria-hidden="true" focusable="false">
      <path d="M2 6 Q 30 0, 60 6 T 118 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ size = 'lg', className = '' }) {
  return (
    <div className={`wordmark wordmark-${size} ${className}`.trim()}>
      <span className="wordmark-primary">Lamsa</span>
      <span className="wordmark-secondary">by Farah</span>
      <Flourish />
    </div>
  )
}
