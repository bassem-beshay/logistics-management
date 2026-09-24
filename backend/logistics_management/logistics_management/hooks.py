app_name = "logistics_management"
app_title = "Logistics Management"
app_publisher = "Logistics Team"
app_description = "Delivery orders, runs, stops, and cash banking"
app_email = "ops@example.com"
app_license = "MIT"
after_install = "logistics_management.install.after_install"

permission_query_conditions = {
    "Delivery Run": "logistics_management.permissions.delivery_run_query",
    "Delivery Order": "logistics_management.permissions.delivery_order_query",
}
has_permission = {
    "Delivery Run": "logistics_management.permissions.delivery_run_permission",
    "Delivery Stop": "logistics_management.permissions.delivery_stop_permission",
}
