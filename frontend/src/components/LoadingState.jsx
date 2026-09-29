export default function LoadingState({ message = 'Loading operations workspace…' }) {
  return (
    <div className="loading-layout" aria-label="Loading operations" aria-busy="true">
      <div className="loading-header-skeleton">
        <div className="skeleton-bar skeleton-pill" style={{ width: '120px', height: '18px' }} />
        <div className="skeleton-bar" style={{ width: '380px', height: '36px', marginTop: '12px' }} />
        <div className="skeleton-bar" style={{ width: '260px', height: '16px', marginTop: '8px' }} />
      </div>

      <div className="loading-metrics-grid">
        {[1, 2, 3, 4].map(key => (
          <div key={key} className="skeleton-card skeleton-metric-card">
            <div className="skeleton-bar" style={{ width: '80px', height: '14px' }} />
            <div className="skeleton-bar" style={{ width: '110px', height: '32px', margin: '14px 0 8px' }} />
            <div className="skeleton-bar" style={{ width: '130px', height: '12px' }} />
          </div>
        ))}
      </div>

      <div className="loading-content-skeleton">
        <div className="skeleton-card" style={{ height: '360px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="skeleton-bar" style={{ width: '200px', height: '22px' }} />
            <div className="skeleton-bar skeleton-pill" style={{ width: '90px', height: '32px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3, 4, 5].map(row => (
              <div key={row} className="skeleton-bar" style={{ width: '100%', height: '48px', borderRadius: '6px' }} />
            ))}
          </div>
        </div>
      </div>

      <p className="loading-caption sr-only">{message}</p>
    </div>
  )
}
