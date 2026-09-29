import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const COMMON_FAILURE_REASONS = [
  'Customer unavailable',
  'Incorrect delivery address',
  'Customer refused cash payment',
  'Gate locked / no building access',
  'Package damaged prior to handoff',
]

const COMMON_BANK_LOCATIONS = [
  'Central Operations Vault',
  'Dispatch Finance Counter',
  'Branch Cash Office',
  'Authorized Bank Drop Box',
]

export default function ActionDialog({ config, busy, onClose, onConfirm }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    setValue('')
    if (config) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [config])

  useEffect(() => {
    const close = event => event.key === 'Escape' && !busy && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [busy, onClose])

  if (!config) return null
  const isFailure = config.type === 'failure'
  const stop = config.stop
  const chips = isFailure ? COMMON_FAILURE_REASONS : COMMON_BANK_LOCATIONS

  const submit = event => {
    event.preventDefault()
    const clean = value.trim()
    if (clean) onConfirm(clean)
  }

  const handleChipClick = chip => {
    setValue(chip)
    inputRef.current?.focus()
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => event.target === event.currentTarget && !busy && onClose()}
    >
      <form
        className="modal compact-modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-title"
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <span className={`modal-kicker-pill ${isFailure ? 'kicker-danger' : 'kicker-success'}`}>
              <Icon name={isFailure ? 'alertCircle' : 'dollar'} size={12} />
              {isFailure ? 'Delivery Exception' : 'Cash Reconciliation'}
            </span>
            <h2 id="action-title" className="modal-title">
              {isFailure ? 'Report Failed Stop' : 'Record Cash Handoff'}
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

        {isFailure && stop && (
          <div className="action-context-callout">
            <Icon name="mapPin" size={15} />
            <div>
              <strong>{stop.customer_name}</strong>
              <span>{stop.address}</span>
            </div>
          </div>
        )}

        <p className="modal-intro">
          {isFailure
            ? 'Select a standard reason or enter a detailed note. This is preserved in the audit log for dispatch review.'
            : 'Specify the physical location, department, or authorized person that received the collected cash.'}
        </p>

        <div className="chip-selection-group">
          <span className="chip-group-label">Quick Suggestions</span>
          <div className="chip-pills">
            {chips.map(chip => (
              <button
                type="button"
                key={chip}
                className={`suggestion-chip ${value === chip ? 'is-selected' : ''}`}
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <label className="field" style={{ marginTop: '16px' }}>
          <span>
            {isFailure ? 'Detailed reason for exception' : 'Handoff location / recipient'}
          </span>
          {isFailure ? (
            <textarea
              ref={inputRef}
              value={value}
              onChange={event => setValue(event.target.value)}
              rows="3"
              placeholder="e.g., Customer was not home after 2 calls; gate locked..."
              required
            />
          ) : (
            <input
              ref={inputRef}
              value={value}
              onChange={event => setValue(event.target.value)}
              placeholder="e.g., Central Vault Room 204 or Finance Desk"
              required
            />
          )}
        </label>

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
            className={`button ${isFailure ? 'danger' : 'primary'}`}
            disabled={busy || !value.trim()}
          >
            {isFailure ? 'Confirm Stop Failed' : 'Confirm Cash Handoff'}
          </button>
        </div>
      </form>
    </div>
  )
}
