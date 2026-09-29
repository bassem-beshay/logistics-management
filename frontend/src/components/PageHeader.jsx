export default function PageHeader({
  kicker,
  title,
  description,
  actions,
  badge,
  className = '',
}) {
  return (
    <header className={`page-header ${className}`}>
      <div className="page-header-main">
        {kicker && (
          <div className="page-header-kicker-row">
            <span className="page-kicker">{kicker}</span>
            {badge && <span className="page-header-badge">{badge}</span>}
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}
