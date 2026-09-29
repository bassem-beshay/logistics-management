import { useEffect } from 'react'
import Icon from './Icon'

function humanizeMessage(msg, isError) {
  if (!msg) return { title: '', body: '' }

  if (isError) {
    if (msg.includes('403') || msg.includes('security token') || msg.includes('CSRF')) {
      return {
        title: 'Authentication Required',
        body: 'Your session has expired or the security token is invalid. Please refresh the page and sign in again.',
      }
    }
    if (msg.includes('401') || msg.includes('Unauthorized')) {
      return {
        title: 'Access Restricted',
        body: 'You do not have permission to perform this action with your current role.',
      }
    }
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('connect')) {
      return {
        title: 'Connection Issue',
        body: 'Unable to reach the operations server. Please check your connection and try again.',
      }
    }
    return {
      title: 'Action Failed',
      body: msg,
    }
  }

  // Success messages
  if (msg.includes('created')) {
    return {
      title: 'Order Created',
      body: msg,
    }
  }
  if (msg.includes('ready to start') || msg.includes('built')) {
    return {
      title: 'Run Prepared',
      body: msg,
    }
  }
  if (msg.includes('en route')) {
    return {
      title: 'Run In Progress',
      body: msg,
    }
  }
  if (msg.includes('delivered')) {
    return {
      title: 'Delivery Recorded',
      body: msg,
    }
  }
  if (msg.includes('banked') || msg.includes('Cash handoff')) {
    return {
      title: 'Cash Banked',
      body: msg,
    }
  }

  return {
    title: 'Success',
    body: msg,
  }
}

export default function Feedback({ error, notice, onDismissError, onDismissNotice }) {
  const isError = Boolean(error)
  const isNotice = Boolean(notice)

  useEffect(() => {
    if (isNotice && onDismissNotice) {
      const timer = setTimeout(() => {
        onDismissNotice()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isNotice, notice, onDismissNotice])

  if (!isError && !isNotice) return null

  const raw = error || notice
  const { title, body } = humanizeMessage(raw, isError)

  return (
    <div className="toast-container" aria-live="polite">
      <div
        className={`toast-notification ${isError ? 'toast--error' : 'toast--success'}`}
        role={isError ? 'alert' : 'status'}
      >
        <div className="toast-icon-box">
          <Icon
            name={isError ? 'alertCircle' : 'checkCircle'}
            size={18}
            strokeWidth={2}
          />
        </div>
        <div className="toast-text-box">
          <strong className="toast-title">{title}</strong>
          <span className="toast-body">{body}</span>
        </div>
        <button
          type="button"
          className="toast-close-btn"
          onClick={isError ? onDismissError : onDismissNotice}
          aria-label="Dismiss notification"
        >
          <Icon name="close" size={15} />
        </button>
      </div>
    </div>
  )
}
