import frappe


def after_install():
    for role_name in ("Logistics Manager", "Logistics Dispatcher", "Logistics Driver"):
        if not frappe.db.exists("Role", role_name):
            frappe.get_doc({"doctype": "Role", "role_name": role_name, "desk_access": 1}).insert(ignore_permissions=True)
