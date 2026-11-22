import { Flourish } from './Flourish'

export function Wordmark({ size = 'lg', className = '' }) {
  return (
    <div className={`wordmark wordmark-${size} ${className}`.trim()}>
      <span className="wordmark-primary">Lamsa</span>
      <span className="wordmark-secondary">by Farah</span>
      <Flourish />
    </div>
  )
}
