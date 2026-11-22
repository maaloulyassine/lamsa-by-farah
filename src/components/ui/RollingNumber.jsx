// A number that rolls in (like a mechanical counter) each time its value changes.
export function RollingNumber({ value, pad = 0, testId }) {
  const text = typeof value === 'number' ? String(value).padStart(pad, '0') : String(value)
  return (
    <span className="rolling-number" data-testid={testId}>
      <span key={text} className="rolling-number-value">{text}</span>
    </span>
  )
}
