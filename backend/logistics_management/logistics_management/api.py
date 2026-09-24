import json

import frappe
from frappe import _
from frappe.sessions import get_csrf_token
from frappe.utils import flt, now_datetime

from logistics_management.exceptions import LogisticsValidationError

MANAGER = "Logistics Manager"
DISPATCHER = "Logistics Dispatcher"
DRIVER = "Logistics Driver"
LOCKABLE_DOCTYPES = {"Driver", "Delivery Order", "Delivery Run"}


def _business_error(message):
    frappe.throw(message, LogisticsValidationError)


@frappe.whitelist()
def me():
    roles = frappe.get_roles()
    return {
        "user": frappe.session.user,
        "roles": [role for role in (MANAGER, DISPATCHER, DRIVER) if role in roles],
        "csrf_token": get_csrf_token(),
    }


def _require(*roles):
    if not set(roles).intersection(frappe.get_roles()):
        frappe.throw(_("You are not authorized to perform this action."), frappe.PermissionError)


def _names(value):
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except (TypeError, json.JSONDecodeError):
            _business_error(_("Order names must be a valid list."))

    if not isinstance(value, list) or not value:
        _business_error(_("Select at least one open order."))
    if any(not isinstance(name, str) or not name.strip() for name in value):
        _business_error(_("Every selected order must have a valid name."))

    names = [name.strip() for name in value]
    if len(names) != len(set(names)):
        _business_error(_("An order can only appear once in a run."))
    return names


def _lock_doc(doctype, name):
    if doctype not in LOCKABLE_DOCTYPES:
        raise ValueError(f"Unsupported lock doctype: {doctype}")

    rows = frappe.db.sql(f"select name from `tab{doctype}` where name=%s for update", name)
    if not rows:
        frappe.throw(_("{0} {1} does not exist.").format(doctype, name), frappe.DoesNotExistError)
    return frappe.get_doc(doctype, name)


def _lock_orders(order_names):
    if not order_names:
        return {}

    placeholders = ", ".join(["%s"] * len(order_names))
    rows = frappe.db.sql(
        "select name from `tabDelivery Order` "
        f"where name in ({placeholders}) order by name for update",
        order_names,
        as_dict=True,
    )
    if len(rows) != len(order_names):
        _business_error(_("One or more selected orders do not exist."))
    return {row.name: frappe.get_doc("Delivery Order", row.name) for row in rows}


def _save_transition(doc):
    doc.flags.logistics_transition = True
    return doc.save(ignore_permissions=True)


def _insert_transition(doc):
    doc.flags.logistics_transition = True
    return doc.insert(ignore_permissions=True)


def _driver_for_current_user():
    driver = frappe.db.get_value("Driver", {"user": frappe.session.user, "active": 1}, "name")
    if not driver:
        frappe.throw(_("No active Driver record is linked to your user."), frappe.PermissionError)
    return driver


def _assert_run_access(run, permitted_roles):
    roles = set(frappe.get_roles())
    _require(*permitted_roles)
    if MANAGER in roles:
        return
    if DRIVER in roles and run.driver != _driver_for_current_user():
        frappe.throw(_("This run is not assigned to you."), frappe.PermissionError)


def _assert_order_assignment(order, run, expected_status):
    if (
        order.status != expected_status
        or order.delivery_run != run.name
        or order.assigned_driver != run.driver
    ):
        _business_error(
            _("Order {0} is not consistently assigned to this run as {1}.").format(
                order.name, expected_status
            )
        )


@frappe.whitelist(methods=["POST"])
def build_delivery_run(driver, order_names):
    _require(MANAGER, DISPATCHER)
    order_names = _names(order_names)
    driver_doc = _lock_doc("Driver", driver)

    if not driver_doc.active or driver_doc.status != "Available":
        _business_error(_("Driver must be active and Available."))
    if driver_doc.max_stops_per_run <= 0:
        _business_error(_("Driver maximum stops per run must be greater than zero."))
    if len(order_names) > driver_doc.max_stops_per_run:
        _business_error(
            _("Selected orders exceed the driver's maximum of {0} stops.").format(
                driver_doc.max_stops_per_run
            )
        )
    if frappe.db.exists(
        "Delivery Run", {"driver": driver, "run_status": ["in", ["Assigned", "En Route"]]}
    ):
        _business_error(_("Driver already has an active or assigned run."))

    orders = _lock_orders(order_names)
    if any(orders[name].status != "Open" for name in order_names):
        _business_error(_("Only existing Open orders may be assigned."))

    run = frappe.get_doc(
        {"doctype": "Delivery Run", "driver": driver, "run_status": "Assigned"}
    )
    for sequence, order_name in enumerate(order_names, start=1):
        order = orders[order_name]
        run.append(
            "delivery_stops",
            {
                "related_order": order.name,
                "stop_sequence": sequence,
                "customer_name": order.customer_name,
                "address": order.address,
                "cash_amount": order.cash_amount,
                "stop_status": "Assigned",
            },
        )
    _insert_transition(run)

    for order_name in order_names:
        order = orders[order_name]
        order.status = "Assigned"
        order.assigned_driver = driver
        order.delivery_run = run.name
        _save_transition(order)

    return {"run": run.name, "run_status": run.run_status, "stops": len(run.delivery_stops)}


@frappe.whitelist(methods=["POST"])
def start_delivery_run(run_name):
    _require(MANAGER, DISPATCHER)
    run = _lock_doc("Delivery Run", run_name)
    if run.run_status != "Assigned":
        _business_error(_("Only an Assigned run can be started."))
    if not run.delivery_stops:
        _business_error(_("A run requires at least one delivery stop."))

    driver = _lock_doc("Driver", run.driver)
    if not driver.active or driver.status != "Available":
        _business_error(_("Driver is not available to start this run."))

    order_names = [stop.related_order for stop in run.delivery_stops]
    orders = _lock_orders(order_names)
    for order_name in order_names:
        _assert_order_assignment(orders[order_name], run, "Assigned")

    started_at = now_datetime()
    run.run_status = "En Route"
    run.started_date = started_at
    for stop in run.delivery_stops:
        stop.stop_status = "En Route"
    _save_transition(run)

    for order in orders.values():
        order.status = "En Route"
        _save_transition(order)

    driver.status = "On Run"
    _save_transition(driver)
    return {"run": run.name, "run_status": run.run_status}


def _get_en_route_stop(run_name, stop_name):
    run = _lock_doc("Delivery Run", run_name)
    _assert_run_access(run, (MANAGER, DRIVER))
    if run.run_status != "En Route":
        _business_error(_("Stops may only be updated while a run is En Route."))

    stop = next((row for row in run.delivery_stops if row.name == stop_name), None)
    if not stop or stop.stop_status != "En Route":
        _business_error(_("Stop is not available for an outcome update."))

    order = _lock_doc("Delivery Order", stop.related_order)
    _assert_order_assignment(order, run, "En Route")
    return run, stop, order


@frappe.whitelist(methods=["POST"])
def mark_stop_delivered(run_name, stop_name):
    run, stop, order = _get_en_route_stop(run_name, stop_name)
    delivered_at = now_datetime()
    stop.stop_status = "Delivered"
    stop.delivered_date = delivered_at
    stop.failed_reason = None
    run.total_cash_collected = sum(
        flt(row.cash_amount) for row in run.delivery_stops if row.stop_status == "Delivered"
    )
    _save_transition(run)

    order.status = "Delivered"
    order.delivered_date = delivered_at
    _save_transition(order)
    return {
        "run": run.name,
        "stop": stop.name,
        "stop_status": stop.stop_status,
        "total_cash_collected": run.total_cash_collected,
    }


@frappe.whitelist(methods=["POST"])
def mark_stop_failed(run_name, stop_name, failed_reason):
    if not isinstance(failed_reason, str) or not failed_reason.strip():
        _business_error(_("A failed reason is required."))

    run, stop, order = _get_en_route_stop(run_name, stop_name)
    stop.stop_status = "Failed"
    stop.failed_reason = failed_reason.strip()
    stop.delivered_date = None
    _save_transition(run)

    order.status = "Failed"
    order.delivered_date = None
    _save_transition(order)
    return {"run": run.name, "stop": stop.name, "stop_status": stop.stop_status}


@frappe.whitelist(methods=["POST"])
def complete_delivery_run(run_name):
    run = _lock_doc("Delivery Run", run_name)
    _assert_run_access(run, (MANAGER, DRIVER))
    if run.run_status != "En Route":
        _business_error(_("Only an En Route run can be completed."))
    if not run.delivery_stops or any(
        stop.stop_status not in ("Delivered", "Failed") for stop in run.delivery_stops
    ):
        _business_error(_("Every stop must be Delivered or Failed before completion."))

    driver = _lock_doc("Driver", run.driver)
    if not driver.active or driver.status != "On Run":
        _business_error(_("The assigned driver is not currently On Run."))

    run.run_status = "Completed"
    run.completed_date = now_datetime()
    _save_transition(run)

    driver.status = "Available"
    _save_transition(driver)
    return {"run": run.name, "run_status": run.run_status}


@frappe.whitelist(methods=["POST"])
def bank_cash(run_name, banked_location):
    _require(MANAGER)
    if not isinstance(banked_location, str) or not banked_location.strip():
        _business_error(_("Cash banked location is required."))

    run = _lock_doc("Delivery Run", run_name)
    if run.run_status != "Completed":
        _business_error(_("Only a Completed run can be banked."))

    delivered_names = [
        stop.related_order for stop in run.delivery_stops if stop.stop_status == "Delivered"
    ]
    delivered_orders = _lock_orders(delivered_names)
    for order in delivered_orders.values():
        _assert_order_assignment(order, run, "Delivered")

    run.run_status = "Cash Banked"
    run.cash_banked_date = now_datetime()
    run.cash_banked_location = banked_location.strip()
    _save_transition(run)

    for order in delivered_orders.values():
        order.status = "Cash Banked"
        _save_transition(order)
    return {"run": run.name, "run_status": run.run_status, "banked_cash": run.total_cash_collected}


@frappe.whitelist()
def dashboard():
    _require(MANAGER, DISPATCHER)
    today = frappe.utils.today()
    return {
        "open_orders": frappe.db.count("Delivery Order", {"status": "Open"}),
        "active_drivers": frappe.db.count("Driver", {"active": 1, "status": ["!=", "Inactive"]}),
        "runs_en_route": frappe.db.count("Delivery Run", {"run_status": "En Route"}),
        "cash_collected_today": frappe.db.sql(
            "select coalesce(sum(total_cash_collected), 0) "
            "from `tabDelivery Run` where date(completed_date)=%s",
            today,
        )[0][0],
        "active_runs": frappe.get_all(
            "Delivery Run",
            filters={"run_status": ["in", ["Assigned", "En Route"]]},
            fields=[
                "name",
                "driver",
                "run_status",
                "total_cash_collected",
                "started_date",
            ],
            order_by="modified desc",
        ),
    }
