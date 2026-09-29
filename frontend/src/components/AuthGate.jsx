import Icon from './Icon'

const loginBase = import.meta.env.VITE_FRAPPE_LOGIN_URL || 'http://localhost:8001/login'

export default function AuthGate({ connectionError, onRetry }) {
  const separator = loginBase.includes('?') ? '&' : '?'
  const loginUrl = `${loginBase}${separator}redirect-to=${encodeURIComponent(window.location.href)}`

  return (
    <main className="auth-page-container">
      <div className="auth-page-card">
        {/* Left Column: Form & Action */}
        <div className="auth-card-copy">
          <div className="app-wordmark auth-brand">
            <span className="wordmark-symbol">
              <Icon name="truck" size={18} strokeWidth={2.4} />
            </span>
            <div className="wordmark-text">
              <span className="wordmark-name">Logix</span>
              <span className="wordmark-badge">Operations</span>
            </div>
          </div>

          <div className="auth-heading-group">
            <span className="modal-kicker-pill kicker-info">
              <Icon name="shield" size={13} />
              Enterprise Delivery Operations
            </span>
            <h1 className="auth-main-title">
              From Open Order <br />
              to Reconciled Cash.
            </h1>
            <p className="auth-main-desc">
              Plan optimized routes, empower drivers with step-by-step stop navigation, and enforce
              verified cash accountability in one secure operations platform.
            </p>
          </div>

          <div className="auth-action-buttons">
            <a className="button primary large" href={loginUrl}>
              <Icon name="user" size={16} />
              Sign in to Frappe
            </a>
            <button type="button" className="button subtle large" onClick={onRetry}>
              <Icon name="refresh" size={15} />
              Retry Connection
            </button>
          </div>

          {connectionError && (
            <div className="auth-error-banner" role="alert">
              <Icon name="alertCircle" size={16} />
              <span>{connectionError}</span>
            </div>
          )}

          <div className="auth-footer-notice">
            <Icon name="shield" size={13} />
            Role-aware workspace for Dispatchers, Drivers, and Operations Managers.
          </div>
        </div>

        {/* Right Column: Interactive Workflow Visual */}
        <div className="auth-workflow-sidebar">
          <div className="workflow-sidebar-header">
            <span className="workflow-badge">Automated Operational Lifecycle</span>
            <h3>One Auditable Delivery Pipeline</h3>
            <p>Order status automatically synchronizes with driver stop actions.</p>
          </div>

          <div className="workflow-step-cards">
            {[
              {
                num: '01',
                title: 'Intake & Run Planning',
                desc: 'Queue orders by priority and group them within vehicle stop limits.',
                icon: 'package',
              },
              {
                num: '02',
                title: 'Driver Road Execution',
                desc: 'Guide drivers through ordered stops with 1-tap outcome recording.',
                icon: 'navigation',
              },
              {
                num: '03',
                title: 'Cash Reconciliation',
                desc: 'Reconcile collected funds directly to the central vault ledger.',
                icon: 'dollar',
              },
            ].map(step => (
              <div key={step.num} className="workflow-step-card">
                <span className="step-card-num">{step.num}</span>
                <div className="step-card-body">
                  <div className="step-card-header">
                    <Icon name={step.icon} size={15} />
                    <strong>{step.title}</strong>
                  </div>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-sidebar-stat">
            <Icon name="checkCircle" size={16} />
            <span>Cryptographically verified session &amp; server-owned state transitions</span>
          </div>
        </div>
      </div>
    </main>
  )
}
