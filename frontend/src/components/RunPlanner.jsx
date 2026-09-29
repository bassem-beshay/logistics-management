import { useMemo, useState } from 'react'
import { EMPTY_RUN } from '../constants'
import { formatNumber } from '../utils'
import Icon from './Icon'
import StatusBadge from './StatusBadge'

export default function RunPlanner({
  drivers,
  orders,
  busy,
  initialDriver = '',
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState({ ...EMPTY_RUN, driver: initialDriver })
  const selectedDriver = useMemo(
    () => drivers.find(driver => driver.name === form.driver),
    [drivers, form.driver],
  )
  const capacity = Number(selectedDriver?.max_stops_per_run || 0)
  const selectedCount = form.orders.length
  const overCapacity = Boolean(selectedDriver && selectedCount > capacity)
  const capacityPct = capacity > 0 ? Math.min(100, Math.round((selectedCount / capacity) * 100)) : 0

  const selectedCash = orders
    .filter(order => form.orders.includes(order.name))
    .reduce((total, order) => total + Number(order.cash_amount || 0), 0)

  const toggleOrder = name =>
    setForm(current => ({
      ...current,
      orders: current.orders.includes(name)
        ? current.orders.filter(item => item !== name)
        : [...current.orders, name],
    }))

  const selectAllValid = () => {
    if (!selectedDriver) return
    const remaining = capacity - selectedCount
    if (remaining <= 0) return
    const unselected = orders.filter(o => !form.orders.includes(o.name)).slice(0, remaining)
    setForm(current => ({
      ...current,
      orders: [...current.orders, ...unselected.map(o => o.name)],
    }))
  }

  const clearSelection = () => {
    setForm(current => ({ ...current, orders: [] }))
  }

  const submit = async event => {
    event.preventDefault()
    if (overCapacity || !form.driver || !form.orders.length) return
    const result = await onSubmit(form.driver, form.orders)
    if (result !== false) setForm(EMPTY_RUN)
  }

  return (
    <form className="planner-card" onSubmit={submit}>
      <div className="planner-header">
        <div>
          <span className="planner-kicker">
            <Icon name="truck" size={13} />
            Route Dispatch Builder
          </span>
          <h2 className="planner-title">Build a New Delivery Run</h2>
          <p className="planner-desc">
            Pair an available fleet driver with queued orders within vehicle stop capacity.
          </p>
        </div>
        {onCancel && (
          <button type="button" className="button subtle small" onClick={onCancel}>
            <Icon name="close" size={14} />
            Close Planner
          </button>
        )}
      </div>

      <div className="planner-grid">
        {/* Step 1 */}
        <section className="planner-step-col">
          <div className="planner-step-header">
            <span className="step-number-bubble">1</span>
            <div>
              <h3 className="step-title">Assign Available Driver</h3>
              <p className="step-subtitle">Only active drivers ready for deployment</p>
            </div>
          </div>

          <label className="field" style={{ marginTop: '16px' }}>
            <span>Select Driver</span>
            <select
              value={form.driver}
              onChange={event => setForm({ ...form, driver: event.target.value, orders: [] })}
              required
            >
              <option value="">-- Choose an available driver --</option>
              {drivers.map(driver => (
                <option key={driver.name} value={driver.name}>
                  {driver.driver_name} — Max {driver.max_stops_per_run} stops
                </option>
              ))}
            </select>
          </label>

          {selectedDriver ? (
            <div className="selected-driver-card">
              <div className="driver-card-top">
                <div className="driver-avatar-circle">
                  <Icon name="user" size={18} />
                </div>
                <div>
                  <strong className="driver-name-text">{selectedDriver.driver_name}</strong>
                  <span className="driver-phone-text">
                    <Icon name="phone" size={12} />
                    {selectedDriver.phone_number || 'No contact on file'}
                  </span>
                </div>
                <StatusBadge>{selectedDriver.status}</StatusBadge>
              </div>

              <div className="driver-capacity-indicator">
                <div className="capacity-bar-header">
                  <span>Capacity Utilization</span>
                  <strong>
                    {selectedCount} / {capacity} stops
                  </strong>
                </div>
                <div className="capacity-progress-track">
                  <div
                    className={`capacity-progress-fill ${overCapacity ? 'is-over' : selectedCount === capacity ? 'is-full' : ''}`}
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="driver-select-prompt">
              <Icon name="users" size={24} />
              <p>Select a driver above to view vehicle capacity and assign stops.</p>
            </div>
          )}
        </section>

        {/* Step 2 */}
        <section className={`planner-step-col ${!selectedDriver ? 'is-disabled' : ''}`}>
          <div className="planner-step-header">
            <span className="step-number-bubble">2</span>
            <div>
              <h3 className="step-title">Select Open Orders</h3>
              <p className="step-subtitle">Orders will follow the dispatch order below</p>
            </div>
          </div>

          {selectedDriver && orders.length > 0 && (
            <div className="order-picker-actions">
              <button
                type="button"
                className="text-button"
                onClick={selectAllValid}
                disabled={selectedCount >= capacity}
              >
                Auto-fill to capacity
              </button>
              {selectedCount > 0 && (
                <button type="button" className="text-button text-muted" onClick={clearSelection}>
                  Clear selection
                </button>
              )}
            </div>
          )}

          {!orders.length ? (
            <div className="planner-empty-state">
              <Icon name="package" size={28} />
              <strong>No Open Orders Waiting</strong>
              <p>Create new orders in the Orders tab before building a delivery route.</p>
            </div>
          ) : (
            <div className="order-picker-list">
              {orders.map(order => {
                const checked = form.orders.includes(order.name)
                const disabled = !selectedDriver || (!checked && selectedCount >= capacity)
                const seq = checked ? form.orders.indexOf(order.name) + 1 : null

                return (
                  <label
                    key={order.name}
                    className={`order-picker-row ${checked ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleOrder(order.name)}
                    />
                    <span className="order-seq-tag">{seq || ''}</span>
                    <div className="order-picker-info">
                      <strong className="order-picker-customer">{order.customer_name}</strong>
                      <span className="order-picker-address">{order.address}</span>
                    </div>
                    <div className="order-picker-meta">
                      <strong className="order-picker-cash">${formatNumber(order.cash_amount)}</strong>
                      <span className={`priority-tag priority-${order.priority?.toLowerCase()}`}>
                        {order.priority}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <div className="planner-footer">
        <div className={`planner-footer-summary ${overCapacity ? 'is-overcapacity' : ''}`}>
          <div className="summary-stat">
            <span className="summary-label">Selected Stops</span>
            <strong className="summary-value">
              {selectedCount}
              {selectedDriver ? ` of ${capacity}` : ''}
            </strong>
          </div>
          <div className="summary-divider" />
          <div className="summary-stat">
            <span className="summary-label">Expected Cash Collection</span>
            <strong className="summary-value summary-cash">${formatNumber(selectedCash)}</strong>
          </div>
        </div>

        <div className="planner-footer-actions">
          {overCapacity && (
            <span className="overcapacity-warning">
              <Icon name="alertCircle" size={14} />
              Exceeds driver maximum stop capacity!
            </span>
          )}
          <button
            type="submit"
            className="button primary"
            disabled={busy || !form.driver || !selectedCount || overCapacity}
          >
            <Icon name="truck" size={15} />
            Build Delivery Run
          </button>
        </div>
      </div>
    </form>
  )
}
