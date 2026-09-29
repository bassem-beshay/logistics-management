import { useState } from 'react'
import ActionDialog from '../components/ActionDialog'
import Feedback from '../components/Feedback'
import Icon from '../components/Icon'
import StatusBadge from '../components/StatusBadge'
import { DriverRouteVisual } from '../components/VisualFlow'
import { formatNumber, initials } from '../utils'

export default function DriverExperience({ logistics }) {
  const [failureStop, setFailureStop] = useState(null)
  const run = logistics.currentRun
  const stops = run?.delivery_stops || []
  const actionableStops = stops.filter(stop => ['Assigned', 'En Route'].includes(stop.stop_status))
  const nextStop = actionableStops[0]
  const resolved = stops.length > 0 && stops.every(stop => ['Delivered', 'Failed'].includes(stop.stop_status))
  const isEnRoute = run?.run_status === 'En Route'

  const confirmFailure = async reason => {
    const result = await logistics.actions.failStop(run.name, failureStop.name, reason)
    if (result !== false) setFailureStop(null)
  }

  const scrollToStops = () =>
    document.getElementById('driver-stops')?.scrollIntoView({ behavior: 'smooth' })

  const deliveredCount = stops.filter(s => s.stop_status === 'Delivered').length

  return (
    <div className="driver-cockpit-experience">
      {/* Tactical Driver Header */}
      <header className="driver-cockpit-header">
        <div className="header-container">
          <a className="driver-wordmark" href="/driver">
            <span className="driver-wordmark-symbol">
              <Icon name="truck" size={17} strokeWidth={2.4} />
            </span>
            <div className="driver-wordmark-text">
              <strong className="driver-brand-title">Logix Driver</strong>
              <span className="driver-mode-tag">Cockpit</span>
            </div>
          </a>

          <nav className="driver-cockpit-nav" aria-label="Driver Navigation">
            <button
              type="button"
              className="driver-nav-btn is-active"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Icon name="navigation" size={14} />
              Today&apos;s Route
            </button>
            <button
              type="button"
              className="driver-nav-btn"
              onClick={() =>
                document.getElementById('driver-history')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <Icon name="clock" size={14} />
              Run History
            </button>
          </nav>

          <div className="driver-profile-widget">
            <span className="driver-status-online-dot" title="Active on duty" />
            <span className="driver-avatar-circle">
              {initials(logistics.session.full_name || logistics.session.user)}
            </span>
            <div className="driver-profile-info">
              <strong>{logistics.session.full_name || logistics.session.user}</strong>
              <small>Driver Mode</small>
            </div>
          </div>
        </div>
      </header>

      {/* Main Cockpit Content */}
      <main className="driver-cockpit-main">
        <Feedback
          error={logistics.error}
          notice={logistics.notice}
          onDismissError={logistics.clearError}
          onDismissNotice={logistics.clearNotice}
        />

        {/* Hero Banner */}
        <section className="driver-hero-banner">
          <div className="driver-hero-copy">
            <div className="driver-kicker-row">
              <span className="driver-kicker-pill">
                <Icon name="navigation" size={12} />
                Current Assignment
              </span>
              <StatusBadge pulse>{run?.run_status || 'Available'}</StatusBadge>
            </div>

            <h1 className="driver-hero-title">
              {!run
                ? 'You are all clear for now.'
                : isEnRoute
                ? `${actionableStops.length} ${actionableStops.length === 1 ? 'stop' : 'stops'} remaining today.`
                : run.run_status === 'Assigned'
                ? 'Your next route is ready to begin.'
                : 'Today’s route is complete.'}
            </h1>

            <p className="driver-hero-desc">
              {!run
                ? 'New delivery assignments will appear here as soon as dispatch assigns a run to your vehicle.'
                : isEnRoute
                ? 'Navigate to stops in the planned sequence and record cash collections at each stop.'
                : run.run_status === 'Assigned'
                ? 'Review the route stops and parcel details below. Dispatch will initiate your run.'
                : 'All stops have been closed out. Your route record has been submitted for cash settlement.'}
            </p>

            {run && (
              <div className="driver-hero-cta">
                <button
                  type="button"
                  className="button driver-primary large"
                  onClick={scrollToStops}
                >
                  <Icon name={isEnRoute ? 'navigation' : 'truck'} size={16} />
                  {isEnRoute ? 'Go to Active Stop' : 'Review Route Stops'}
                </button>
              </div>
            )}
          </div>

          <div className="driver-hero-visual-col">
            <DriverRouteVisual run={run} stops={stops} />
          </div>
        </section>

        {/* Route Stats Bar */}
        {run && (
          <section className="driver-stats-bar">
            <div className="driver-stat-item">
              <span className="stat-label">Run Reference</span>
              <strong className="stat-value code-text">{run.name}</strong>
            </div>
            <div className="driver-stat-item">
              <span className="stat-label">Total Stops</span>
              <strong className="stat-value">
                {deliveredCount} / {stops.length} delivered
              </strong>
            </div>
            <div className="driver-stat-item">
              <span className="stat-label">Cash Collected</span>
              <strong className="stat-value stat-cash font-tabular">
                ${formatNumber(run.total_cash_collected)}
              </strong>
            </div>
            <div className="driver-stat-item">
              <span className="stat-label">Status</span>
              <strong className="stat-value">
                {isEnRoute ? 'On Route' : run.run_status === 'Assigned' ? 'Awaiting Start' : 'Closed'}
              </strong>
            </div>
          </section>
        )}

        {/* Stops Section */}
        <section className="driver-stops-section" id="driver-stops">
          <div className="driver-section-header">
            <div>
              <span className="driver-kicker-text">Delivery Manifest</span>
              <h2 className="driver-section-title">
                {run ? 'Today’s Delivery Stops' : 'No Active Route'}
              </h2>
            </div>
            {run && (
              <span className="driver-progress-pill">
                <Icon name="checkCircle" size={13} />
                {deliveredCount} of {stops.length} completed
              </span>
            )}
          </div>

          {/* Active Next Stop Spotlight */}
          {nextStop && isEnRoute && (
            <article className="next-stop-spotlight">
              <div className="next-stop-banner-tag">
                <Icon name="navigation" size={12} />
                Next Immediate Stop
              </div>

              <div className="next-stop-body">
                <div className="next-stop-sequence-bubble">{nextStop.stop_sequence}</div>
                <div className="next-stop-details">
                  <h3 className="next-stop-name">{nextStop.customer_name}</h3>
                  <p className="next-stop-address">
                    <Icon name="mapPin" size={15} />
                    {nextStop.address}
                  </p>
                </div>
                <div className="next-stop-cash-box">
                  <span className="cash-box-label">Collect at Door</span>
                  <strong className="cash-box-amount font-tabular">
                    ${formatNumber(nextStop.cash_amount)}
                  </strong>
                </div>
              </div>

              <div className="next-stop-actions">
                <button
                  type="button"
                  className="button driver-primary large"
                  disabled={logistics.busy}
                  onClick={() => logistics.actions.deliverStop(run.name, nextStop.name)}
                >
                  <Icon name="check" size={16} strokeWidth={2.5} />
                  Mark Stop Delivered
                </button>
                <button
                  type="button"
                  className="button driver-secondary large"
                  disabled={logistics.busy}
                  onClick={() => setFailureStop(nextStop)}
                >
                  <Icon name="alertCircle" size={16} />
                  Couldn’t Deliver
                </button>
              </div>
            </article>
          )}

          {/* All Stops List */}
          <div className="driver-stops-container">
            <ol className="driver-stop-list">
              {stops.map(stop => {
                const isCurrent = isEnRoute && stop.name === nextStop?.name
                const isDelivered = stop.stop_status === 'Delivered'
                const isFailed = stop.stop_status === 'Failed'

                return (
                  <li
                    key={stop.name}
                    className={`driver-stop-row ${isCurrent ? 'is-active-stop' : ''} ${isDelivered ? 'is-delivered' : ''} ${isFailed ? 'is-failed' : ''}`}
                  >
                    <div className="driver-seq-indicator">
                      {isDelivered ? (
                        <Icon name="check" size={14} strokeWidth={2.5} />
                      ) : isFailed ? (
                        <Icon name="close" size={14} strokeWidth={2.5} />
                      ) : (
                        <span>{stop.stop_sequence}</span>
                      )}
                    </div>

                    <div className="driver-stop-info">
                      <strong className="driver-stop-customer">{stop.customer_name}</strong>
                      <span className="driver-stop-addr">{stop.address}</span>
                      {stop.failed_reason && (
                        <small className="driver-stop-fail-reason">
                          <Icon name="alertCircle" size={11} />
                          {stop.failed_reason}
                        </small>
                      )}
                    </div>

                    <div className="driver-stop-badge">
                      <StatusBadge>{stop.stop_status}</StatusBadge>
                    </div>

                    <div className="driver-stop-cash font-tabular">
                      ${formatNumber(stop.cash_amount)}
                    </div>

                    {isEnRoute &&
                      stop.stop_status === 'En Route' &&
                      stop.name !== nextStop?.name && (
                        <div className="driver-stop-row-actions">
                          <button
                            type="button"
                            className="driver-inline-btn deliver-btn"
                            onClick={() => logistics.actions.deliverStop(run.name, stop.name)}
                            disabled={logistics.busy}
                          >
                            Delivered
                          </button>
                          <button
                            type="button"
                            className="driver-inline-btn fail-btn"
                            onClick={() => setFailureStop(stop)}
                            disabled={logistics.busy}
                          >
                            Failed
                          </button>
                        </div>
                      )}
                  </li>
                )
              })}
            </ol>

            {!stops.length && (
              <div className="driver-empty-box">
                <Icon name="truck" size={32} />
                <h3>No stops assigned to your vehicle</h3>
                <p>Enjoy your downtime! New routes will populate when dispatch builds a run.</p>
              </div>
            )}
          </div>

          {/* Completion Celebration Bar */}
          {isEnRoute && resolved && (
            <div className="driver-completion-celebration">
              <div className="celebration-left">
                <div className="celebration-icon">
                  <Icon name="checkCircle" size={24} strokeWidth={2.2} />
                </div>
                <div>
                  <strong>All Route Stops Completed!</strong>
                  <span>
                    Total cash collected: <b>${formatNumber(run.total_cash_collected)}</b>. Submit
                    to close the route.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="button driver-primary large"
                disabled={logistics.busy}
                onClick={() => logistics.actions.completeRun(run.name)}
              >
                <Icon name="check" size={16} strokeWidth={2.5} />
                Complete This Run
              </button>
            </div>
          )}
        </section>

        {/* Driver History Section */}
        <section className="driver-history-section" id="driver-history">
          <div className="driver-section-header">
            <div>
              <span className="driver-kicker-text">Past Routes</span>
              <h2 className="driver-section-title">Your Completed Runs</h2>
            </div>
            <span className="driver-progress-pill">{logistics.runs.length} Runs recorded</span>
          </div>

          <div className="driver-history-list">
            {logistics.runs.map(item => (
              <div className="driver-history-row" key={item.name}>
                <div className="history-run-name">
                  <Icon name="truck" size={15} />
                  <span className="code-text">{item.name}</span>
                </div>
                <StatusBadge>{item.run_status}</StatusBadge>
                <div className="history-run-cash font-tabular">
                  ${formatNumber(item.total_cash_collected)} collected
                </div>
              </div>
            ))}

            {!logistics.runs.length && (
              <div className="driver-empty-box">
                <p>No past runs recorded for this driver account yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <ActionDialog
        config={failureStop ? { type: 'failure', stop: failureStop } : null}
        busy={logistics.busy}
        onClose={() => setFailureStop(null)}
        onConfirm={confirmFailure}
      />
    </div>
  )
}
