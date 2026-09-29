import EmptyState from './EmptyState'
import Icon from './Icon'
import StatusBadge from './StatusBadge'
import { formatDate, formatNumber } from '../utils'

export default function RunTable({
  runs = [],
  onOpen,
  emptyTitle = 'No delivery runs found.',
}) {
  if (!runs.length) {
    return (
      <EmptyState
        type="runs"
        title={emptyTitle}
        description="Delivery runs will appear here as dispatch packages orders and assigns fleet drivers."
        compact
      />
    )
  }

  return (
    <div className="table-responsive-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Run Identifier</th>
            <th>Assigned Driver</th>
            <th>Status</th>
            <th>Started Date</th>
            <th className="align-right">Cash Collected</th>
            <th className="align-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(run => (
            <tr key={run.name} className="table-data-row">
              <td data-label="Run">
                <span className="record-code">
                  <Icon name="truck" size={13} className="code-icon" />
                  {run.name}
                </span>
              </td>
              <td data-label="Driver">
                <div className="table-driver-cell">
                  <span className="driver-avatar-mini">
                    <Icon name="user" size={13} />
                  </span>
                  <span className="driver-name">{run.driver || 'Unassigned'}</span>
                </div>
              </td>
              <td data-label="Status">
                <StatusBadge>{run.run_status}</StatusBadge>
              </td>
              <td data-label="Started" className="text-secondary">
                {formatDate(run.started_date)}
              </td>
              <td data-label="Collected" className="align-right font-tabular money-text">
                ${formatNumber(run.total_cash_collected)}
              </td>
              <td className="align-right table-action-cell">
                <button
                  type="button"
                  className="table-action-btn"
                  onClick={() => onOpen(run)}
                >
                  View Run
                  <Icon name="chevronRight" size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
