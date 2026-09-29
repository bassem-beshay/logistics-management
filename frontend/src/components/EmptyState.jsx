import Icon from './Icon'

function Illustration({ type }) {
  if (type === 'orders') {
    return (
      <div className="empty-illustration-wrapper" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" fill="#fcf1d1" stroke="#1c3670" strokeWidth="2" />
          <rect x="26" y="24" width="28" height="34" rx="4" fill="#ffffff" stroke="#051540" strokeWidth="2" />
          <path d="M34 20h12a2 2 0 0 1 2 2v2H32v-2a2 2 0 0 1 2-2Z" fill="#1c3670" />
          <line x1="32" y1="33" x2="48" y2="33" stroke="#1c3670" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="40" x2="44" y2="40" stroke="#1c3670" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="47" x2="40" y2="47" stroke="#1c3670" strokeWidth="2" strokeLinecap="round" />
          <circle cx="52" cy="50" r="10" fill="#051540" />
          <path d="M49 50l2 2 4-4" stroke="#fcf1d1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  if (type === 'runs') {
    return (
      <div className="empty-illustration-wrapper" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" fill="#fcf1d1" stroke="#051540" strokeWidth="2" />
          <path d="M22 46h36" stroke="#1c3670" strokeWidth="2" strokeDasharray="3 3" />
          <rect x="24" y="32" width="22" height="15" rx="2" fill="#ffffff" stroke="#051540" strokeWidth="2" />
          <path d="M46 37h7l5 5v5h-12v-10Z" fill="#ffffff" stroke="#051540" strokeWidth="2" />
          <circle cx="31" cy="48" r="3.5" fill="#000133" />
          <circle cx="51" cy="48" r="3.5" fill="#000133" />
          <circle cx="40" cy="24" r="5" fill="#1c3670" />
          <path d="M40 29v3" stroke="#1c3670" strokeWidth="2" />
        </svg>
      </div>
    )
  }

  if (type === 'drivers') {
    return (
      <div className="empty-illustration-wrapper" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" fill="#fcf1d1" stroke="#1c3670" strokeWidth="2" />
          <circle cx="40" cy="34" r="9" fill="#ffffff" stroke="#051540" strokeWidth="2" />
          <path d="M26 53c0-6 6.3-10 14-10s14 4 14 10" stroke="#051540" strokeWidth="2" strokeLinecap="round" />
          <circle cx="52" cy="28" r="7" fill="#1c3670" />
          <path d="M50 28h4M52 26v4" stroke="#fcf1d1" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (type === 'search') {
    return (
      <div className="empty-illustration-wrapper" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" fill="#fcf1d1" stroke="#051540" strokeWidth="2" />
          <circle cx="37" cy="37" r="12" fill="#ffffff" stroke="#1c3670" strokeWidth="2" />
          <path d="M46 46l8 8" stroke="#000133" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="33" y1="37" x2="41" y2="37" stroke="#1c3670" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className="empty-illustration-wrapper" aria-hidden="true">
      <div className="empty-icon-bubble">
        <Icon name="package" size={32} />
      </div>
    </div>
  )
}

export default function EmptyState({
  title,
  description,
  action,
  type = 'default',
  compact = false,
}) {
  return (
    <div className={`empty-state ${compact ? 'empty-state--compact' : ''}`}>
      <Illustration type={type} />
      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        {description && <p className="empty-state-description">{description}</p>}
      </div>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
