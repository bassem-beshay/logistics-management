const toneByStatus = {
  Open: 'info',
  Assigned: 'assigned',
  'En Route': 'active',
  Delivered: 'success',
  Completed: 'success',
  Available: 'success',
  Failed: 'danger',
  'Cash Banked': 'settled',
  'On Run': 'active',
  Inactive: 'muted',
  Draft: 'muted',
}

export default function StatusBadge({ children, size = 'default', pulse = false }) {
  const status = children || 'Unknown'
  const tone = toneByStatus[status] || 'muted'
  const shouldPulse = pulse || status === 'En Route' || status === 'On Run'

  return (
    <span className={`status-badge status-badge--${tone} status-badge--${size}`}>
      <span className={`status-dot ${shouldPulse ? 'status-dot--pulse' : ''}`} aria-hidden="true" />
      <span className="status-label">{status}</span>
    </span>
  )
}
