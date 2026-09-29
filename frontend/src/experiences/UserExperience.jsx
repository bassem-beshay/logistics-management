import { useMemo, useState } from 'react'
import CreateOrderDialog from '../components/CreateOrderDialog'
import Feedback from '../components/Feedback'
import Icon from '../components/Icon'
import OrderDrawer from '../components/OrderDrawer'
import StatusBadge from '../components/StatusBadge'
import { CustomerHistoryVisual, CustomerJourneyVisual } from '../components/VisualFlow'
import { formatDate, formatNumber, initials } from '../utils'

export default function UserExperience({ logistics }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const sortedOrders = useMemo(
    () =>
      [...logistics.orders].sort((a, b) =>
        String(b.created_date || '').localeCompare(String(a.created_date || '')),
      ),
    [logistics.orders],
  )

  const activeOrder =
    sortedOrders.find(order => !['Cash Banked', 'Delivered', 'Failed'].includes(order.status)) ||
    sortedOrders[0]

  async function openOrder(order) {
    try {
      setSelectedOrder(await logistics.getOrder(order.name))
    } catch (reason) {
      logistics.reportError(reason.message || 'Unable to open delivery details.')
    }
  }

  return (
    <div className="user-portal-experience">
      {/* Customer Header */}
      <header className="user-portal-header">
        <div className="header-container">
          <a className="app-wordmark" href="/user">
            <span className="wordmark-symbol">
              <Icon name="package" size={17} strokeWidth={2.2} />
            </span>
            <div className="wordmark-text">
              <span className="wordmark-name">Logix</span>
              <span className="wordmark-badge user-badge">Customer</span>
            </div>
          </a>

          <nav className="user-portal-nav" aria-label="Portal Navigation">
            <a href="#current" className="portal-nav-link">
              <Icon name="truck" size={14} />
              Current Journey
            </a>
            <a href="#history" className="portal-nav-link">
              <Icon name="calendar" size={14} />
              Delivery History
            </a>
          </nav>

          <div className="user-portal-actions">
            <button
              type="button"
              className="button primary"
              onClick={() => setCreateOpen(true)}
            >
              <Icon name="plus" size={15} />
              Request a Delivery
            </button>
            <div
              className="user-profile-widget"
              title={`Signed in as ${logistics.session.full_name || logistics.session.user}`}
            >
              <span className="user-avatar-badge">
                {initials(logistics.session.full_name || logistics.session.user)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Portal View */}
      <main className="user-portal-main">
        <Feedback
          error={logistics.error}
          notice={logistics.notice}
          onDismissError={logistics.clearError}
          onDismissNotice={logistics.clearNotice}
        />

        {/* Hero & Journey Stepper */}
        <section className="user-portal-hero" id="current">
          <div className="user-hero-copy">
            <div className="user-kicker-pill">
              <Icon name="truck" size={13} />
              Seamless Delivery Tracking
            </div>
            <h1 className="user-hero-title">
              Request, Follow, &amp; Receive with Peace of Mind.
            </h1>
            <p className="user-hero-subtitle">
              Book a new delivery in moments, follow your driver’s route step-by-step in real time,
              and receive verified cash confirmation.
            </p>
            <div className="user-hero-actions">
              <button
                type="button"
                className="button primary large"
                onClick={() => setCreateOpen(true)}
              >
                <Icon name="plus" size={16} />
                Request a Delivery
              </button>
              {activeOrder && (
                <button
                  type="button"
                  className="button subtle large"
                  onClick={() => openOrder(activeOrder)}
                >
                  View Active Order
                </button>
              )}
            </div>
          </div>

          <div className="user-hero-visual-col">
            <CustomerJourneyVisual order={activeOrder} />
          </div>
        </section>

        {/* Current Active Order Spotlight */}
        {activeOrder && (
          <section className="portal-section active-order-section">
            <div className="portal-section-header">
              <div>
                <span className="portal-kicker">Live Shipment</span>
                <h2 className="portal-section-title">Current Delivery Spotlight</h2>
              </div>
              <StatusBadge pulse>{activeOrder.status}</StatusBadge>
            </div>

            <div className="active-order-spotlight-card">
              <div className="spotlight-left">
                <div className="spotlight-recipient-box">
                  <span className="spotlight-label">Delivering To</span>
                  <strong className="spotlight-customer">{activeOrder.customer_name}</strong>
                  <p className="spotlight-address">
                    <Icon name="mapPin" size={14} />
                    {activeOrder.address}
                  </p>
                </div>
              </div>

              <div className="spotlight-center">
                <div className="spotlight-meta-grid">
                  <div>
                    <span className="spotlight-meta-label">Order Reference</span>
                    <strong className="spotlight-meta-val code-text">{activeOrder.name}</strong>
                  </div>
                  <div>
                    <span className="spotlight-meta-label">Date Requested</span>
                    <strong className="spotlight-meta-val font-tabular">
                      {formatDate(activeOrder.created_date)}
                    </strong>
                  </div>
                  <div>
                    <span className="spotlight-meta-label">Cash on Delivery</span>
                    <strong className="spotlight-meta-val money-text">
                      ${formatNumber(activeOrder.cash_amount)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="spotlight-right">
                <button
                  type="button"
                  className="button subtle"
                  onClick={() => openOrder(activeOrder)}
                >
                  Order Details
                  <Icon name="chevronRight" size={14} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Past Deliveries History */}
        <section className="portal-section" id="history">
          <div className="portal-section-header">
            <div>
              <span className="portal-kicker">Shipment History</span>
              <h2 className="portal-section-title">Your Deliveries</h2>
            </div>
            <span className="portal-history-count">
              {sortedOrders.length} {sortedOrders.length === 1 ? 'record' : 'records'} total
            </span>
          </div>

          <CustomerHistoryVisual />

          <div className="portal-order-list">
            {sortedOrders.map(order => (
              <button
                type="button"
                key={order.name}
                className="portal-order-item"
                onClick={() => openOrder(order)}
              >
                <div className="portal-order-date font-tabular">
                  <Icon name="calendar" size={13} />
                  {formatDate(order.created_date)}
                </div>
                <div className="portal-order-main">
                  <strong className="portal-order-customer">{order.customer_name}</strong>
                  <span className="portal-order-address">{order.address}</span>
                </div>
                <div className="portal-order-status">
                  <StatusBadge>{order.status}</StatusBadge>
                </div>
                <div className="portal-order-cash font-tabular">
                  ${formatNumber(order.cash_amount)}
                </div>
                <div className="portal-order-arrow">
                  <Icon name="chevronRight" size={15} />
                </div>
              </button>
            ))}

            {!sortedOrders.length && (
              <div className="portal-empty-card">
                <Icon name="package" size={32} />
                <h3>No deliveries requested yet</h3>
                <p>Submit your first delivery request and monitor live status here.</p>
                <button
                  type="button"
                  className="button primary"
                  onClick={() => setCreateOpen(true)}
                >
                  <Icon name="plus" size={15} />
                  Request a Delivery
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <CreateOrderDialog
        open={createOpen}
        audience="user"
        busy={logistics.busy}
        onClose={() => setCreateOpen(false)}
        onSubmit={logistics.actions.createOrder}
      />

      <OrderDrawer
        order={selectedOrder}
        audience="user"
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
