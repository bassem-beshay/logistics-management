<script setup>
import { computed, onMounted, ref } from 'vue'
import { create, get, list, method, update } from './api'
import RunTable from './components/RunTable.vue'

const me = ref({ roles: [] })
const tab = ref('dashboard')
const error = ref('')
const notice = ref('')
const busy = ref(false)
const initialLoading = ref(true)
const orders = ref([])
const drivers = ref([])
const runs = ref([])
const dashboard = ref({})
const selectedRun = ref(null)
const selectedOrder = ref(null)
const dashboardDriver = ref('')
const orderFilters = ref({ status: '', priority: '' })
const orderForm = ref({ customer_name: '', customer_phone: '', address: '', cash_amount: 0, priority: 'Medium' })
const buildForm = ref({ driver: '', orders: [] })

const is = role => me.value.roles.includes(role)
const canDispatch = computed(() => is('Logistics Manager') || is('Logistics Dispatcher'))
const canManage = computed(() => is('Logistics Manager'))
const canDrive = computed(() => is('Logistics Driver'))
const canHandleStops = computed(() => canManage.value || canDrive.value)
const driverOnly = computed(() => canDrive.value && !canDispatch.value)
const navigation = computed(() => driverOnly.value ? ['runs'] : ['dashboard', 'orders', 'drivers', 'runs'])
const availableDrivers = computed(() => drivers.value.filter(driver => driver.active && driver.status === 'Available'))
const openOrders = computed(() => orders.value.filter(order => order.status === 'Open'))
const selectedDriver = computed(() => drivers.value.find(driver => driver.name === buildForm.value.driver))
const selectionOverLimit = computed(() => (
  selectedDriver.value && buildForm.value.orders.length > selectedDriver.value.max_stops_per_run
))
const filteredOrders = computed(() => orders.value.filter(order => (
  (!orderFilters.value.status || order.status === orderFilters.value.status)
  && (!orderFilters.value.priority || order.priority === orderFilters.value.priority)
)))

const clearMessage = () => { error.value = ''; notice.value = '' }

async function loadData({ includeSession = false } = {}) {
  if (includeSession) {
    me.value = await method('me')
    if (!navigation.value.includes(tab.value)) tab.value = navigation.value[0]
  }

  const allRuns = await list('Delivery Run', {}, [
    'name', 'driver', 'run_status', 'total_cash_collected', 'started_date', 'completed_date', 'cash_banked_location',
  ])
  let allOrders = []
  let allDrivers = []
  if (!driverOnly.value) {
    [allOrders, allDrivers] = await Promise.all([
      list('Delivery Order', {}, [
        'name', 'customer_name', 'customer_phone', 'address', 'cash_amount', 'priority', 'status',
        'assigned_driver', 'delivery_run', 'created_date', 'delivered_date',
      ]),
      list('Driver', {}, ['name', 'driver_name', 'phone_number', 'active', 'status', 'max_stops_per_run']),
    ])
  }
  orders.value = allOrders
  drivers.value = allDrivers
  runs.value = allRuns
  if (canDispatch.value) dashboard.value = await method('dashboard')
}

async function perform(fn, success, { refreshRun = false } = {}) {
  clearMessage()
  busy.value = true
  const runName = refreshRun ? selectedRun.value?.name : null
  try {
    const result = await fn()
    if (result === false) return
    await loadData()
    if (runName) selectedRun.value = await get('Delivery Run', runName)
    notice.value = success
    return result
  } catch (reason) {
    error.value = reason.message || 'The operation failed.'
  } finally {
    busy.value = false
  }
}

const submitOrder = () => perform(async () => {
  await create('Delivery Order', orderForm.value)
  orderForm.value = { customer_name: '', customer_phone: '', address: '', cash_amount: 0, priority: 'Medium' }
}, 'Order created')

const buildRun = () => perform(async () => {
  if (selectionOverLimit.value) throw new Error(`This driver accepts at most ${selectedDriver.value.max_stops_per_run} stops.`)
  const result = await method('build_delivery_run', {
    driver: buildForm.value.driver,
    order_names: buildForm.value.orders,
  })
  buildForm.value = { driver: '', orders: [] }
  return result
}, 'Delivery run built')

async function openRun(run) {
  clearMessage()
  try { selectedRun.value = await get('Delivery Run', run.name) }
  catch (reason) { error.value = reason.message }
}

async function openOrder(order) {
  clearMessage()
  try { selectedOrder.value = await get('Delivery Order', order.name) }
  catch (reason) { error.value = reason.message }
}

function prepareRunFromDashboard() {
  clearMessage()
  if (!dashboardDriver.value) {
    error.value = 'Select an available driver first.'
    return
  }
  buildForm.value = { driver: dashboardDriver.value, orders: [] }
  tab.value = 'runs'
  notice.value = 'Driver selected. Choose the Open orders for this run.'
}

const startRun = () => perform(
  () => method('start_delivery_run', { run_name: selectedRun.value.name }),
  'Run started',
  { refreshRun: true },
)

const completeRun = () => perform(
  () => method('complete_delivery_run', { run_name: selectedRun.value.name }),
  'Run completed',
  { refreshRun: true },
)

const bankCash = () => perform(async () => {
  const bankedLocation = prompt('Banking location')?.trim()
  if (!bankedLocation) return false
  return method('bank_cash', { run_name: selectedRun.value.name, banked_location: bankedLocation })
}, 'Cash banked', { refreshRun: true })

const stopAction = (stop, delivered) => perform(async () => {
  const args = { run_name: selectedRun.value.name, stop_name: stop.name }
  if (delivered) return method('mark_stop_delivered', args)
  const failedReason = prompt('Failed reason')?.trim()
  if (!failedReason) return false
  return method('mark_stop_failed', { ...args, failed_reason: failedReason })
}, delivered ? 'Stop delivered' : 'Stop failed', { refreshRun: true })

onMounted(async () => {
  try { await loadData({ includeSession: true }) }
  catch (reason) { error.value = reason.message || 'Unable to load the application.' }
  finally { initialLoading.value = false }
})
</script>

<template>
  <main>
    <header>
      <div><h1>Logistics Operations</h1><small>{{ me.user || 'Loading session…' }}</small></div>
      <nav>
        <button v-for="item in navigation" :key="item" @click="tab = item" :class="{ active: tab === item }">{{ item }}</button>
      </nav>
    </header>

    <p v-if="error" class="message error">{{ error }}</p>
    <p v-if="notice" class="message success">{{ notice }}</p>
    <p v-if="initialLoading" class="loading">Loading operations…</p>

    <template v-else>
      <section v-if="tab === 'dashboard' && canDispatch">
        <div class="cards">
          <article><b>{{ dashboard.open_orders || 0 }}</b>Open orders</article>
          <article><b>{{ dashboard.active_drivers || 0 }}</b>Active drivers</article>
          <article><b>{{ dashboard.runs_en_route || 0 }}</b>Runs en route</article>
          <article><b>{{ dashboard.cash_collected_today || 0 }}</b>Cash today</article>
        </div>
        <div class="quick-action">
          <div><h2>Build a run</h2><p>Choose an available driver, then select their Open orders.</p></div>
          <select v-model="dashboardDriver">
            <option value="">Select driver</option>
            <option v-for="driver in availableDrivers" :key="driver.name" :value="driver.name">
              {{ driver.driver_name }} ({{ driver.max_stops_per_run }} stops)
            </option>
          </select>
          <button :disabled="busy" @click="prepareRunFromDashboard">Continue</button>
        </div>
        <h2>Active runs</h2>
        <RunTable :runs="dashboard.active_runs || []" @open="openRun" />
      </section>

      <section v-else-if="tab === 'orders' && canDispatch">
        <div class="section-heading"><h2>Orders</h2><span>{{ filteredOrders.length }} shown</span></div>
        <form @submit.prevent="submitOrder" class="form">
          <input v-model="orderForm.customer_name" placeholder="Customer name" required>
          <input v-model="orderForm.customer_phone" placeholder="Phone">
          <input v-model="orderForm.address" placeholder="Address" required>
          <input v-model.number="orderForm.cash_amount" type="number" min="0" step="0.01" placeholder="Cash" required>
          <select v-model="orderForm.priority"><option>High</option><option>Medium</option><option>Low</option></select>
          <button :disabled="busy">Create order</button>
        </form>
        <div class="filters">
          <select v-model="orderFilters.status">
            <option value="">All statuses</option>
            <option v-for="status in ['Open', 'Assigned', 'En Route', 'Delivered', 'Failed', 'Cash Banked']" :key="status">{{ status }}</option>
          </select>
          <select v-model="orderFilters.priority">
            <option value="">All priorities</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <button class="secondary" @click="orderFilters = { status: '', priority: '' }">Clear filters</button>
        </div>
        <div class="table-wrap">
          <table><thead><tr><th>Order</th><th>Customer</th><th>Priority</th><th>Cash</th><th>Status</th><th></th></tr></thead>
            <tbody><tr v-for="order in filteredOrders" :key="order.name"><td>{{ order.name }}</td><td>{{ order.customer_name }}</td><td><span class="badge">{{ order.priority }}</span></td><td>{{ order.cash_amount }}</td><td><span class="badge">{{ order.status }}</span></td><td><button class="secondary" @click="openOrder(order)">Details</button></td></tr></tbody>
          </table>
        </div>
      </section>

      <section v-else-if="tab === 'drivers' && canDispatch">
        <h2>Drivers</h2>
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Max stops</th><th>Status</th><th>Action</th></tr></thead>
          <tbody><tr v-for="driver in drivers" :key="driver.name"><td>{{ driver.driver_name }}</td><td>{{ driver.phone_number }}</td><td>{{ driver.max_stops_per_run }}</td><td><span class="badge">{{ driver.status }}</span></td><td><button :disabled="busy || driver.status === 'On Run'" @click="perform(() => update('Driver', driver.name, { active: driver.active ? 0 : 1 }), 'Driver updated')">{{ driver.active ? 'Deactivate' : 'Activate' }}</button></td></tr></tbody>
        </table></div>
      </section>

      <section v-else-if="tab === 'runs'">
        <h2>{{ driverOnly ? 'My delivery runs' : 'Delivery runs' }}</h2>
        <form v-if="canDispatch" @submit.prevent="buildRun" class="form run-builder">
          <select v-model="buildForm.driver" required>
            <option value="">Select driver</option>
            <option v-for="driver in availableDrivers" :key="driver.name" :value="driver.name">{{ driver.driver_name }} ({{ driver.max_stops_per_run }} stops)</option>
          </select>
          <select v-model="buildForm.orders" multiple required>
            <option v-for="order in openOrders" :key="order.name" :value="order.name">{{ order.name }} — {{ order.customer_name }}</option>
          </select>
          <span v-if="selectedDriver" :class="{ warning: selectionOverLimit }">{{ buildForm.orders.length }}/{{ selectedDriver.max_stops_per_run }} stops selected</span>
          <button :disabled="busy || selectionOverLimit">Build run</button>
        </form>
        <RunTable :runs="runs" @open="openRun" />
      </section>
    </template>

    <section v-if="selectedRun" class="drawer" aria-label="Delivery run details">
      <button class="close secondary" @click="selectedRun = null">×</button>
      <h2>{{ selectedRun.name }} <span class="badge">{{ selectedRun.run_status }}</span></h2>
      <p>Driver: {{ selectedRun.driver }} · Cash: {{ selectedRun.total_cash_collected }}</p>
      <div class="actions">
        <button v-if="canDispatch && selectedRun.run_status === 'Assigned'" :disabled="busy" @click="startRun">Start run</button>
        <button v-if="canHandleStops && selectedRun.run_status === 'En Route' && selectedRun.delivery_stops.every(stop => ['Delivered', 'Failed'].includes(stop.stop_status))" :disabled="busy" @click="completeRun">Complete run</button>
        <button v-if="canManage && selectedRun.run_status === 'Completed'" :disabled="busy" @click="bankCash">Bank cash</button>
      </div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Customer</th><th>Address</th><th>Cash</th><th>Status</th><th></th></tr></thead>
        <tbody><tr v-for="stop in selectedRun.delivery_stops" :key="stop.name"><td>{{ stop.stop_sequence }}</td><td>{{ stop.customer_name }}</td><td>{{ stop.address }}</td><td>{{ stop.cash_amount }}</td><td><span class="badge">{{ stop.stop_status }}</span><small v-if="stop.failed_reason"> {{ stop.failed_reason }}</small></td><td v-if="canHandleStops && stop.stop_status === 'En Route'"><button :disabled="busy" @click="stopAction(stop, true)">Delivered</button> <button class="danger" :disabled="busy" @click="stopAction(stop, false)">Failed</button></td></tr></tbody>
      </table></div>
    </section>

    <section v-if="selectedOrder" class="drawer order-drawer" aria-label="Order details">
      <button class="close secondary" @click="selectedOrder = null">×</button>
      <h2>{{ selectedOrder.name }} <span class="badge">{{ selectedOrder.status }}</span></h2>
      <dl>
        <dt>Customer</dt><dd>{{ selectedOrder.customer_name }}</dd>
        <dt>Phone</dt><dd>{{ selectedOrder.customer_phone || '—' }}</dd>
        <dt>Address</dt><dd>{{ selectedOrder.address }}</dd>
        <dt>Priority</dt><dd>{{ selectedOrder.priority }}</dd>
        <dt>Cash</dt><dd>{{ selectedOrder.cash_amount }}</dd>
        <dt>Driver</dt><dd>{{ selectedOrder.assigned_driver || 'Unassigned' }}</dd>
        <dt>Delivery run</dt><dd>{{ selectedOrder.delivery_run || '—' }}</dd>
        <dt>Created</dt><dd>{{ selectedOrder.created_date }}</dd>
        <dt>Delivered</dt><dd>{{ selectedOrder.delivered_date || '—' }}</dd>
      </dl>
    </section>
  </main>
</template>
