import frappe

DRIVER_ROLE = "Logistics Driver"
PRIVILEGED_ROLES = {"Logistics Manager", "Logistics Dispatcher"}


def _is_driver_only(user):
    roles = set(frappe.get_roles(user))
    return DRIVER_ROLE in roles and not roles.intersection(PRIVILEGED_ROLES)


def _driver_for_user(user):
    return frappe.db.get_value("Driver", {"user": user, "active": 1}, "name")


def delivery_run_query(user):
    if not _is_driver_only(user):
        return None
    driver = _driver_for_user(user)
    return "1=0" if not driver else "`tabDelivery Run`.driver = {0}".format(frappe.db.escape(driver))


def delivery_order_query(user):
    if not _is_driver_only(user):
        return None
    driver = _driver_for_user(user)
    return "1=0" if not driver else "`tabDelivery Order`.assigned_driver = {0}".format(frappe.db.escape(driver))


def delivery_run_permission(doc, user=None, permission_type=None):
    user = user or frappe.session.user
    if not _is_driver_only(user):
        return None
    return doc.driver == _driver_for_user(user)


def delivery_stop_permission(doc, user=None, permission_type=None):
    user = user or frappe.session.user
    if not _is_driver_only(user):
        return None
    return frappe.db.get_value("Delivery Run", doc.parent, "driver") == _driver_for_user(user)
