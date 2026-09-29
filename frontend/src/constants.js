export const NAV_ITEMS = {
  dashboard: 'Overview',
  orders: 'Orders',
  runs: 'Delivery runs',
  drivers: 'Drivers',
}

export const ORDER_STATUSES = ['Open', 'Assigned', 'En Route', 'Delivered', 'Failed', 'Cash Banked']
export const PRIORITIES = ['High', 'Medium', 'Low']
export const EMPTY_ORDER = { customer_name: '', customer_phone: '', address: '', cash_amount: 0, priority: 'Medium' }
export const EMPTY_RUN = { driver: '', orders: [] }
