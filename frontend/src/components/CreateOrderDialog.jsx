import { useEffect, useRef, useState } from 'react'
import { EMPTY_ORDER, PRIORITIES } from '../constants'
import Icon from './Icon'

export default function CreateOrderDialog({ open, busy, audience = 'admin', onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_ORDER)
  const firstField = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(EMPTY_ORDER)
      requestAnimationFrame(() => firstField.current?.focus())
    }
  }, [open])

  useEffect(() => {
    const close = event => event.key === 'Escape' && !busy && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [busy, onClose])

  if (!open) return null

  const submit = async event => {
    event.preventDefault()
    const result = await onSubmit({
      ...form,
      cash_amount: Number(form.cash_amount),
    })
    if (result !== false) onClose()
  }

  const userFacing = audience === 'user'

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => event.target === event.currentTarget && !busy && onClose()}
    >
      <form
        className="modal order-modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-kicker-pill kicker-info">
              <Icon name="package" size={12} />
              {userFacing ? 'Delivery Request' : 'Intake Queue'}
            </span>
            <h2 id="order-modal-title" className="modal-title">
              {userFacing ? 'Request a Delivery' : 'Create New Delivery Order'}
            </h2>
          </div>
          <button
            type="button"
            className="quiet-icon"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <p className="modal-intro">
          {userFacing
            ? 'Provide recipient and address information. You will be able to track live delivery progress from your dashboard.'
            : 'Capture order details for dispatch. You can assign this order to an available driver route in the Run Planner.'}
        </p>

        <div className="form-grid">
          <label className="field">
            <span>Customer / Recipient Name</span>
            <div className="input-with-icon">
              <Icon name="user" size={15} className="input-affix-icon" />
              <input
                ref={firstField}
                value={form.customer_name}
                onChange={event => setForm({ ...form, customer_name: event.target.value })}
                placeholder="Full recipient name"
                autoComplete="name"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>
              Phone Number <small>(Optional)</small>
            </span>
            <div className="input-with-icon">
              <Icon name="phone" size={15} className="input-affix-icon" />
              <input
                value={form.customer_phone}
                onChange={event => setForm({ ...form, customer_phone: event.target.value })}
                placeholder="+1 (555) 000-0000"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
          </label>

          <label className="field field-wide">
            <span>Destination Delivery Address</span>
            <div className="input-with-icon textarea-wrapper">
              <Icon name="mapPin" size={15} className="input-affix-icon input-affix-icon--textarea" />
              <textarea
                value={form.address}
                onChange={event => setForm({ ...form, address: event.target.value })}
                rows="3"
                placeholder="Building number, street, unit/suite, city"
                autoComplete="street-address"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Cash to Collect (COD)</span>
            <div className="input-with-affix">
              <span className="input-prefix">$</span>
              <input
                value={form.cash_amount}
                onChange={event => setForm({ ...form, cash_amount: event.target.value })}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                inputMode="decimal"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Priority Level</span>
            <select
              value={form.priority}
              onChange={event => setForm({ ...form, priority: event.target.value })}
            >
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {priority} Priority
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="button subtle"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={busy || !form.customer_name.trim() || !form.address.trim()}
          >
            <Icon name="check" size={14} />
            {userFacing ? 'Submit Delivery Request' : 'Create Delivery Order'}
          </button>
        </div>
      </form>
    </div>
  )
}
