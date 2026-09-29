import Icon from './Icon'
import { initials } from '../utils'

const deskBase = import.meta.env.VITE_FRAPPE_DESK_URL || 'http://localhost:8001/app'

export default function AccessDenied({ session = {}, onRetry }) {
  return (
    <main className="access-page-container">
      <div className="access-panel-card">
        <div className="app-wordmark" style={{ marginBottom: '28px' }}>
          <span className="wordmark-symbol">
            <Icon name="truck" size={17} strokeWidth={2.4} />
          </span>
          <span className="wordmark-name">Logix Operations</span>
        </div>

        <div className="access-avatar-circle">
          {initials(session.full_name || session.user)}
        </div>

        <span className="modal-kicker-pill kicker-warning" style={{ marginTop: '20px' }}>
          <Icon name="alertCircle" size={13} />
          Role Permission Required
        </span>

        <h1 className="access-panel-title">No Logistics Role Assigned</h1>

        <p className="access-panel-desc">
          Your account (<b>{session.user || 'Unknown'}</b>) is currently authenticated, but has not
          yet been granted a role for <b>Logistics Manager</b>, <b>Logistics Dispatcher</b>, or{' '}
          <b>Logistics Driver</b>.
        </p>

        <div className="access-roles-guide">
          <div className="role-guide-item">
            <Icon name="shield" size={14} />
            <div>
              <strong>Logistics Manager</strong>
              <span>Full operations overview, driver management, route dispatching &amp; cash banking.</span>
            </div>
          </div>
          <div className="role-guide-item">
            <Icon name="package" size={14} />
            <div>
              <strong>Logistics Dispatcher</strong>
              <span>Customer order request intake and shipment delivery tracking.</span>
            </div>
          </div>
          <div className="role-guide-item">
            <Icon name="truck" size={14} />
            <div>
              <strong>Logistics Driver</strong>
              <span>Mobile-first stop navigation, delivery handoffs, and route completion.</span>
            </div>
          </div>
        </div>

        <div className="access-panel-actions">
          <a className="button primary large" href={deskBase}>
            <Icon name="shield" size={15} />
            Open Frappe Desk
          </a>
          <button type="button" className="button subtle large" onClick={onRetry}>
            <Icon name="refresh" size={15} />
            Recheck Roles
          </button>
        </div>
      </div>
    </main>
  )
}
