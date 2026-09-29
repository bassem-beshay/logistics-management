import { useMemo, useState } from 'react'
import ActionDialog from '../components/ActionDialog'
import AppShell from '../components/AppShell'
import CreateOrderDialog from '../components/CreateOrderDialog'
import Feedback from '../components/Feedback'
import OrderDrawer from '../components/OrderDrawer'
import RunDrawer from '../components/RunDrawer'
import DriversPage from '../pages/DriversPage'
import OrdersPage from '../pages/OrdersPage'
import OverviewPage from '../pages/OverviewPage'
import RunsPage from '../pages/RunsPage'

const tabFromPath = path => path.split('/')[2] || 'dashboard'
const pathFromTab = tab => tab === 'dashboard' ? '/admin' : `/admin/${tab}`

export default function AdminExperience({ logistics, path, navigate }) {
  const tab = tabFromPath(path)
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [plannerDriver, setPlannerDriver] = useState('')
  const [selectedRun, setSelectedRun] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [actionDialog, setActionDialog] = useState(null)
  const availableDrivers = useMemo(() => logistics.drivers.filter(driver => driver.active && driver.status === 'Available'), [logistics.drivers])
  const openOrders = useMemo(() => logistics.orders.filter(order => order.status === 'Open'), [logistics.orders])

  const go = nextTab => navigate(pathFromTab(nextTab))
  const openPlanner = (driver = '') => { setPlannerDriver(driver); setPlannerOpen(true); go('runs') }

  async function openRun(run) {
    logistics.clearError()
    try { setSelectedRun(await logistics.getRun(run.name)) }
    catch (reason) { logistics.reportError(reason.message || 'Unable to open this delivery run.') }
  }

  async function openOrder(order) {
    logistics.clearError()
    try { setSelectedOrder(await logistics.getOrder(order.name)) }
    catch (reason) { logistics.reportError(reason.message || 'Unable to open this delivery order.') }
  }

  async function mutateRun(operation) {
    const runName = selectedRun?.name
    const result = await operation()
    if (result !== false && runName) {
      try { setSelectedRun(await logistics.getRun(runName)) }
      catch { setSelectedRun(null) }
    }
    return result
  }

  async function confirmAction(value) {
    if (!actionDialog || !selectedRun) return
    const result = actionDialog.type === 'failure'
      ? await mutateRun(() => logistics.actions.failStop(selectedRun.name, actionDialog.stop.name, value))
      : await mutateRun(() => logistics.actions.bankCash(selectedRun.name, value))
    if (result !== false) setActionDialog(null)
  }

  return <div className="admin-experience">
    <AppShell tab={tab} navigation={['dashboard', 'orders', 'runs', 'drivers']} session={logistics.session} busy={logistics.busy} onNavigate={go} onRefresh={logistics.refresh}>
      <Feedback error={logistics.error} notice={logistics.notice} onDismissError={logistics.clearError} onDismissNotice={logistics.clearNotice} />
      {tab === 'dashboard' && <OverviewPage dashboard={logistics.dashboard} orders={logistics.orders} drivers={logistics.drivers} runs={logistics.runs} onCreateOrder={() => setCreateOrderOpen(true)} onPlanRun={() => openPlanner()} onNavigate={go} onOpenOrder={openOrder} onOpenRun={openRun} />}
      {tab === 'orders' && <OrdersPage orders={logistics.orders} onCreateOrder={() => setCreateOrderOpen(true)} onOpenOrder={openOrder} />}
      {tab === 'drivers' && <DriversPage drivers={logistics.drivers} busy={logistics.busy} onToggle={logistics.actions.toggleDriver} />}
      {tab === 'runs' && <RunsPage runs={logistics.runs} openOrders={openOrders} availableDrivers={availableDrivers} canDispatch plannerOpen={plannerOpen} plannerDriver={plannerDriver} busy={logistics.busy} onOpenPlanner={() => setPlannerOpen(true)} onClosePlanner={() => setPlannerOpen(false)} onBuildRun={async (driver, orders) => { const result = await logistics.actions.buildRun(driver, orders); if (result !== false) setPlannerOpen(false); return result }} onOpenRun={openRun} />}
    </AppShell>
    <CreateOrderDialog open={createOrderOpen} busy={logistics.busy} onClose={() => setCreateOrderOpen(false)} onSubmit={logistics.actions.createOrder} />
    <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    <RunDrawer run={selectedRun} permissions={{ canDispatch: true, canManage: true, canHandleStops: true }} busy={logistics.busy} onClose={() => setSelectedRun(null)} onStart={() => mutateRun(() => logistics.actions.startRun(selectedRun.name))} onDeliver={stop => mutateRun(() => logistics.actions.deliverStop(selectedRun.name, stop.name))} onFail={stop => setActionDialog({ type: 'failure', stop })} onComplete={() => mutateRun(() => logistics.actions.completeRun(selectedRun.name))} onBank={() => setActionDialog({ type: 'bank' })} />
    <ActionDialog config={actionDialog} busy={logistics.busy} onClose={() => setActionDialog(null)} onConfirm={confirmAction} />
  </div>
}
