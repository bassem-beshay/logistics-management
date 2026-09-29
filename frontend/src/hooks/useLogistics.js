import { useCallback, useEffect, useRef, useState } from 'react'
import { create, get, list, method, update } from '../api'

const RUN_FIELDS = [
  'name', 'driver', 'run_status', 'total_cash_collected', 'started_date',
  'completed_date', 'cash_banked_date', 'cash_banked_location',
]
const ORDER_FIELDS = [
  'name', 'customer_name', 'customer_phone', 'address', 'cash_amount', 'priority',
  'status', 'assigned_driver', 'delivery_run', 'created_date', 'delivered_date',
]
const DRIVER_FIELDS = ['name', 'driver_name', 'phone_number', 'active', 'status', 'max_stops_per_run']

const isUnauthorized = error => [401, 403].includes(error?.status)

export default function useLogistics() {
  const sessionRef = useRef({ roles: [] })
  const [session, setSession] = useState({ roles: [] })
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [runs, setRuns] = useState([])
  const [dashboard, setDashboard] = useState({})
  const [currentRun, setCurrentRun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [authRequired, setAuthRequired] = useState(false)

  const loadData = useCallback(async ({ includeSession = false } = {}) => {
    let currentSession = sessionRef.current
    if (includeSession) {
      currentSession = await method('me')
      sessionRef.current = currentSession
      setSession(currentSession)
      setAuthRequired(false)
    }

    const roles = currentSession.roles || []
    const isAdmin = roles.includes('Logistics Manager')
    const isUser = roles.includes('Logistics Dispatcher') && !isAdmin
    const isDriver = roles.includes('Logistics Driver') && !isAdmin && !isUser

    const [allRuns, allOrders, allDrivers] = await Promise.all([
      isAdmin || isDriver ? list('Delivery Run', {}, RUN_FIELDS) : Promise.resolve([]),
      isAdmin || isUser ? list('Delivery Order', {}, ORDER_FIELDS) : Promise.resolve([]),
      isAdmin ? list('Driver', {}, DRIVER_FIELDS) : Promise.resolve([]),
    ])

    setRuns(allRuns || [])
    setOrders(allOrders || [])
    setDrivers(allDrivers || [])
    setDashboard(isAdmin ? await method('dashboard') : {})
    if (isDriver) {
      const current = allRuns.find(run => ['En Route', 'Assigned'].includes(run.run_status)) || allRuns[0]
      setCurrentRun(current ? await get('Delivery Run', current.name) : null)
    } else {
      setCurrentRun(null)
    }
  }, [])

  const bootstrap = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await loadData({ includeSession: true })
    } catch (reason) {
      if (isUnauthorized(reason)) setAuthRequired(true)
      else setError(reason.message || 'Unable to connect to logistics operations.')
    } finally {
      setLoading(false)
    }
  }, [loadData])

  useEffect(() => { bootstrap() }, [bootstrap])

  const refresh = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) { setBusy(true); setError(''); setNotice('') }
    try {
      await loadData()
      if (!quiet) setNotice('Operations are up to date.')
      return true
    } catch (reason) {
      if (isUnauthorized(reason)) setAuthRequired(true)
      else setError(reason.message || 'Unable to refresh operations.')
      return false
    } finally {
      if (!quiet) setBusy(false)
    }
  }, [loadData])

  const mutate = useCallback(async (operation, success) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await operation()
      await loadData()
      setNotice(success)
      return result
    } catch (reason) {
      if (isUnauthorized(reason)) setAuthRequired(true)
      else setError(reason.message || 'The operation could not be completed.')
      return false
    } finally {
      setBusy(false)
    }
  }, [loadData])

  const actions = {
    createOrder: document => mutate(() => create('Delivery Order', document), 'Delivery order created.'),
    buildRun: (driver, orderNames) => mutate(
      () => method('build_delivery_run', { driver, order_names: orderNames }),
      'Delivery run is ready to start.',
    ),
    startRun: runName => mutate(() => method('start_delivery_run', { run_name: runName }), 'Driver is now en route.'),
    deliverStop: (runName, stopName) => mutate(
      () => method('mark_stop_delivered', { run_name: runName, stop_name: stopName }),
      'Stop marked delivered.',
    ),
    failStop: (runName, stopName, reason) => mutate(
      () => method('mark_stop_failed', { run_name: runName, stop_name: stopName, failed_reason: reason }),
      'Stop marked failed.',
    ),
    completeRun: runName => mutate(() => method('complete_delivery_run', { run_name: runName }), 'Delivery run completed.'),
    bankCash: (runName, location) => mutate(
      () => method('bank_cash', { run_name: runName, banked_location: location }),
      'Cash handoff recorded.',
    ),
    toggleDriver: driver => mutate(
      () => update('Driver', driver.name, { active: driver.active ? 0 : 1 }),
      `Driver ${driver.active ? 'deactivated' : 'activated'}.`,
    ),
  }

  return {
    session, orders, drivers, runs, dashboard, currentRun, loading, busy, error, notice, authRequired,
    actions, refresh, retry: bootstrap,
    getRun: name => get('Delivery Run', name),
    getOrder: name => get('Delivery Order', name),
    reportError: message => setError(message),
    clearError: () => setError(''),
    clearNotice: () => setNotice(''),
  }
}
