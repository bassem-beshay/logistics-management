import { useState } from 'react'
import { NAV_ITEMS } from '../constants'
import { initials, logisticsRole } from '../utils'
import Icon from './Icon'

const NAV_ICONS = {
  dashboard: 'barChart',
  orders: 'package',
  runs: 'truck',
  drivers: 'users',
}

export default function AppShell({
  tab,
  navigation,
  session,
  busy,
  onNavigate,
  onRefresh,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = item => {
    onNavigate(item)
    setMenuOpen(false)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <a
            className="app-wordmark"
            href="#"
            onClick={event => {
              event.preventDefault()
              navigate(navigation[0])
            }}
            aria-label="Logix Operations"
          >
            <span className="wordmark-symbol">
              <Icon name="truck" size={17} strokeWidth={2.2} />
            </span>
            <div className="wordmark-text">
              <span className="wordmark-name">Logix</span>
              <span className="wordmark-badge">Ops</span>
            </div>
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map(item => (
              <button
                type="button"
                key={item}
                className={`nav-tab-btn ${tab === item ? 'is-active' : ''}`}
                onClick={() => navigate(item)}
              >
                <Icon name={NAV_ICONS[item] || 'arrow'} size={15} />
                <span>{NAV_ITEMS[item]}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="header-tools">
          <div className="live-status-pill" title="Operations sync status">
            <span className="live-status-dot" />
            <span className="live-status-text">Live Ops</span>
          </div>

          <button
            type="button"
            className={`tool-icon-btn ${busy ? 'is-spinning' : ''}`}
            onClick={onRefresh}
            disabled={busy}
            title="Refresh operations data"
            aria-label="Refresh operations"
          >
            <Icon name="refresh" size={16} />
          </button>

          <div className="user-profile-widget" title={`Signed in as ${session.user}`}>
            <span className="user-avatar-badge">
              {initials(session.full_name || session.user)}
            </span>
            <div className="user-profile-meta">
              <strong className="user-profile-name">
                {session.full_name || session.user}
              </strong>
              <small className="user-profile-role">
                {logisticsRole(session.roles || [])}
              </small>
            </div>
          </div>

          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="mobile-nav-backdrop"
          onMouseDown={event => event.target === event.currentTarget && setMenuOpen(false)}
        >
          <nav className="mobile-nav-drawer" aria-label="Mobile navigation">
            <div className="mobile-nav-header">
              <div className="app-wordmark">
                <span className="wordmark-symbol">
                  <Icon name="truck" size={16} />
                </span>
                <span className="wordmark-name">Logix Operations</span>
              </div>
              <button
                type="button"
                className="tool-icon-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="mobile-nav-links">
              {navigation.map(item => (
                <button
                  type="button"
                  key={item}
                  className={`mobile-nav-link ${tab === item ? 'is-active' : ''}`}
                  onClick={() => navigate(item)}
                >
                  <Icon name={NAV_ICONS[item] || 'arrow'} size={18} />
                  <span>{NAV_ITEMS[item]}</span>
                </button>
              ))}
            </div>

            <div className="mobile-profile-card">
              <span className="user-avatar-badge">
                {initials(session.full_name || session.user)}
              </span>
              <div>
                <strong>{session.full_name || session.user}</strong>
                <small>{logisticsRole(session.roles || [])}</small>
              </div>
            </div>
          </nav>
        </div>
      )}

      <main className="app-main-content">{children}</main>
    </div>
  )
}
