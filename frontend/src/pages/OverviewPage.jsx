import Icon from '../components/Icon'
import RunTable from '../components/RunTable'
import { AdminOperationsPipeline } from '../components/VisualFlow'
import { formatNumber } from '../utils'

const priorityWeight = { High: 0, Medium: 1, Low: 2 }

export default function OverviewPage({
  dashboard = {},
  orders = [],
  drivers = [],
  runs = [],
  onCreateOrder,
  onPlanRun,
  onNavigate,
  onOpenOrder,
  onOpenRun,
}) {
  const openOrders = orders
    .filter(order => order.status === 'Open')
    .sort((a, b) => (priorityWeight[a.priority] ?? 9) - (priorityWeight[b.priority] ?? 9))

  const availableDrivers = drivers.filter(driver => driver.active && driver.status === 'Available')
  const activeRuns =
    dashboard.active_runs || runs.filter(run => ['Assigned', 'En Route'].includes(run.run_status))
  const exceptions = orders.filter(order => order.status === 'Failed').length

  const flow = [
    ['Open', orders.filter(order => order.status === 'Open').length, 'Awaiting dispatch'],
    ['Assigned', orders.filter(order => order.status === 'Assigned').length, 'Run prepared'],
    ['En route', orders.filter(order => order.status === 'En Route').length, 'On delivery route'],
    ['Settled', orders.filter(order => order.status === 'Cash Banked').length, 'Cash reconciled'],
  ]

  const totalCashToday = Number(dashboard.cash_collected_today || 0)

  return (
    <div className="overview-page">
      {/* Operations Command Banner */}
      <section className="command-hero">
        <div className="command-hero-copy">
          <div className="command-kicker-row">
            <span className="command-kicker-pill">
              <Icon name="barChart" size={13} />
              Operations Command
            </span>
            <span className="command-date-pill">Today&apos;s Dispatch</span>
          </div>
          <h1 className="command-hero-title">
            Logistics Operations &amp; Route Management
          </h1>
          <p className="command-hero-sub">
            Monitor real-time order intake, assign fleet capacity, guide drivers through each stop,
            and reconcile cash collections in one unified operational ledger.
          </p>
          <div className="command-hero-actions">
            <button type="button" className="button primary" onClick={onPlanRun}>
              <Icon name="truck" size={15} />
              Plan Delivery Run
            </button>
            <button type="button" className="button subtle" onClick={onCreateOrder}>
              <Icon name="plus" size={15} />
              New Order
            </button>
          </div>
        </div>

        {/* Pulse Widget */}
        <div className="command-pulse-widget" aria-label="Real-time operations status">
          <div className="pulse-widget-header">
            <div className="pulse-header-title">
              <span className="live-dot" />
              <strong>Real-Time Fleet Pulse</strong>
            </div>
            <span className="pulse-sync-badge">Auto-Synced</span>
          </div>

          <div className="pulse-metric-list">
            <div className="pulse-metric-row">
              <div className="pulse-row-label">
                <Icon name="package" size={15} />
                <span>Orders In Queue</span>
              </div>
              <strong className="pulse-row-value">{openOrders.length}</strong>
              <small className="pulse-row-sub">
                {openOrders.length ? 'Pending dispatch' : 'Queue clear'}
              </small>
            </div>

            <div className="pulse-metric-row">
              <div className="pulse-row-label">
                <Icon name="truck" size={15} />
                <span>Active Runs in Motion</span>
              </div>
              <strong className="pulse-row-value">{activeRuns.length}</strong>
              <small className="pulse-row-sub">
                {dashboard.runs_en_route || 0} en route now
              </small>
            </div>

            <div className={`pulse-metric-row ${exceptions ? 'is-alert' : ''}`}>
              <div className="pulse-row-label">
                <Icon name="alertCircle" size={15} />
                <span>Delivery Exceptions</span>
              </div>
              <strong className="pulse-row-value">{exceptions}</strong>
              <small className="pulse-row-sub">
                {exceptions ? 'Requires manager attention' : 'Zero exceptions'}
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Metric Cards */}
      <section className="kpi-metric-grid" aria-label="Operations metrics">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Queued Orders</span>
            <div className="kpi-icon-bubble bubble--blue">
              <Icon name="package" size={18} />
            </div>
          </div>
          <strong className="kpi-number">{openOrders.length}</strong>
          <span className="kpi-caption">
            {openOrders.length === 1 ? '1 order awaiting route' : `${openOrders.length} orders awaiting route`}
          </span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Available Fleet</span>
            <div className="kpi-icon-bubble bubble--blue">
              <Icon name="users" size={18} />
            </div>
          </div>
          <strong className="kpi-number">{availableDrivers.length}</strong>
          <span className="kpi-caption">
            {availableDrivers.length} active drivers ready to assign
          </span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Routes</span>
            <div className="kpi-icon-bubble bubble--purple">
              <Icon name="truck" size={18} />
            </div>
          </div>
          <strong className="kpi-number">{activeRuns.length}</strong>
          <span className="kpi-caption">
            {dashboard.runs_en_route || 0} currently on the road
          </span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Cash Collected Today</span>
            <div className="kpi-icon-bubble bubble--teal">
              <Icon name="dollar" size={18} />
            </div>
          </div>
          <strong className="kpi-number font-tabular">${formatNumber(totalCashToday)}</strong>
          <span className="kpi-caption">Settled into ledger</span>
        </div>
      </section>

      {/* Operations Pipeline Flow Diagram */}
      <section className="section-container">
        <AdminOperationsPipeline flow={flow} activeRunsCount={activeRuns.length} />
      </section>

      {/* Two-Column Operations Grid */}
      <div className="overview-two-col">
        {/* Left: Queue to Dispatch */}
        <section className="content-panel queue-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Intake Queue</span>
              <h2 className="panel-title">Next Orders to Dispatch</h2>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate('orders')}
            >
              View all ({orders.length})
              <Icon name="chevronRight" size={13} />
            </button>
          </div>

          <div className="queue-list">
            {openOrders.slice(0, 5).map(order => (
              <button
                type="button"
                className="queue-item-row"
                key={order.name}
                onClick={() => onOpenOrder(order)}
              >
                <span className={`priority-indicator indicator--${order.priority?.toLowerCase()}`} />
                <div className="queue-item-main">
                  <strong className="queue-item-customer">{order.customer_name}</strong>
                  <span className="queue-item-address">{order.address}</span>
                </div>
                <div className="queue-item-meta">
                  <span className={`priority-tag priority-${order.priority?.toLowerCase()}`}>
                    {order.priority}
                  </span>
                  <strong className="queue-item-cash">${formatNumber(order.cash_amount)}</strong>
                </div>
              </button>
            ))}

            {!openOrders.length && (
              <div className="panel-empty-message">
                <Icon name="checkCircle" size={24} />
                <strong>Dispatch Queue is Empty</strong>
                <p>All created orders have been assigned to active delivery runs.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right: Driver Fleet Readiness */}
        <aside className="content-panel readiness-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Fleet Capacity</span>
              <h2 className="panel-title">{availableDrivers.length} Drivers Ready</h2>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate('drivers')}
            >
              Fleet roster
              <Icon name="chevronRight" size={13} />
            </button>
          </div>

          <p className="readiness-summary-text">
            {openOrders.length
              ? `${openOrders.length} queued ${openOrders.length === 1 ? 'order is' : 'orders are'} ready to be grouped into a delivery route.`
              : 'Fleet capacity is standing by for new incoming orders.'}
          </p>

          <div className="readiness-driver-list">
            {availableDrivers.slice(0, 4).map(driver => (
              <div key={driver.name} className="readiness-driver-item">
                <div className="driver-mini-info">
                  <span className="driver-avatar-mini">
                    <Icon name="user" size={12} />
                  </span>
                  <div>
                    <strong className="driver-mini-name">{driver.driver_name}</strong>
                    <span className="driver-mini-capacity">
                      Up to {driver.max_stops_per_run} stops/run
                    </span>
                  </div>
                </div>
                <span className="status-badge status-badge--success status-badge--small">
                  <span className="status-dot" />
                  Ready
                </span>
              </div>
            ))}

            {!availableDrivers.length && (
              <div className="panel-empty-message">
                <Icon name="truck" size={24} />
                <strong>No Drivers Currently Available</strong>
                <p>All registered drivers are currently executing active routes or set inactive.</p>
              </div>
            )}
          </div>

          <div className="readiness-panel-action">
            <button
              type="button"
              className="button primary full"
              disabled={!availableDrivers.length || !openOrders.length}
              onClick={onPlanRun}
            >
              <Icon name="truck" size={15} />
              Plan Next Run Now
            </button>
          </div>
        </aside>
      </div>

      {/* Active Runs Table */}
      <section className="content-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Live Fleet</span>
            <h2 className="panel-title">Active Delivery Runs</h2>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => onNavigate('runs')}
          >
            All delivery runs
            <Icon name="chevronRight" size={13} />
          </button>
        </div>

        <RunTable
          runs={activeRuns}
          onOpen={onOpenRun}
          emptyTitle="No active delivery routes in progress."
        />
      </section>
    </div>
  )
}
