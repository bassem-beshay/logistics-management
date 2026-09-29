import Icon from './Icon'

/**
 * Palette Tokens from User:
 * Midnight Navy: #000133
 * Deep Navy: #051540
 * Steel Navy Blue: #1c3670
 * Warm Cream / Soft Sand: #fcf1d1
 */

// 1. Customer Journey Flow (for User Experience Hero)
export function CustomerJourneyVisual({ order, stages = ['Open', 'Assigned', 'En Route', 'Delivered'] }) {
  const currentStatus = order?.status || 'Open'
  const isFailed = currentStatus === 'Failed'
  const isDelivered = ['Delivered', 'Cash Banked'].includes(currentStatus)
  const stageIndex = isDelivered ? 3 : stages.indexOf(currentStatus) >= 0 ? stages.indexOf(currentStatus) : 0

  const stageMeta = [
    { key: 'Open', label: 'Order Created', desc: 'Queued in intake', icon: 'package' },
    { key: 'Assigned', label: 'Route Assigned', desc: 'Driver scheduled', icon: 'truck' },
    { key: 'En Route', label: 'Out for Delivery', desc: 'On the road', icon: 'navigation' },
    { key: 'Delivered', label: 'Doorstep Arrival', desc: 'Delivered safely', icon: 'check' },
  ]

  return (
    <div className="flow-card zero-padding-card">
      <div className="flow-svg-container">
        <svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="flow-vector-svg">
          <rect width="800" height="240" fill="#000133" />
          <path d="M0 200 C 250 170, 550 230, 800 190 L 800 240 L 0 240 Z" fill="#051540" />

          {/* Connecting Track */}
          <path d="M 120 120 C 240 70, 360 160, 480 100 C 580 50, 640 130, 680 120" stroke="#1c3670" strokeWidth="6" strokeDasharray="8 6" />
          <path d="M 120 120 C 240 70, 360 160, 480 100" stroke="#fcf1d1" strokeWidth="3" opacity="0.9" />

          {/* Node 1: Package Created */}
          <g transform="translate(120, 120)">
            <circle r="36" fill="#051540" stroke="#1c3670" strokeWidth="3" />
            <circle r="26" fill="#1c3670" />
            <rect x="-12" y="-12" width="24" height="24" rx="3" fill="#fcf1d1" />
            <path d="M -12 0 L 12 0 M 0 -12 L 0 12" stroke="#051540" strokeWidth="2" />
            <text y="54" fill="#fcf1d1" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">1. Order Placed</text>
            <text y="70" fill="#fcf1d1" fillOpacity="0.8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Intake verified</text>
          </g>

          {/* Node 2: Route Assigned */}
          <g transform="translate(300, 105)">
            <circle r="36" fill="#051540" stroke="#1c3670" strokeWidth="3" />
            <circle r="26" fill="#1c3670" />
            {/* Clipboard / Assignment icon */}
            <rect x="-10" y="-13" width="20" height="26" rx="2" fill="#fcf1d1" />
            <rect x="-5" y="-16" width="10" height="4" rx="1" fill="#000133" />
            <line x1="-6" y1="-5" x2="6" y2="-5" stroke="#000133" strokeWidth="2" />
            <line x1="-6" y1="0" x2="6" y2="0" stroke="#000133" strokeWidth="2" />
            <line x1="-6" y1="5" x2="3" y2="5" stroke="#000133" strokeWidth="2" />
            <text y="54" fill="#fcf1d1" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">2. Route Assigned</text>
            <text y="70" fill="#fcf1d1" fillOpacity="0.8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Capacity matched</text>
          </g>

          {/* Node 3: Van En Route */}
          <g transform="translate(480, 100)">
            <circle r="38" fill="#1c3670" stroke="#fcf1d1" strokeWidth="3" />
            <circle r="28" fill="#051540" />
            {/* Van Icon */}
            <path d="M -14 6 L -14 -6 A 2 2 0 0 1 -12 -8 L 4 -8 L 10 -2 L 14 -2 A 2 2 0 0 1 16 0 L 16 6 Z" fill="#fcf1d1" />
            <circle cx="-6" cy="8" r="3" fill="#000133" />
            <circle cx="10" cy="8" r="3" fill="#000133" />
            <path d="M 5 -5 L 9 -2 L 5 -2 Z" fill="#051540" />
            <text y="54" fill="#fcf1d1" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">3. En Route</text>
            <text y="70" fill="#fcf1d1" fillOpacity="0.8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Driver in motion</text>
          </g>

          {/* Node 4: Doorstep Arrival */}
          <g transform="translate(680, 120)">
            <circle r="36" fill="#051540" stroke="#1c3670" strokeWidth="3" />
            <circle r="26" fill="#1c3670" />
            {/* Doorstep / Check Icon */}
            <circle r="13" fill="#fcf1d1" />
            <path d="M -5 0 L -1 4 L 6 -3" stroke="#000133" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <text y="54" fill="#fcf1d1" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">4. Safe Delivery</text>
            <text y="70" fill="#fcf1d1" fillOpacity="0.8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Receipt & Cash verified</text>
          </g>
        </svg>
      </div>

      <div className="flow-card-body">
        <div className="flow-body-header">
          <div className="flow-header-tags">
            <span className="flow-tag-pill">
              <Icon name="truck" size={13} />
              Live Shipment Tracking
            </span>
            <span className="code-text" style={{ color: '#1c3670' }}>{order?.name || 'New Order'}</span>
          </div>
          <h3 className="flow-title">
            {isFailed
              ? 'Delivery Exception Encountered'
              : isDelivered
              ? 'Package Successfully Delivered'
              : currentStatus === 'En Route'
              ? 'Driver is En Route to Destination'
              : currentStatus === 'Assigned'
              ? 'Order Grouped into Driver Route'
              : 'Order Intake Received — Awaiting Route'}
          </h3>
        </div>

        <div className="stepper-horizontal">
          {stageMeta.map((item, index) => {
            const isDone = !isFailed && (isDelivered || index < stageIndex)
            const isCurrent = !isFailed && index === stageIndex
            return (
              <div
                key={item.key}
                className={`step-h-node ${isDone ? 'is-complete' : ''} ${isCurrent ? 'is-active' : ''} ${isFailed && index === stageIndex ? 'is-failed' : ''}`}
              >
                <div className="step-h-bubble">
                  {isDone ? <Icon name="check" size={12} strokeWidth={2.5} /> : index + 1}
                </div>
                <div className="step-h-meta">
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </div>
              </div>
            )
          })}
        </div>

        {order && (
          <div className="flow-footer-meta">
            <div>
              <span className="meta-label">Destination Address</span>
              <strong className="meta-value">{order.address}</strong>
            </div>
            {order.customer_phone && (
              <div>
                <span className="meta-label">Customer Contact</span>
                <strong className="meta-value">{order.customer_phone}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 2. Customer History Flow Banner (for User Experience History Section)
export function CustomerHistoryVisual() {
  return (
    <div className="flow-banner-box zero-padding-card">
      <svg viewBox="0 0 1000 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="flow-vector-svg">
        <rect width="1000" height="120" fill="#051540" />
        <path d="M 0 60 Q 250 20, 500 60 T 1000 60" stroke="#1c3670" strokeWidth="4" fill="none" />

        <g transform="translate(140, 60)">
          <circle r="22" fill="#000133" stroke="#fcf1d1" strokeWidth="2" />
          <text y="5" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">01</text>
          <text y="-28" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Intake Created</text>
        </g>
        <g transform="translate(380, 60)">
          <circle r="22" fill="#000133" stroke="#1c3670" strokeWidth="2" />
          <text y="5" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">02</text>
          <text y="-28" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Driver Dispatched</text>
        </g>
        <g transform="translate(620, 60)">
          <circle r="22" fill="#000133" stroke="#1c3670" strokeWidth="2" />
          <text y="5" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">03</text>
          <text y="-28" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Doorstep Handover</text>
        </g>
        <g transform="translate(860, 60)">
          <circle r="24" fill="#1c3670" stroke="#fcf1d1" strokeWidth="2.5" />
          <text y="5" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">04</text>
          <text y="-30" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Audit Archival</text>
        </g>
      </svg>
    </div>
  )
}

// 3. Driver Tactical Route Flow (for Driver Cockpit Hero)
export function DriverRouteVisual({ run, stops = [] }) {
  const deliveredCount = stops.filter(s => s.stop_status === 'Delivered').length
  const failedCount = stops.filter(s => s.stop_status === 'Failed').length
  const remainingCount = stops.filter(s => !['Delivered', 'Failed'].includes(s.stop_status)).length

  return (
    <div className="driver-route-card zero-padding-card">
      <div className="flow-svg-container">
        <svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="flow-vector-svg">
          <rect width="800" height="220" fill="#000133" />
          {/* Tactical grid lines */}
          <line x1="0" y1="55" x2="800" y2="55" stroke="#051540" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="110" x2="800" y2="110" stroke="#051540" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="165" x2="800" y2="165" stroke="#051540" strokeWidth="1" strokeDasharray="4 4" />

          {/* Tactical Route Path */}
          <path d="M 80 140 L 220 70 L 380 150 L 540 80 L 720 120" stroke="#1c3670" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 80 140 L 220 70 L 380 150" stroke="#fcf1d1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {/* Waypoint Stop 1 */}
          <g transform="translate(80, 140)">
            <circle r="18" fill="#fcf1d1" stroke="#000133" strokeWidth="3" />
            <text y="4" fill="#000133" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">1</text>
            <text y="32" fill="#fcf1d1" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Stop 1</text>
          </g>

          {/* Waypoint Stop 2 */}
          <g transform="translate(220, 70)">
            <circle r="18" fill="#fcf1d1" stroke="#000133" strokeWidth="3" />
            <text y="4" fill="#000133" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">2</text>
            <text y="-24" fill="#fcf1d1" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Stop 2</text>
          </g>

          {/* Waypoint Stop 3 (Active) */}
          <g transform="translate(380, 150)">
            <circle r="24" fill="#1c3670" stroke="#fcf1d1" strokeWidth="3" />
            <circle r="14" fill="#051540" />
            <text y="4" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">3</text>
            <text y="38" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Active Stop</text>
          </g>

          {/* Waypoint Stop 4 */}
          <g transform="translate(540, 80)">
            <circle r="18" fill="#051540" stroke="#1c3670" strokeWidth="3" />
            <text y="4" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">4</text>
            <text y="-24" fill="#fcf1d1" fillOpacity="0.8" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">Stop 4</text>
          </g>

          {/* Waypoint Final Vault */}
          <g transform="translate(720, 120)">
            <rect x="-18" y="-18" width="36" height="36" rx="6" fill="#051540" stroke="#fcf1d1" strokeWidth="2" />
            <text y="5" fill="#fcf1d1" fontSize="14" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">$</text>
            <text y="34" fill="#fcf1d1" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Handoff</text>
          </g>
        </svg>
      </div>

      <div className="driver-route-body">
        <div className="driver-route-header">
          <div>
            <span className="driver-route-subhead">
              <Icon name="navigation" size={12} />
              Route Navigation Manifest
            </span>
            <h3 className="driver-route-title">{run?.name || 'No Active Route'}</h3>
          </div>
          <div className="driver-route-stats-pill">
            <span className="stat-pill-item delivered">
              {deliveredCount} Delivered
            </span>
            {failedCount > 0 && (
              <span className="stat-pill-item failed">
                {failedCount} Exceptions
              </span>
            )}
            <span className="stat-pill-item remaining">
              {remainingCount} Remaining
            </span>
          </div>
        </div>

        <div className="driver-waypoints-container">
          {stops.length === 0 ? (
            <div className="driver-no-stops">
              <Icon name="truck" size={26} />
              <p>Standing by for route dispatch from central operations.</p>
            </div>
          ) : (
            <div className="driver-waypoints-list">
              {stops.slice(0, 4).map((stop, index) => {
                const isDelivered = stop.stop_status === 'Delivered'
                const isFailed = stop.stop_status === 'Failed'
                const isEnRoute = stop.stop_status === 'En Route'

                return (
                  <div
                    key={stop.name}
                    className={`driver-waypoint-item ${isDelivered ? 'is-delivered' : ''} ${isFailed ? 'is-failed' : ''} ${isEnRoute ? 'is-active' : ''}`}
                  >
                    <div className="waypoint-pin">
                      {isDelivered ? <Icon name="check" size={12} strokeWidth={2.5} /> : isFailed ? <Icon name="close" size={12} strokeWidth={2.5} /> : index + 1}
                    </div>
                    <div className="waypoint-info">
                      <strong className="waypoint-customer">{stop.customer_name}</strong>
                      <span className="waypoint-address">{stop.address}</span>
                    </div>
                    <div className="waypoint-meta">
                      <span className="waypoint-status">{stop.stop_status}</span>
                    </div>
                  </div>
                )
              })}
              {stops.length > 4 && (
                <div className="driver-waypoints-more">
                  +{stops.length - 4} more stops in this run manifest
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 4. Admin Operations Pipeline Flow (for Overview Page)
export function AdminOperationsPipeline({ flow = [] }) {
  const steps = [
    { name: 'Intake Queue', icon: 'package', stage: 'Open' },
    { name: 'Route Dispatch', icon: 'users', stage: 'Assigned' },
    { name: 'Fleet En Route', icon: 'truck', stage: 'En route' },
    { name: 'Cash Settlement', icon: 'dollar', stage: 'Settled' },
  ]

  return (
    <div className="operations-pipeline-card zero-padding-card">
      <div className="flow-svg-container">
        <svg viewBox="0 0 1000 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="flow-vector-svg">
          <rect width="1000" height="160" fill="#000133" />
          <path d="M 0 130 C 300 110, 700 150, 1000 120 L 1000 160 L 0 160 Z" fill="#051540" />

          {/* Connector Flow Ribbons */}
          <line x1="160" y1="80" x2="360" y2="80" stroke="#1c3670" strokeWidth="4" strokeDasharray="6 4" />
          <line x1="400" y1="80" x2="600" y2="80" stroke="#1c3670" strokeWidth="4" strokeDasharray="6 4" />
          <line x1="640" y1="80" x2="840" y2="80" stroke="#1c3670" strokeWidth="4" strokeDasharray="6 4" />

          {/* Phase 1 */}
          <g transform="translate(140, 80)">
            <circle r="32" fill="#051540" stroke="#1c3670" strokeWidth="2.5" />
            <circle r="22" fill="#1c3670" />
            <rect x="-9" y="-9" width="18" height="18" rx="2" fill="#fcf1d1" />
            <text y="50" fill="#fcf1d1" fontSize="12" fontWeight="750" textAnchor="middle" fontFamily="sans-serif">1. Order Intake</text>
            <text y="66" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Incoming COD orders</text>
          </g>

          {/* Phase 2 */}
          <g transform="translate(380, 80)">
            <circle r="32" fill="#051540" stroke="#1c3670" strokeWidth="2.5" />
            <circle r="22" fill="#1c3670" />
            <path d="M -8 -8 L 8 -8 L 8 8 L -8 8 Z" fill="#fcf1d1" />
            <text y="50" fill="#fcf1d1" fontSize="12" fontWeight="750" textAnchor="middle" fontFamily="sans-serif">2. Capacity Matching</text>
            <text y="66" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Driver capacity limit</text>
          </g>

          {/* Phase 3 */}
          <g transform="translate(620, 80)">
            <circle r="32" fill="#1c3670" stroke="#fcf1d1" strokeWidth="2.5" />
            <circle r="22" fill="#051540" />
            <path d="M -11 4 L -11 -4 L 3 -4 L 8 0 L 11 0 L 11 4 Z" fill="#fcf1d1" />
            <circle cx="-5" cy="5" r="2.5" fill="#000133" />
            <circle cx="7" cy="5" r="2.5" fill="#000133" />
            <text y="50" fill="#fcf1d1" fontSize="12" fontWeight="750" textAnchor="middle" fontFamily="sans-serif">3. Fleet En Route</text>
            <text y="66" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Ordered stop handoffs</text>
          </g>

          {/* Phase 4 */}
          <g transform="translate(860, 80)">
            <circle r="32" fill="#051540" stroke="#fcf1d1" strokeWidth="2.5" />
            <circle r="22" fill="#1c3670" />
            <text y="7" fill="#fcf1d1" fontSize="18" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">$</text>
            <text y="50" fill="#fcf1d1" fontSize="12" fontWeight="750" textAnchor="middle" fontFamily="sans-serif">4. Cash Settlement</text>
            <text y="66" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Vault handoff & ledger</text>
          </g>
        </svg>
      </div>

      <div className="operations-pipeline-body">
        <div className="pipeline-header">
          <div>
            <span className="pipeline-kicker">
              <Icon name="zap" size={12} />
              Operations Workflow Pipeline
            </span>
            <h2 className="pipeline-title">Order Intake to Cash Settlement</h2>
          </div>
          <span className="pipeline-badge live">
            <span className="live-dot" />
            Live Sync
          </span>
        </div>

        <div className="pipeline-steps-grid">
          {steps.map((step, idx) => {
            const flowData = flow.find(f => f[0].toLowerCase() === step.stage.toLowerCase())
            const count = flowData ? flowData[1] : 0
            const note = flowData ? flowData[2] : ''

            return (
              <div key={step.name} className="pipeline-step-card">
                <div className="pipeline-step-top">
                  <span className="pipeline-step-num">0{idx + 1}</span>
                  <div className="pipeline-step-icon">
                    <Icon name={step.icon} size={16} />
                  </div>
                </div>
                <div className="pipeline-step-body">
                  <span className="pipeline-step-name">{step.name}</span>
                  <strong className="pipeline-step-count">{count}</strong>
                  <span className="pipeline-step-note">{note}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="pipeline-step-arrow" aria-hidden="true">
                    <Icon name="arrowRight" size={14} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 5. Admin Orders Flow Banner (for Orders Page)
export function AdminOrdersFlowBanner() {
  return (
    <div className="flow-banner-box zero-padding-card" style={{ marginBottom: '24px' }}>
      <svg viewBox="0 0 1000 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="flow-vector-svg">
        <rect width="1000" height="110" fill="#051540" />
        <path d="M 0 55 L 1000 55" stroke="#1c3670" strokeWidth="2" strokeDasharray="6 4" />

        <g transform="translate(180, 55)">
          <rect x="-70" y="-30" width="140" height="60" rx="8" fill="#000133" stroke="#1c3670" strokeWidth="1.5" />
          <text y="-8" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Order Intake</text>
          <text y="12" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Open Queue & Priority</text>
        </g>
        <path d="M 260 55 L 340 55" stroke="#fcf1d1" strokeWidth="3" markerEnd="url(#arrow)" />
        <g transform="translate(420, 55)">
          <rect x="-70" y="-30" width="140" height="60" rx="8" fill="#000133" stroke="#1c3670" strokeWidth="1.5" />
          <text y="-8" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Route Bundling</text>
          <text y="12" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Max Stop Limits</text>
        </g>
        <path d="M 500 55 L 580 55" stroke="#fcf1d1" strokeWidth="3" />
        <g transform="translate(660, 55)">
          <rect x="-70" y="-30" width="140" height="60" rx="8" fill="#000133" stroke="#1c3670" strokeWidth="1.5" />
          <text y="-8" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Delivery Status</text>
          <text y="12" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">En Route Transitions</text>
        </g>
        <path d="M 740 55 L 820 55" stroke="#fcf1d1" strokeWidth="3" />
        <g transform="translate(890, 55)">
          <rect x="-60" y="-30" width="120" height="60" rx="8" fill="#1c3670" stroke="#fcf1d1" strokeWidth="1.5" />
          <text y="-8" fill="#fcf1d1" fontSize="12" fontWeight="750" textAnchor="middle" fontFamily="sans-serif">Cash Banked</text>
          <text y="12" fill="#fcf1d1" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Audit Settled</text>
        </g>
      </svg>
    </div>
  )
}

// 6. Admin Runs Flow Banner (for Delivery Runs Page)
export function AdminRunsFlowBanner() {
  return (
    <div className="flow-banner-box zero-padding-card" style={{ marginBottom: '24px' }}>
      <svg viewBox="0 0 1000 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="flow-vector-svg">
        <rect width="1000" height="110" fill="#000133" />
        <path d="M 120 55 L 880 55" stroke="#1c3670" strokeWidth="3" strokeDasharray="8 6" />

        <g transform="translate(180, 55)">
          <circle r="26" fill="#051540" stroke="#fcf1d1" strokeWidth="2" />
          <text y="5" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">1</text>
          <text y="-36" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Select Available Driver</text>
          <text y="44" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Check vehicle capacity</text>
        </g>

        <g transform="translate(420, 55)">
          <circle r="26" fill="#051540" stroke="#1c3670" strokeWidth="2" />
          <text y="5" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">2</text>
          <text y="-36" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Assign Open Orders</text>
          <text y="44" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Order stop sequence</text>
        </g>

        <g transform="translate(660, 55)">
          <circle r="26" fill="#051540" stroke="#1c3670" strokeWidth="2" />
          <text y="5" fill="#fcf1d1" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">3</text>
          <text y="-36" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Dispatch En Route</text>
          <text y="44" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Start route delivery</text>
        </g>

        <g transform="translate(860, 55)">
          <circle r="26" fill="#1c3670" stroke="#fcf1d1" strokeWidth="2" />
          <text y="5" fill="#fcf1d1" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">$</text>
          <text y="-36" fill="#fcf1d1" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Vault Reconciled</text>
          <text y="44" fill="#fcf1d1" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Bank cash collection</text>
        </g>
      </svg>
    </div>
  )
}

// 7. Admin Fleet Flow Banner (for Drivers Page)
export function AdminFleetFlowBanner() {
  return (
    <div className="flow-banner-box zero-padding-card" style={{ marginBottom: '24px' }}>
      <svg viewBox="0 0 1000 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="flow-vector-svg">
        <rect width="1000" height="110" fill="#051540" />
        <g transform="translate(200, 55)">
          <rect x="-80" y="-28" width="160" height="56" rx="6" fill="#000133" stroke="#1c3670" strokeWidth="2" />
          <text y="-6" fill="#fcf1d1" fontSize="12" fontWeight="750" textAnchor="middle" fontFamily="sans-serif">Fleet Availability</text>
          <text y="12" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Ready to dispatch</text>
        </g>
        <path d="M 290 55 L 430 55" stroke="#fcf1d1" strokeWidth="3" strokeDasharray="4 4" />
        <g transform="translate(500, 55)">
          <rect x="-80" y="-28" width="160" height="56" rx="6" fill="#000133" stroke="#1c3670" strokeWidth="2" />
          <text y="-6" fill="#fcf1d1" fontSize="12" fontWeight="750" textAnchor="middle" fontFamily="sans-serif">Capacity Allocation</text>
          <text y="12" fill="#fcf1d1" fillOpacity="0.8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Up to max stops/run</text>
        </g>
        <path d="M 590 55 L 730 55" stroke="#fcf1d1" strokeWidth="3" strokeDasharray="4 4" />
        <g transform="translate(800, 55)">
          <rect x="-80" y="-28" width="160" height="56" rx="6" fill="#1c3670" stroke="#fcf1d1" strokeWidth="2" />
          <text y="-6" fill="#fcf1d1" fontSize="12" fontWeight="750" textAnchor="middle" fontFamily="sans-serif">Live On Route</text>
          <text y="12" fill="#fcf1d1" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Assigned &amp; en route</text>
        </g>
      </svg>
    </div>
  )
}
