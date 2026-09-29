import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import RunPlanner from '../components/RunPlanner'
import RunTable from '../components/RunTable'
import { AdminRunsFlowBanner } from '../components/VisualFlow'

export default function RunsPage({
  runs = [],
  openOrders = [],
  availableDrivers = [],
  canDispatch = false,
  driverOnly = false,
  plannerOpen = false,
  plannerDriver = '',
  busy = false,
  onOpenPlanner,
  onClosePlanner,
  onBuildRun,
  onOpenRun,
}) {
  const activeCount = runs.filter(r => ['Assigned', 'En Route'].includes(r.run_status)).length
  const completedCount = runs.filter(r => ['Completed', 'Cash Banked'].includes(r.run_status)).length

  return (
    <div className="runs-page">
      <PageHeader
        kicker="Route Operations"
        title={driverOnly ? 'My Delivery Runs' : 'Delivery Runs & Dispatch'}
        description={
          driverOnly
            ? 'Access your assigned route, execute deliveries stop-by-stop, and submit cash collections upon completion.'
            : 'Assemble ordered delivery runs, dispatch drivers to the road, and track runs through completion and cash handoff.'
        }
        badge={`${runs.length} Runs`}
        actions={
          canDispatch && (
            <button
              type="button"
              className={`button ${plannerOpen ? 'subtle' : 'primary'}`}
              onClick={plannerOpen ? onClosePlanner : onOpenPlanner}
            >
              <Icon name={plannerOpen ? 'close' : 'plus'} size={15} />
              {plannerOpen ? 'Close Planner' : 'Plan a Delivery Run'}
            </button>
          )
        }
      />

      {/* Visual Flow Banner */}
      {!driverOnly && <AdminRunsFlowBanner />}

      {/* Quick Summary Pill Bar */}
      {!driverOnly && (
        <div className="orders-summary-strip">
          <div className="summary-pill-btn is-active">
            <span>Total Runs</span>
            <strong>{runs.length}</strong>
          </div>
          <div className="summary-pill-btn">
            <span className="dot dot-enroute" />
            <span>Active / En Route</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="summary-pill-btn">
            <span className="dot dot-delivered" />
            <span>Completed &amp; Banked</span>
            <strong>{completedCount}</strong>
          </div>
          <div className="summary-pill-btn">
            <span className="dot dot-open" />
            <span>Queued Orders Ready</span>
            <strong>{openOrders.length}</strong>
          </div>
        </div>
      )}

      {/* Interactive Planner */}
      {canDispatch && plannerOpen && (
        <div className="planner-container">
          <RunPlanner
            key={plannerDriver || 'new'}
            drivers={availableDrivers}
            orders={openOrders}
            busy={busy}
            initialDriver={plannerDriver}
            onCancel={onClosePlanner}
            onSubmit={onBuildRun}
          />
        </div>
      )}

      {/* Runs Table */}
      <section className="content-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              {driverOnly ? 'Assigned to Your Account' : 'All Routes'}
            </span>
            <h2 className="panel-title">
              {driverOnly ? 'Your Delivery Routes' : 'All Delivery Runs'}
            </h2>
          </div>
          <span className="result-count">{runs.length} total records</span>
        </div>

        <RunTable
          runs={runs}
          onOpen={onOpenRun}
          emptyTitle={
            driverOnly
              ? 'You currently have no assigned delivery runs.'
              : 'No delivery runs have been built yet.'
          }
        />
      </section>
    </div>
  )
}
