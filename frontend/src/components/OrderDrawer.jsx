import { useEffect } from 'react'
import Icon from './Icon'
import StatusBadge from './StatusBadge'
import { formatDate, formatNumber } from '../utils'

export default function OrderDrawer({ order, audience = 'admin', onClose }) {
  useEffect(() => {
    const handleKey = event => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!order) return null

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <aside
        className="drawer narrow-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
      >
        <header className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-kicker">
              <Icon name="package" size={13} />
              {audience === 'user' ? 'Your Delivery' : 'Order Record'}
            </span>
            <h2 id="order-title" className="drawer-title">{order.name}</h2>
          </div>
          <button
            type="button"
            className="quiet-icon"
            onClick={onClose}
            aria-label="Close order details"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="drawer-lead-card">
          <div className="drawer-lead-status">
            <span className="lead-label">Delivery Lifecycle</span>
            <StatusBadge>{order.status}</StatusBadge>
          </div>
          <div className="drawer-lead-cash">
            <span className="lead-cash-label">Cash to Collect (COD)</span>
            <strong className="lead-cash-amount">${formatNumber(order.cash_amount)}</strong>
          </div>
        </div>

        <div className="drawer-section-title">
          <span>Customer & Destination</span>
        </div>

        <div className="drawer-card-box">
          <div className="card-box-row">
            <Icon name="user" size={16} className="card-row-icon" />
            <div>
              <strong className="card-row-title">{order.customer_name}</strong>
              {order.customer_phone ? (
                <a href={`tel:${order.customer_phone}`} className="phone-action-link">
                  <Icon name="phone" size={12} />
                  {order.customer_phone}
                </a>
              ) : (
                <span className="card-row-sub">No phone provided</span>
              )}
            </div>
          </div>

          <div className="card-box-row" style={{ marginTop: '12px' }}>
            <Icon name="mapPin" size={16} className="card-row-icon" />
            <div>
              <span className="card-row-sub">Delivery Address</span>
              <strong className="card-row-address">{order.address}</strong>
            </div>
          </div>
        </div>

        <div className="drawer-section-title">
          <span>Operations & Assignment</span>
        </div>

        <dl className="details-list">
          <div>
            <dt>Order Priority</dt>
            <dd>
              <span className={`priority-pill priority-${order.priority?.toLowerCase()}`}>
                {order.priority || 'Standard'} Priority
              </span>
            </dd>
          </div>
          {audience !== 'user' && (
            <div>
              <dt>Assigned Driver</dt>
              <dd>{order.assigned_driver || 'Unassigned'}</dd>
            </div>
          )}
          {audience !== 'user' && (
            <div>
              <dt>Delivery Run</dt>
              <dd className="code-text">{order.delivery_run || 'None'}</dd>
            </div>
          )}
          <div>
            <dt>Created Timestamp</dt>
            <dd>{formatDate(order.created_date)}</dd>
          </div>
          <div>
            <dt>Delivered Timestamp</dt>
            <dd>{formatDate(order.delivered_date)}</dd>
          </div>
        </dl>

        <div className="drawer-footer-actions">
          <button type="button" className="button subtle full" onClick={onClose}>
            Close Details
          </button>
        </div>
      </aside>
    </div>
  )
}
