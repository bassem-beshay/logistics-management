import { useEffect } from 'react'
import Icon from './Icon'
import StatusBadge from './StatusBadge'
import { formatDate, formatNumber } from '../utils'

const stages = ['Assigned', 'En Route', 'Completed', 'Cash Banked']

export default function RunDrawer({
  run,
  permissions,
  busy,
  onClose,
  onStart,
  onDeliver,
  onFail,
  onComplete,
  onBank,
}) {
  useEffect(() => {
    const handleKey = event => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!run) return null
  const stops = run.delivery_stops || []
  const currentStage = stages.indexOf(run.run_status)
  const resolved = stops.length > 0 && stops.every(stop => ['Delivered', 'Failed'].includes(stop.stop_status))

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <aside
        className="drawer run-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-title"
      >
        <header className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-kicker">
              <Icon name="truck" size={13} />
              Delivery Run Manifest
            </span>
            <h2 id="run-title" className="drawer-title">{run.name}</h2>
          </div>
          <button
            type="button"
            className="quiet-icon"
            onClick={onClose}
            aria-label="Close run manifest"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="run-identity-box">
          <div className="run-id-stat">
            <span className="stat-label">Assigned Driver</span>
            <strong className="stat-val">{run.driver}</strong>
          </div>
          <div className="run-id-stat">
            <span className="stat-label">Total Cash Collected</span>
            <strong className="stat-val stat-val--cash">${formatNumber(run.total_cash_collected)}</strong>
          </div>
          <div className="run-id-stat">
            <span className="stat-label">Run Status</span>
            <div>
              <StatusBadge>{run.run_status}</StatusBadge>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="run-stepper-wrap">
          <ol className="run-progress-stepper" aria-label="Run lifecycle stages">
            {stages.map((stage, index) => {
              const isPast = index < currentStage
              const isCurrent = index === currentStage

              return (
                <li
                  key={stage}
                  className={`stepper-step ${isPast ? 'is-complete' : ''} ${isCurrent ? 'is-active' : ''}`}
                >
                  <div className="stepper-node">
                    {isPast ? <Icon name="check" size={11} strokeWidth={2.5} /> : index + 1}
                  </div>
                  <span className="stepper-label">{stage}</span>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Contextual Action Bar */}
        <div className="run-action-bar">
          {permissions.canDispatch && run.run_status === 'Assigned' && (
            <div className="action-banner action-banner--start">
              <div>
                <strong>Route Ready to Start</strong>
                <p>Driver is prepared to begin delivering stops.</p>
              </div>
              <button
                type="button"
                className="button primary"
                disabled={busy}
                onClick={onStart}
              >
                <Icon name="truck" size={15} />
                Start Run
              </button>
            </div>
          )}

          {permissions.canHandleStops && run.run_status === 'En Route' && resolved && (
            <div className="action-banner action-banner--complete">
              <div>
                <strong>All Stops Resolved</strong>
                <p>Every stop has been recorded as delivered or failed.</p>
              </div>
              <button
                type="button"
                className="button primary"
                disabled={busy}
                onClick={onComplete}
              >
                <Icon name="checkCircle" size={15} />
                Complete Run
              </button>
            </div>
          )}

          {permissions.canManage && run.run_status === 'Completed' && (
            <div className="action-banner action-banner--bank">
              <div>
                <strong>${formatNumber(run.total_cash_collected)} Awaiting Settlement</strong>
                <p>Record the physical cash handoff to close this run.</p>
              </div>
              <button
                type="button"
                className="button primary"
                disabled={busy}
                onClick={onBank}
              >
                <Icon name="dollar" size={15} />
                Record Cash Handoff
              </button>
            </div>
          )}

          {run.run_status === 'Cash Banked' && (
            <div className="settled-note-card">
              <Icon name="checkCircle" size={18} className="settled-icon" />
              <div>
                <strong>Cash Settled and Reconciled</strong>
                <p>
                  Banked at: <b>{run.cash_banked_location || 'Central Vault'}</b> on{' '}
                  {formatDate(run.cash_banked_date)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stops Manifest */}
        <section className="manifest-section">
          <div className="manifest-header">
            <div>
              <span className="manifest-kicker">Ordered Stops</span>
              <h3 className="manifest-title">
                {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'} on Route
              </h3>
            </div>
            <span className="manifest-timing">
              {run.started_date ? `Started ${formatDate(run.started_date)}` : 'Not started yet'}
            </span>
          </div>

          <ol className="stop-timeline-list">
            {stops.map(stop => {
              const isDelivered = stop.stop_status === 'Delivered'
              const isFailed = stop.stop_status === 'Failed'
              const isEnRoute = stop.stop_status === 'En Route'

              return (
                <li
                  key={stop.name}
                  className={`stop-timeline-item ${isDelivered ? 'is-delivered' : ''} ${isFailed ? 'is-failed' : ''}`}
                >
                  <div className="stop-sequence-bubble">
                    {isDelivered ? (
                      <Icon name="check" size={13} strokeWidth={2.5} />
                    ) : isFailed ? (
                      <Icon name="close" size={13} strokeWidth={2.5} />
                    ) : (
                      stop.stop_sequence
                    )}
                  </div>

                  <div className="stop-detail-card">
                    <div className="stop-card-head">
                      <div>
                        <strong className="stop-customer-name">{stop.customer_name}</strong>
                        <p className="stop-address-text">{stop.address}</p>
                      </div>
                      <StatusBadge>{stop.stop_status}</StatusBadge>
                    </div>

                    <div className="stop-card-meta">
                      <span className="stop-cash-tag">
                        Cash to Collect: <b>${formatNumber(stop.cash_amount)}</b>
                      </span>
                      {stop.failed_reason && (
                        <span className="stop-failure-reason">
                          <Icon name="alertCircle" size={12} />
                          {stop.failed_reason}
                        </span>
                      )}
                    </div>

                    {permissions.canHandleStops && isEnRoute && (
                      <div className="stop-action-row">
                        <button
                          type="button"
                          className="button primary small"
                          disabled={busy}
                          onClick={() => onDeliver(stop)}
                        >
                          <Icon name="check" size={13} />
                          Mark Delivered
                        </button>
                        <button
                          type="button"
                          className="button subtle small"
                          disabled={busy}
                          onClick={() => onFail(stop)}
                        >
                          <Icon name="alertCircle" size={13} />
                          Couldn’t Deliver
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>

          {!stops.length && (
            <div className="empty-stops-box">
              <Icon name="package" size={24} />
              <p>No stops assigned to this run yet.</p>
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}
