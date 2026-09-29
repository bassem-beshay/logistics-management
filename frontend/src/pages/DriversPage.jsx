import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { AdminFleetFlowBanner } from '../components/VisualFlow'

export default function DriversPage({ drivers = [], busy = false, onToggle }) {
  const available = drivers.filter(driver => driver.active && driver.status === 'Available').length
  const onRun = drivers.filter(driver => driver.active && driver.status === 'On Run').length
  const inactive = drivers.filter(driver => !driver.active).length

  return (
    <div className="drivers-page">
      <PageHeader
        kicker="Fleet Management"
        title="Fleet Drivers"
        description="Monitor driver readiness, check active on-route status, and adjust driver availability and route stop capacity limits."
        badge={`${drivers.length} Drivers`}
        actions={
          <div className="fleet-quick-stats">
            <span className="fleet-stat-badge stat-navy">
              <span className="dot dot-available" />
              <b>{available}</b> Available
            </span>
            <span className="fleet-stat-badge stat-blue">
              <span className="dot dot-onrun" />
              <b>{onRun}</b> On a Run
            </span>
          </div>
        }
      />

      {/* Visual Flow Banner */}
      <AdminFleetFlowBanner />

      {/* Driver Fleet Metric Cards */}
      <div className="kpi-metric-grid" style={{ marginBottom: '28px' }}>
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Fleet Roster</span>
            <div className="kpi-icon-bubble bubble--blue">
              <Icon name="users" size={18} />
            </div>
          </div>
          <strong className="kpi-number">{drivers.length}</strong>
          <span className="kpi-caption">Registered fleet drivers</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Ready for Assignment</span>
            <div className="kpi-icon-bubble bubble--blue">
              <Icon name="checkCircle" size={18} />
            </div>
          </div>
          <strong className="kpi-number">{available}</strong>
          <span className="kpi-caption">Available to take new runs</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Currently Delivering</span>
            <div className="kpi-icon-bubble bubble--purple">
              <Icon name="truck" size={18} />
            </div>
          </div>
          <strong className="kpi-number">{onRun}</strong>
          <span className="kpi-caption">On active delivery routes</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Inactive / Off Duty</span>
            <div className="kpi-icon-bubble bubble--neutral">
              <Icon name="shield" size={18} />
            </div>
          </div>
          <strong className="kpi-number">{inactive}</strong>
          <span className="kpi-caption">Deactivated from dispatch</span>
        </div>
      </div>

      <section className="content-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Driver Roster</span>
            <h2 className="panel-title">{drivers.length} Registered Drivers</h2>
          </div>
          <span className="result-count">Managed in Frappe</span>
        </div>

        {drivers.length ? (
          <div className="table-responsive-wrapper">
            <table className="data-table drivers-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Contact Details</th>
                  <th>Operational Status</th>
                  <th>Max Stop Capacity</th>
                  <th className="align-right">Account Control</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(driver => {
                  const isOnRun = driver.status === 'On Run'
                  const isActive = driver.active

                  return (
                    <tr
                      key={driver.name}
                      className={`table-data-row ${!isActive ? 'is-inactive-row' : ''}`}
                    >
                      <td data-label="Driver">
                        <div className="table-driver-cell">
                          <span className={`driver-avatar-circle ${isActive ? 'is-active' : ''}`}>
                            <Icon name="user" size={15} />
                          </span>
                          <div>
                            <strong className="driver-name-primary">{driver.driver_name}</strong>
                            <small className="driver-id-sub">{driver.name}</small>
                          </div>
                        </div>
                      </td>
                      <td data-label="Contact">
                        {driver.phone_number ? (
                          <a
                            href={`tel:${driver.phone_number}`}
                            className="phone-action-link"
                          >
                            <Icon name="phone" size={13} />
                            {driver.phone_number}
                          </a>
                        ) : (
                          <span className="text-muted">Not provided</span>
                        )}
                      </td>
                      <td data-label="Status">
                        <StatusBadge>{isActive ? driver.status : 'Inactive'}</StatusBadge>
                      </td>
                      <td data-label="Capacity">
                        <div className="capacity-tag-badge">
                          <Icon name="package" size={12} />
                          <span>Max {driver.max_stops_per_run} stops/run</span>
                        </div>
                      </td>
                      <td className="align-right table-action-cell">
                        <button
                          type="button"
                          className={`button small ${isActive ? 'subtle' : 'primary'}`}
                          disabled={busy || isOnRun}
                          title={
                            isOnRun
                              ? 'Cannot deactivate a driver while on an active run'
                              : isActive
                              ? 'Deactivate driver'
                              : 'Activate driver'
                          }
                          onClick={() => onToggle(driver)}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            type="drivers"
            title="No fleet drivers found"
            description="Driver profiles created and linked in the system will automatically appear here."
          />
        )}
      </section>
    </div>
  )
}
