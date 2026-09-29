import { useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { AdminOrdersFlowBanner } from '../components/VisualFlow'
import { ORDER_STATUSES, PRIORITIES } from '../constants'
import { formatDate, formatNumber } from '../utils'

export default function OrdersPage({ orders = [], onCreateOrder, onOpenOrder }) {
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' })

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return orders.filter(
      order =>
        (!filters.status || order.status === filters.status) &&
        (!filters.priority || order.priority === filters.priority) &&
        (!query ||
          [order.name, order.customer_name, order.customer_phone, order.address].some(value =>
            String(value || '')
              .toLowerCase()
              .includes(query),
          )),
    )
  }, [orders, filters])

  const filtering = Boolean(filters.search || filters.status || filters.priority)

  const openCount = orders.filter(o => o.status === 'Open').length
  const enRouteCount = orders.filter(o => o.status === 'En Route').length
  const deliveredCount = orders.filter(o => ['Delivered', 'Cash Banked'].includes(o.status)).length
  const failedCount = orders.filter(o => o.status === 'Failed').length

  return (
    <div className="orders-page">
      <PageHeader
        kicker="Order Management"
        title="Delivery Orders"
        description="Create delivery orders, monitor route assignment, and track each parcel through delivery and cash settlement."
        badge={`${orders.length} Total`}
        actions={
          <button type="button" className="button primary" onClick={onCreateOrder}>
            <Icon name="plus" size={15} />
            New Delivery Order
          </button>
        }
      />

      {/* Visual Flow Banner */}
      <AdminOrdersFlowBanner />

      {/* Quick Summary Strip */}
      <div className="orders-summary-strip">
        <button
          type="button"
          className={`summary-pill-btn ${!filters.status ? 'is-active' : ''}`}
          onClick={() => setFilters(f => ({ ...f, status: '' }))}
        >
          <span>All Orders</span>
          <strong>{orders.length}</strong>
        </button>
        <button
          type="button"
          className={`summary-pill-btn ${filters.status === 'Open' ? 'is-active' : ''}`}
          onClick={() => setFilters(f => ({ ...f, status: 'Open' }))}
        >
          <span className="dot dot-open" />
          <span>Open Queue</span>
          <strong>{openCount}</strong>
        </button>
        <button
          type="button"
          className={`summary-pill-btn ${filters.status === 'En Route' ? 'is-active' : ''}`}
          onClick={() => setFilters(f => ({ ...f, status: 'En Route' }))}
        >
          <span className="dot dot-enroute" />
          <span>On Road</span>
          <strong>{enRouteCount}</strong>
        </button>
        <button
          type="button"
          className={`summary-pill-btn ${filters.status === 'Delivered' ? 'is-active' : ''}`}
          onClick={() => setFilters(f => ({ ...f, status: 'Delivered' }))}
        >
          <span className="dot dot-delivered" />
          <span>Delivered</span>
          <strong>{deliveredCount}</strong>
        </button>
        {failedCount > 0 && (
          <button
            type="button"
            className={`summary-pill-btn ${filters.status === 'Failed' ? 'is-active' : ''}`}
            onClick={() => setFilters(f => ({ ...f, status: 'Failed' }))}
          >
            <span className="dot dot-failed" />
            <span>Exceptions</span>
            <strong>{failedCount}</strong>
          </button>
        )}
      </div>

      <section className="content-panel">
        {/* Filter Toolbar */}
        <div className="list-toolbar">
          <div className="search-control">
            <Icon name="search" size={16} className="search-icon" />
            <input
              value={filters.search}
              onChange={event => setFilters({ ...filters, search: event.target.value })}
              placeholder="Search by order ID, customer name, phone, or address…"
              aria-label="Search orders"
            />
            {filters.search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setFilters({ ...filters, search: '' })}
                aria-label="Clear search query"
              >
                <Icon name="close" size={13} />
              </button>
            )}
          </div>

          <div className="filter-dropdowns">
            <label className="select-control">
              <span className="sr-only">Filter by status</span>
              <select
                value={filters.status}
                onChange={event => setFilters({ ...filters, status: event.target.value })}
              >
                <option value="">Status: All</option>
                {ORDER_STATUSES.map(status => (
                  <option key={status} value={status}>
                    Status: {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="select-control">
              <span className="sr-only">Filter by priority</span>
              <select
                value={filters.priority}
                onChange={event => setFilters({ ...filters, priority: event.target.value })}
              >
                <option value="">Priority: All</option>
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>
                    Priority: {priority}
                  </option>
                ))}
              </select>
            </label>

            {filtering && (
              <button
                type="button"
                className="text-button reset-filter-btn"
                onClick={() => setFilters({ search: '', status: '', priority: '' })}
              >
                <Icon name="close" size={13} />
                Reset
              </button>
            )}
          </div>

          <span className="result-count">
            Showing <b>{filtered.length}</b> of {orders.length} orders
          </span>
        </div>

        {/* Table View */}
        {filtered.length ? (
          <div className="table-responsive-wrapper">
            <table className="data-table orders-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Recipient Customer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="align-right">Cash (COD)</th>
                  <th className="align-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.name} className="table-data-row">
                    <td data-label="Order">
                      <span className="record-code">
                        <Icon name="package" size={13} className="code-icon" />
                        {order.name}
                      </span>
                    </td>
                    <td data-label="Recipient">
                      <div className="customer-cell">
                        <strong className="customer-cell-name">{order.customer_name}</strong>
                        <span className="customer-cell-address">{order.address}</span>
                      </div>
                    </td>
                    <td data-label="Priority">
                      <span className={`priority-tag priority-${order.priority?.toLowerCase()}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td data-label="Status">
                      <StatusBadge>{order.status}</StatusBadge>
                    </td>
                    <td data-label="Created" className="text-secondary font-tabular">
                      {formatDate(order.created_date)}
                    </td>
                    <td data-label="Cash" className="align-right font-tabular money-text">
                      ${formatNumber(order.cash_amount)}
                    </td>
                    <td className="align-right table-action-cell">
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => onOpenOrder(order)}
                      >
                        Details
                        <Icon name="chevronRight" size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            type={filtering ? 'search' : 'orders'}
            title={filtering ? 'No matching orders found' : 'No delivery orders yet'}
            description={
              filtering
                ? 'Try adjusting your search keywords or clear the active status and priority filters.'
                : 'Create your first delivery order to start dispatching to fleet drivers.'
            }
            action={
              filtering ? (
                <button
                  type="button"
                  className="button subtle"
                  onClick={() => setFilters({ search: '', status: '', priority: '' })}
                >
                  Clear Filters
                </button>
              ) : (
                <button type="button" className="button primary" onClick={onCreateOrder}>
                  <Icon name="plus" size={14} />
                  Create Delivery Order
                </button>
              )
            }
          />
        )}
      </section>
    </div>
  )
}
